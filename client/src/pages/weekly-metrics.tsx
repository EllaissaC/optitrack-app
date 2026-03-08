import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface DayEntry {
  comps: string;
  orders: string;
  followUps: string;
}

type DailyData = Record<DayKey, DayEntry>;

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function emptyDailyData(): DailyData {
  return DAY_KEYS.reduce((acc, d) => {
    acc[d] = { comps: "", orders: "", followUps: "" };
    return acc;
  }, {} as DailyData);
}

function parseNum(v: string): number {
  const n = parseInt(v, 10);
  return isNaN(n) || n < 0 ? 0 : n;
}

function sumField(data: DailyData, field: keyof DayEntry): number {
  return DAY_KEYS.reduce((acc, d) => acc + parseNum(data[d][field]), 0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  weekStarting: z.string().min(1, "Week starting date is required"),
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
            {subtitle && !loading && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
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

// ─── DailyInput ───────────────────────────────────────────────────────────────
// Defined outside the page component so React never remounts it mid-typing.
// Uses local state while the user types; commits to parent only on blur or Enter.
function DailyInput({
  value,
  onCommit,
  testId,
}: {
  value: string;
  onCommit: (v: string) => void;
  testId: string;
}) {
  const [local, setLocal] = useState(value);
  const committed = useRef(value);

  // Sync local state when parent resets (e.g., after successful save)
  useEffect(() => {
    if (value !== committed.current) {
      setLocal(value);
      committed.current = value;
    }
  }, [value]);

  function commit(v: string) {
    if (v !== committed.current) {
      onCommit(v);
      committed.current = v;
    }
  }

  return (
    <input
      type="number"
      min={0}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => commit(local)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(local);
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      className="w-full h-8 px-2 text-sm text-center tabular-nums rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      placeholder="—"
      data-testid={testId}
    />
  );
}

// ─── Daily breakdown row (expandable in history) ──────────────────────────────

function DailyBreakdownRow({ dailyDataJson }: { dailyDataJson: string }) {
  let parsed: DailyData | null = null;
  try {
    parsed = JSON.parse(dailyDataJson);
  } catch {
    return null;
  }
  if (!parsed) return null;

  return (
    <div className="px-5 pb-4 pt-0">
      <div className="rounded-md border border-border overflow-hidden bg-muted/20">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-28">Day</th>
              <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">Comp Exams</th>
              <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">Orders</th>
              <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">Follow Ups</th>
            </tr>
          </thead>
          <tbody>
            {DAY_KEYS.map((day) => {
              const entry = parsed![day];
              const c = parseNum(entry.comps);
              const o = parseNum(entry.orders);
              const f = parseNum(entry.followUps);
              if (c === 0 && o === 0 && f === 0) return null;
              return (
                <tr key={day} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-1.5 text-foreground font-medium">{DAY_LABELS[day]}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{c || "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{o || "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{f || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WeeklyMetricsPage() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<DailyData>(emptyDailyData);

  const { data: metrics = [], isLoading } = useQuery<WeeklyMetric[]>({
    queryKey: ["/api/weekly-metrics"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { weekStarting: "" },
  });

  // ── Computed totals from daily data ──
  const totalComps = sumField(dailyData, "comps");
  const totalOrders = sumField(dailyData, "orders");
  const totalFollowUps = sumField(dailyData, "followUps");

  const liveSchedulingRate = calcRate(totalFollowUps, totalComps);
  const liveCaptureRate = calcRate(totalOrders, totalComps);

  function setDay(day: DayKey, field: keyof DayEntry, value: string) {
    setDailyData((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiRequest("POST", "/api/weekly-metrics", {
        weekStarting: values.weekStarting,
        totalComprehensiveExams: totalComps,
        followUps: totalFollowUps,
        totalOpticalOrders: totalOrders,
        dailyData: JSON.stringify(dailyData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-metrics"] });
      toast({ title: "Weekly metrics saved" });
      form.reset({ weekStarting: "" });
      setDailyData(emptyDailyData());
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
    if (totalComps === 0 && totalOrders === 0 && totalFollowUps === 0) {
      toast({ title: "Please enter at least one daily value before saving", variant: "destructive" });
      return;
    }
    saveMutation.mutate(values);
  }

  // ── Summary stats ──
  const mostRecentMetric = metrics[0];
  const avgSchedulingRate =
    metrics.length > 0
      ? metrics.reduce((acc, m) => {
          const r = calcRate(m.followUps, m.totalComprehensiveExams);
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
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5" data-testid="text-weekly-metrics-title">
          <BarChart2 className="w-6 h-6 text-primary" />
          Weekly Metrics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter daily numbers — totals calculate automatically
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

      {/* ── Entry form ───────────────────────────────────────────────────────── */}
      <Card className="border-card-border">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-primary" />
            Enter Weekly Data
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Week Starting Date */}
              <div className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name="weekStarting"
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        Week Starting Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-week-starting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground pb-1">
                  Enter daily numbers below — totals are auto-calculated.
                </p>
              </div>

              {/* Daily entry grid */}
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                        Day
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <span className="flex items-center justify-center gap-1">
                          <ClipboardList className="w-3 h-3" /> Comp Exams
                        </span>
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <span className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Optical Orders
                        </span>
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <span className="flex items-center justify-center gap-1">
                          <Target className="w-3 h-3" /> Follow Ups / NY
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAY_KEYS.map((day, i) => (
                      <tr
                        key={day}
                        className={`border-b border-border/60 last:border-0 ${
                          i >= 5 ? "bg-muted/10" : ""
                        }`}
                        data-testid={`row-day-${day}`}
                      >
                        <td className="px-4 py-2">
                          <span className={`text-sm font-medium ${i >= 5 ? "text-muted-foreground" : "text-foreground"}`}>
                            {DAY_LABELS[day]}
                            {i >= 5 && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground/70">(opt.)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <DailyInput value={dailyData[day].comps} onCommit={(v) => setDay(day, "comps", v)} testId={`input-${day}-comps`} />
                        </td>
                        <td className="px-3 py-2">
                          <DailyInput value={dailyData[day].orders} onCommit={(v) => setDay(day, "orders", v)} testId={`input-${day}-orders`} />
                        </td>
                        <td className="px-3 py-2">
                          <DailyInput value={dailyData[day].followUps} onCommit={(v) => setDay(day, "followUps", v)} testId={`input-${day}-followups`} />
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-muted/30 border-t-2 border-border">
                      <td className="px-4 py-2.5">
                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Totals</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`text-sm font-bold tabular-nums ${totalComps > 0 ? "text-foreground" : "text-muted-foreground"}`}
                          data-testid="text-total-comps"
                        >
                          {totalComps > 0 ? totalComps : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`text-sm font-bold tabular-nums ${totalOrders > 0 ? "text-foreground" : "text-muted-foreground"}`}
                          data-testid="text-total-orders"
                        >
                          {totalOrders > 0 ? totalOrders : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`text-sm font-bold tabular-nums ${totalFollowUps > 0 ? "text-foreground" : "text-muted-foreground"}`}
                          data-testid="text-total-followups"
                        >
                          {totalFollowUps > 0 ? totalFollowUps : "—"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Live rate preview */}
              {totalComps > 0 && (
                <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Calculated Rates
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Scheduling Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {totalFollowUps} ÷ {totalComps} × 100
                      </span>
                      <RateBadge rate={liveSchedulingRate} label="scheduling-live" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Capture Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {totalOrders} ÷ {totalComps} × 100
                      </span>
                      <RateBadge rate={liveCaptureRate} label="capture-live" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={saveMutation.isPending}
                data-testid="button-save-metrics"
                onClick={() => (document.activeElement as HTMLElement)?.blur()}
              >
                {saveMutation.isPending ? "Saving..." : "Save Week"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── History table ─────────────────────────────────────────────────────── */}
      <Card className="border-card-border">
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
              <p className="text-xs mt-1">Use the form above to record your first week</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold pl-5">Week</TableHead>
                    <TableHead className="font-semibold text-right">Exams</TableHead>
                    <TableHead className="font-semibold text-right">Follow Ups</TableHead>
                    <TableHead className="font-semibold text-right">Orders</TableHead>
                    <TableHead className="font-semibold text-center">Scheduling Rate</TableHead>
                    <TableHead className="font-semibold text-center">Capture Rate</TableHead>
                    <TableHead className="pr-5 text-right font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((m) => {
                    const schedulingRate = calcRate(m.followUps, m.totalComprehensiveExams);
                    const captureRate = calcRate(m.totalOpticalOrders, m.totalComprehensiveExams);
                    const hasDailyData = !!m.dailyData;
                    const isExpanded = expandedRow === m.id;
                    return (
                      <>
                        <TableRow
                          key={m.id}
                          className="hover:bg-muted/30 transition-colors"
                          data-testid={`row-metric-${m.id}`}
                        >
                          <TableCell className="pl-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-foreground">
                                {formatWeekDate(m.weekStarting)}
                              </p>
                              {hasDailyData && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedRow(isExpanded ? null : m.id)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  data-testid={`button-expand-daily-${m.id}`}
                                  title="View daily breakdown"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm py-3.5 tabular-nums" data-testid={`text-exams-${m.id}`}>
                            {m.totalComprehensiveExams}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground py-3.5 tabular-nums" data-testid={`text-followups-${m.id}`}>
                            {m.followUps}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3.5 tabular-nums" data-testid={`text-orders-${m.id}`}>
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
                        {isExpanded && hasDailyData && (
                          <TableRow key={`${m.id}-expanded`} className="bg-muted/10 hover:bg-muted/10">
                            <TableCell colSpan={7} className="p-0">
                              <DailyBreakdownRow dailyDataJson={m.dailyData!} />
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
