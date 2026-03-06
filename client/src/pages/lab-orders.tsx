import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FlaskConical,
  Pencil,
  CheckCircle2,
  Calendar,
  Clock,
  Truck,
  Hash,
  Building2,
  PackageCheck,
  AlertTriangle,
  ShieldCheck,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Frame } from "@shared/schema";
import { VISION_PLAN_OPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function calcDaysAtLab(dateSentToLab: string | null | undefined): number | null {
  if (!dateSentToLab) return null;
  const sent = new Date(dateSentToLab);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  sent.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
}

function DaysAtLabBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (days <= 7) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 font-semibold tabular-nums" data-testid="badge-days-green">
        {days}d
      </Badge>
    );
  }
  if (days <= 13) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-0 font-semibold tabular-nums" data-testid="badge-days-yellow">
        {days}d
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-0 font-semibold tabular-nums" data-testid="badge-days-red">
      {days}d
    </Badge>
  );
}

const editOrderSchema = z.object({
  labOrderNumber: z.string().optional().nullable(),
  labAccountNumber: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  dateSentToLab: z.string().optional().nullable(),
  labName: z.string().optional().nullable(),
  visionPlan: z.string().optional().nullable(),
});

type EditOrderValues = z.infer<typeof editOrderSchema>;

function EditLabOrderDialog({
  frame,
  open,
  onClose,
}: {
  frame: Frame;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const form = useForm<EditOrderValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      labOrderNumber: frame.labOrderNumber ?? "",
      labAccountNumber: frame.labAccountNumber ?? "",
      trackingNumber: frame.trackingNumber ?? "",
      dateSentToLab: frame.dateSentToLab ?? "",
      labName: frame.labName ?? "",
      visionPlan: frame.visionPlan ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: EditOrderValues) =>
      apiRequest("PATCH", `/api/frames/${frame.id}`, {
        ...values,
        labOrderNumber: values.labOrderNumber || null,
        labAccountNumber: values.labAccountNumber || null,
        trackingNumber: values.trackingNumber || null,
        dateSentToLab: values.dateSentToLab || null,
        labName: values.labName || null,
        visionPlan: values.visionPlan || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Lab order updated" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update lab order", variant: "destructive" });
    },
  });

  function onSubmit(values: EditOrderValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Lab Order</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {frame.brand} — {frame.model}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="visionPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Vision Plan
                  </FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-vision-plan">
                        <SelectValue placeholder="Select vision plan..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISION_PLAN_OPTIONS.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Lab Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. HOYA Lab"
                      data-testid="input-edit-lab-name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labOrderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Order Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. ORD-12345"
                      data-testid="input-edit-lab-order-number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Account Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. A12345"
                      data-testid="input-edit-lab-account-number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Tracking Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 1Z999AA1..."
                      data-testid="input-edit-tracking-number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateSentToLab"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date Sent
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-edit-date-sent"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-lab-order">
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MarkReceivedDialog({
  frame,
  open,
  onClose,
}: {
  frame: Frame | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", `/api/frames/${frame!.id}`, {
        status: "on_board",
        dateReceivedFromLab: today,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Frame marked as received and moved back to inventory" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update frame status", variant: "destructive" });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-green-600" />
            Mark as Received
          </AlertDialogTitle>
          <AlertDialogDescription>
            {frame && (
              <>
                Confirm that <span className="font-semibold text-foreground">{frame.brand} {frame.model}</span> has been received from the lab.
                The frame will be moved back to inventory (On Board) and today&apos;s date will be recorded as the received date.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-confirm-received"
          >
            {mutation.isPending ? "Updating..." : "Mark Received"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type DaysFilter = "all" | "0-7" | "8-13" | "14+";

export default function LabOrders() {
  const [editFrame, setEditFrame] = useState<Frame | null>(null);
  const [receiveFrame, setReceiveFrame] = useState<Frame | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLab, setFilterLab] = useState("all");
  const [filterVisionPlan, setFilterVisionPlan] = useState("all");
  const [filterDays, setFilterDays] = useState<DaysFilter>("all");

  const { data: framesData, isLoading } = useQuery<Frame[]>({
    queryKey: ["/api/frames"],
  });

  const { data: labsData = [] } = useQuery<{ id: string; name: string; account: string }[]>({
    queryKey: ["/api/labs"],
  });

  const labFrames = (framesData ?? []).filter((f) => f.status === "at_lab");

  const urgentCount = labFrames.filter((f) => {
    const d = calcDaysAtLab(f.dateSentToLab);
    return d !== null && d >= 14;
  }).length;

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterLab !== "all" ||
    filterVisionPlan !== "all" ||
    filterDays !== "all";

  function clearFilters() {
    setSearchQuery("");
    setFilterLab("all");
    setFilterVisionPlan("all");
    setFilterDays("all");
  }

  const filtered = useMemo(() => {
    return labFrames
      .slice()
      .sort((a, b) => {
        const da = calcDaysAtLab(a.dateSentToLab) ?? -1;
        const db = calcDaysAtLab(b.dateSentToLab) ?? -1;
        return db - da;
      })
      .filter((f) => {
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          if (!(f.labOrderNumber ?? "").toLowerCase().includes(q)) return false;
        }
        if (filterLab !== "all") {
          if ((f.labName ?? "") !== filterLab) return false;
        }
        if (filterVisionPlan !== "all") {
          if ((f.visionPlan ?? "") !== filterVisionPlan) return false;
        }
        if (filterDays !== "all") {
          const days = calcDaysAtLab(f.dateSentToLab);
          if (days === null) return false;
          if (filterDays === "0-7" && days > 7) return false;
          if (filterDays === "8-13" && (days < 8 || days > 13)) return false;
          if (filterDays === "14+" && days < 14) return false;
        }
        return true;
      });
  }, [labFrames, searchQuery, filterLab, filterVisionPlan, filterDays]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-primary" />
            Lab Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Frames currently at the lab
          </p>
        </div>

        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800" data-testid="alert-urgent-count">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {urgentCount} overdue {urgentCount === 1 ? "order" : "orders"} (14+ days)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-lab-total">
            <FlaskConical className="w-4 h-4" />
            {isLoading ? "..." : `${labFrames.length} at lab`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Days at lab:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          0–7 days
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
          8–13 days
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
          14+ days
        </span>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search Lab Order #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            data-testid="input-search-lab-order"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          <Select value={filterLab} onValueChange={setFilterLab}>
            <SelectTrigger className="h-9 text-sm w-[160px]" data-testid="select-filter-lab">
              <SelectValue placeholder="All Labs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labs</SelectItem>
              {labsData.map((lab) => (
                <SelectItem key={lab.id} value={lab.name}>
                  {lab.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterVisionPlan} onValueChange={setFilterVisionPlan}>
            <SelectTrigger className="h-9 text-sm w-[180px]" data-testid="select-filter-vision-plan">
              <SelectValue placeholder="All Vision Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vision Plans</SelectItem>
              {VISION_PLAN_OPTIONS.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {plan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDays} onValueChange={(v) => setFilterDays(v as DaysFilter)}>
            <SelectTrigger className="h-9 text-sm w-[150px]" data-testid="select-filter-days">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days at Lab</SelectItem>
              <SelectItem value="0-7">0–7 days</SelectItem>
              <SelectItem value="8-13">8–13 days</SelectItem>
              <SelectItem value="14+">14+ days</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-muted-foreground hover:text-foreground gap-1.5"
              data-testid="button-clear-filters"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground -mt-2">
          Showing {filtered.length} of {labFrames.length} lab order{labFrames.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Brand</TableHead>
              <TableHead className="font-semibold">Model</TableHead>
              <TableHead className="font-semibold">Lab Name</TableHead>
              <TableHead className="font-semibold">Lab Order #</TableHead>
              <TableHead className="font-semibold">Vision Plan</TableHead>
              <TableHead className="font-semibold">Tracking</TableHead>
              <TableHead className="font-semibold">Date Sent</TableHead>
              <TableHead className="font-semibold text-center">Days at Lab</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : labFrames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                  <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="font-medium">No frames at the lab</p>
                  <p className="text-xs mt-1">Frames sent to the lab will appear here</p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-25" />
                  <p className="font-medium">No matching lab orders</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((frame) => {
                  const days = calcDaysAtLab(frame.dateSentToLab);
                  return (
                    <TableRow
                      key={frame.id}
                      className="hover:bg-muted/30 transition-colors"
                      data-testid={`row-lab-order-${frame.id}`}
                    >
                      <TableCell>
                        <p className="font-medium text-foreground" data-testid={`text-brand-${frame.id}`}>{frame.brand}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground" data-testid={`text-model-${frame.id}`}>{frame.model}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm" data-testid={`text-lab-name-${frame.id}`}>
                            {frame.labName ?? <span className="text-muted-foreground italic">—</span>}
                          </span>
                        </div>
                        {frame.labAccountNumber && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5 ml-5">
                            #{frame.labAccountNumber}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {frame.labOrderNumber ? (
                          <span className="font-mono text-sm" data-testid={`text-order-num-${frame.id}`}>
                            {frame.labOrderNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {frame.visionPlan ? (
                          <span className="text-sm" data-testid={`text-vision-plan-${frame.id}`}>
                            {frame.visionPlan}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {frame.trackingNumber ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="font-mono text-xs text-primary cursor-default truncate max-w-[120px] block"
                                data-testid={`text-tracking-${frame.id}`}
                              >
                                {frame.trackingNumber}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{frame.trackingNumber}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {frame.dateSentToLab ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm" data-testid={`text-date-sent-${frame.id}`}>
                              {new Date(frame.dateSentToLab + "T00:00:00").toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DaysAtLabBadge days={days} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditFrame(frame)}
                                data-testid={`button-edit-lab-order-${frame.id}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit lab order details</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 border-green-200 dark:border-green-800"
                                onClick={() => setReceiveFrame(frame)}
                                data-testid={`button-receive-${frame.id}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Mark Received
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark frame as received from lab</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </div>

      {editFrame && (
        <EditLabOrderDialog
          frame={editFrame}
          open={!!editFrame}
          onClose={() => setEditFrame(null)}
        />
      )}

      <MarkReceivedDialog
        frame={receiveFrame}
        open={!!receiveFrame}
        onClose={() => setReceiveFrame(null)}
      />
    </div>
  );
}
