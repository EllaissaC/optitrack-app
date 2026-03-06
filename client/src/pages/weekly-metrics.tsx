import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart2,
  CalendarDays,
  ClipboardList,
  Target,
  TrendingUp,
  Trash2,
  PlusCircle,
  Eye,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WeeklyMetric } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  weekStarting: z.string().min(1, "Week starting date is required"),
  totalComprehensiveExams: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Cannot be negative"),
  followUps: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Cannot be negative"),
  scheduledAppointments: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Cannot be negative"),
  totalOpticalOrders: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

function calcRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

function RateBadge({ rate, label }: { rate: number | null; label: string }) {
  if (rate === null) return <span className="text-xs text-muted-foreground">—</span>;
  const color =
    rate >= 80
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : rate >= 60
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return (
    <Badge className={`${color} border-0 font-semibold tabular-nums`} data-testid={`badge-rate-${label}`}>
      {rate.toFixed(1)}%
    </Badge>
  );
}

function MetricStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-card-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${bgColor} flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function WeeklyMetricsPage() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: metrics = [], isLoading } = useQuery<WeeklyMetric[]>({
    queryKey: ["/api/weekly-metrics"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekStarting: "",
      totalComprehensiveExams: "" as unknown as number,
      followUps: "" as unknown as number,
      scheduledAppointments: "" as unknown as number,
      totalOpticalOrders: "" as unknown as number,
    },
  });

  const watchedExams = form.watch("totalComprehensiveExams");
  const watchedScheduled = form.watch("scheduledAppointments");
  const watchedOrders = form.watch("totalOpticalOrders");

  const examsNum = Number(watchedExams) || 0;
  const liveSchedulingRate = calcRate(Number(watchedScheduled) || 0, examsNum);
  const liveCaptureRate = calcRate(Number(watchedOrders) || 0, examsNum);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiRequest("POST", "/api/weekly-metrics", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-metrics"] });
      toast({ title: "Weekly metrics saved" });
      form.reset({
        weekStarting: "",
        totalComprehensiveExams: "" as unknown as number,
        followUps: "" as unknown as number,
        scheduledAppointments: "" as unknown as number,
        totalOpticalOrders: "" as unknown as number,
      });
    },
    onError: () => {
      toast({ title: "Failed to save metrics", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/weekly-metrics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-metrics"] });
      toast({ title: "Entry deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values);
  }

  const mostRecentMetric = metrics[0];
  const avgSchedulingRate =
    metrics.length > 0
      ? metrics.reduce((acc, m) => {
          const r = calcRate(m.scheduledAppointments, m.totalComprehensiveExams);
          return acc + (r ?? 0);
        }, 0) / metrics.length
      : null;
  const avgCaptureRate =
    metrics.length > 0
      ? metrics.reduce((acc, m) => {
          const r = calcRate(m.totalOpticalOrders, m.totalComprehensiveExams);
          return acc + (r ?? 0);
        }, 0) / metrics.length
      : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <BarChart2 className="w-6 h-6 text-primary" />
          Weekly Metrics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track optical performance week over week
        </p>
      </div>

      {/* Summary stat cards */}
      {!isLoading && metrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricStatCard
            title="Weeks Tracked"
            value={String(metrics.length)}
            icon={CalendarDays}
            iconColor="text-violet-600 dark:text-violet-400"
            bgColor="bg-violet-100 dark:bg-violet-900/30"
          />
          <MetricStatCard
            title="Avg Scheduling Rate"
            value={avgSchedulingRate !== null ? `${avgSchedulingRate.toFixed(1)}%` : "—"}
            subtitle="Across all recorded weeks"
            icon={Target}
            iconColor="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
          />
          <MetricStatCard
            title="Avg Capture Rate"
            value={avgCaptureRate !== null ? `${avgCaptureRate.toFixed(1)}%` : "—"}
            subtitle="Across all recorded weeks"
            icon={TrendingUp}
            iconColor="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <MetricStatCard
            title="Most Recent Week"
            value={mostRecentMetric ? formatWeekDate(mostRecentMetric.weekStarting) : "—"}
            icon={Eye}
            iconColor="text-slate-600 dark:text-slate-400"
            bgColor="bg-slate-100 dark:bg-slate-800/50"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Entry form */}
        <Card className="border-card-border lg:col-span-2">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Enter Weekly Data
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="weekStarting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        Week Starting Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-week-starting"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalComprehensiveExams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                        Total Comprehensive Exams
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          data-testid="input-total-exams"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                        Follow Ups / Next Year Exams
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          data-testid="input-follow-ups"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledAppointments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-muted-foreground" />
                        Scheduled Appointments
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          data-testid="input-scheduled"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalOpticalOrders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                        Total Optical Orders
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          data-testid="input-optical-orders"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Live calculated rates */}
                {examsNum > 0 && (
                  <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Calculated Rates
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Scheduling Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Number(watchedScheduled) || 0} ÷ {examsNum} × 100
                        </span>
                        <RateBadge rate={liveSchedulingRate} label="scheduling-live" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Capture Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Number(watchedOrders) || 0} ÷ {examsNum} × 100
                        </span>
                        <RateBadge rate={liveCaptureRate} label="capture-live" />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saveMutation.isPending}
                  data-testid="button-save-metrics"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Week"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* History table */}
        <Card className="border-card-border lg:col-span-3">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              Weekly History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isLoading ? (
              <div className="px-5 pb-5 space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : metrics.length === 0 ? (
              <div className="py-14 text-center text-muted-foreground">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="font-medium text-sm">No weekly data yet</p>
                <p className="text-xs mt-1">Use the form to record your first week</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold pl-5">Week</TableHead>
                      <TableHead className="font-semibold text-right">Exams</TableHead>
                      <TableHead className="font-semibold text-right">Follow Ups</TableHead>
                      <TableHead className="font-semibold text-right">Scheduled</TableHead>
                      <TableHead className="font-semibold text-right">Orders</TableHead>
                      <TableHead className="font-semibold text-center">Scheduling Rate</TableHead>
                      <TableHead className="font-semibold text-center">Capture Rate</TableHead>
                      <TableHead className="pr-5 text-right font-semibold"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((m) => {
                      const schedulingRate = calcRate(m.scheduledAppointments, m.totalComprehensiveExams);
                      const captureRate = calcRate(m.totalOpticalOrders, m.totalComprehensiveExams);
                      return (
                        <TableRow
                          key={m.id}
                          className="hover:bg-muted/30 transition-colors"
                          data-testid={`row-metric-${m.id}`}
                        >
                          <TableCell className="pl-5 py-3.5">
                            <p className="font-medium text-sm text-foreground">
                              {formatWeekDate(m.weekStarting)}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-sm py-3.5" data-testid={`text-exams-${m.id}`}>
                            {m.totalComprehensiveExams}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground py-3.5" data-testid={`text-followups-${m.id}`}>
                            {m.followUps}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3.5" data-testid={`text-scheduled-${m.id}`}>
                            {m.scheduledAppointments}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3.5" data-testid={`text-orders-${m.id}`}>
                            {m.totalOpticalOrders}
                          </TableCell>
                          <TableCell className="text-center py-3.5">
                            <RateBadge rate={schedulingRate} label={`scheduling-${m.id}`} />
                          </TableCell>
                          <TableCell className="text-center py-3.5">
                            <RateBadge rate={captureRate} label={`capture-${m.id}`} />
                          </TableCell>
                          <TableCell className="pr-5 text-right py-3.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(m.id)}
                              data-testid={`button-delete-metric-${m.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this week's metrics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-testid="button-confirm-delete-metric"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
