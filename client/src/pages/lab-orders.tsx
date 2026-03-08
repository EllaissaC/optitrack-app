import { useState, useMemo, useRef, useEffect } from "react";
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
  Plus,
  ScanLine,
  ArrowLeft,
  ChevronRight,
  Glasses,
  Trash2,
  DollarSign,
  BadgeCheck,
  UserCheck,
  StickyNote,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Frame, type LabOrder } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Add Lab Order Dialog ──────────────────────────────────────────────────────

const addLabOrderSchema = z.object({
  visionPlan: z.string().optional().nullable(),
  labName: z.string().optional().nullable(),
  labOrderNumber: z.string().optional().nullable(),
  labAccountNumber: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  dateSentToLab: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type AddLabOrderValues = z.infer<typeof addLabOrderSchema>;

function AddLabOrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [isPOF, setIsPOF] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const { data: framesData = [] } = useQuery<Frame[]>({ queryKey: ["/api/frames"] });
  const { data: labsData = [] } = useQuery<{ id: string; name: string; account: string }[]>({ queryKey: ["/api/labs"] });

  const inventoryFrames = framesData.filter((f) => f.status !== "sold");

  const filteredFrames = useMemo(() => {
    if (!searchQuery.trim()) return inventoryFrames;
    const q = searchQuery.trim().toLowerCase();
    return inventoryFrames.filter(
      (f) =>
        f.brand.toLowerCase().includes(q) ||
        f.model.toLowerCase().includes(q) ||
        f.manufacturer.toLowerCase().includes(q) ||
        f.color.toLowerCase().includes(q) ||
        (f.barcode ?? "").toLowerCase().includes(q)
    );
  }, [inventoryFrames, searchQuery]);

  const form = useForm<AddLabOrderValues>({
    resolver: zodResolver(addLabOrderSchema),
    defaultValues: {
      visionPlan: "",
      labName: "",
      labOrderNumber: "",
      labAccountNumber: "",
      trackingNumber: "",
      dateSentToLab: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedFrame(null);
      setIsPOF(false);
      setSearchQuery("");
      setBarcodeValue("");
      setBarcodeError(null);
      form.reset({
        visionPlan: "",
        labName: "",
        labOrderNumber: "",
        labAccountNumber: "",
        trackingNumber: "",
        dateSentToLab: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open]);

  function selectPOF() {
    setIsPOF(true);
    setSelectedFrame(null);
    form.reset({
      visionPlan: "",
      labName: "",
      labOrderNumber: "",
      labAccountNumber: "",
      trackingNumber: "",
      dateSentToLab: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setStep("details");
  }

  useEffect(() => {
    if (open && step === "select") {
      setTimeout(() => barcodeRef.current?.focus(), 100);
    }
  }, [open, step]);

  function handleBarcodeSubmit() {
    const barcode = barcodeValue.trim();
    if (!barcode) return;
    const match = inventoryFrames.find((f) => f.barcode && f.barcode.trim() === barcode);
    if (match) {
      setBarcodeError(null);
      selectFrame(match);
    } else {
      setBarcodeError(`No frame found for barcode "${barcode}"`);
      setBarcodeValue("");
    }
  }

  function selectFrame(frame: Frame) {
    setSelectedFrame(frame);
    const matchingLab = labsData.find((l) => l.name === frame.labName);
    form.reset({
      visionPlan: frame.visionPlan ?? "",
      labName: frame.labName ?? "",
      labOrderNumber: "",
      labAccountNumber: matchingLab?.account ?? frame.labAccountNumber ?? "",
      trackingNumber: "",
      dateSentToLab: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setStep("details");
  }

  const mutation = useMutation({
    mutationFn: async (values: AddLabOrderValues) => {
      const body = isPOF
        ? {
            frameId: null,
            frameBrand: "Patient Own Frame",
            frameModel: "POF",
            frameColor: "—",
            frameManufacturer: "—",
            patientOwnFrame: true,
            visionPlan: values.visionPlan || null,
            labName: values.labName || null,
            labOrderNumber: values.labOrderNumber || null,
            labAccountNumber: values.labAccountNumber || null,
            trackingNumber: values.trackingNumber || null,
            dateSentToLab: values.dateSentToLab || new Date().toISOString().split("T")[0],
            notes: values.notes || null,
            status: "pending",
          }
        : {
            frameId: selectedFrame!.id,
            frameBrand: selectedFrame!.brand,
            frameModel: selectedFrame!.model,
            frameColor: selectedFrame!.color,
            frameManufacturer: selectedFrame!.manufacturer,
            patientOwnFrame: false,
            visionPlan: values.visionPlan || null,
            labName: values.labName || null,
            labOrderNumber: values.labOrderNumber || null,
            labAccountNumber: values.labAccountNumber || null,
            trackingNumber: values.trackingNumber || null,
            dateSentToLab: values.dateSentToLab || new Date().toISOString().split("T")[0],
            notes: values.notes || null,
            status: "pending",
          };
      await apiRequest("POST", "/api/lab-orders", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({
        title: "Lab order created",
        description: isPOF
          ? "Patient own frame order added"
          : `${selectedFrame!.brand} ${selectedFrame!.model} sent to lab`,
      });
      onClose();
    },
    onError: () => toast({ title: "Failed to create lab order", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "details" && (
              <button
                type="button"
                onClick={() => { setStep("select"); setIsPOF(false); setBarcodeValue(""); setBarcodeError(null); }}
                className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-back-to-select"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <FlaskConical className="w-4 h-4 text-primary" />
            {step === "select" ? "Add Lab Order — Select Frame" : "Add Lab Order — Details"}
          </DialogTitle>
          {step === "select" && (
            <DialogDescription>
              Search inventory or scan a barcode to select a frame, or choose Patient Own Frame (POF) for lens-only orders.
            </DialogDescription>
          )}
          {step === "details" && selectedFrame && (
            <DialogDescription>
              Enter the lab order details for{" "}
              <span className="font-medium text-foreground">{selectedFrame.brand} — {selectedFrame.model}</span>
              {selectedFrame.color ? `, ${selectedFrame.color}` : ""}
            </DialogDescription>
          )}
          {step === "details" && isPOF && (
            <DialogDescription>
              Enter the lab order details for this patient own frame (lens-only) order.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-muted-foreground" /> Scan Barcode
              </label>
              <div className="flex gap-2">
                <input
                  ref={barcodeRef}
                  type="text"
                  className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Scan or type barcode, then press Enter…"
                  value={barcodeValue}
                  onChange={(e) => { setBarcodeValue(e.target.value); setBarcodeError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeSubmit()}
                  data-testid="input-barcode-scan"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleBarcodeSubmit} data-testid="button-scan-lookup">
                  Find
                </Button>
              </div>
              {barcodeError && (
                <p className="text-xs text-destructive" data-testid="text-barcode-error">{barcodeError}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or search inventory</span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search by brand, model, or color…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-frame-search"
              />
            </div>

            <div className="border border-border rounded-md overflow-hidden max-h-56 overflow-y-auto" data-testid="list-available-frames">
              {inventoryFrames.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Glasses className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No frames in inventory</p>
                  <p className="text-xs mt-0.5">Add frames to inventory first</p>
                </div>
              ) : filteredFrames.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">No frames match your search</div>
              ) : (
                filteredFrames.map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 text-left"
                    onClick={() => selectFrame(frame)}
                    data-testid={`button-select-frame-${frame.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{frame.brand} — {frame.model}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {frame.color} · {frame.manufacturer}
                        {frame.barcode ? ` · #${frame.barcode}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {inventoryFrames.length} frame{inventoryFrames.length !== 1 ? "s" : ""} in inventory
              {filteredFrames.length !== inventoryFrames.length && ` · ${filteredFrames.length} matching`}
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-colors text-left"
              onClick={selectPOF}
              data-testid="button-patient-own-frame"
            >
              <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Patient Own Frame (POF)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Patient brings their own frame — lenses only. No inventory affected.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-auto" />
            </button>
          </div>
        )}

        {step === "details" && (selectedFrame || isPOF) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              {isPOF ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Patient Own Frame</p>
                    <p className="text-xs text-muted-foreground">Lenses only — no inventory change</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <Glasses className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{selectedFrame!.brand} — {selectedFrame!.model}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedFrame!.color} · {selectedFrame!.manufacturer}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="visionPlan" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Vision Plan
                    </FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vision-plan">
                          <SelectValue placeholder="Select vision plan…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None / Out of Pocket</SelectItem>
                        {VISION_PLAN_OPTIONS.map((plan) => (
                          <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="labName" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Lab
                    </FormLabel>
                    {labsData.length > 0 ? (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => {
                          field.onChange(v);
                          const lab = labsData.find((l) => l.name === v);
                          if (lab?.account) form.setValue("labAccountNumber", lab.account);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-lab-name">
                            <SelectValue placeholder="Select lab…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {labsData.map((lab) => (
                            <SelectItem key={lab.id} value={lab.name}>{lab.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input placeholder="e.g. HOYA Lab" data-testid="input-lab-name" {...field} value={field.value ?? ""} />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="labOrderNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Order #
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ORD-12345" data-testid="input-lab-order-number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="labAccountNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Account #
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="A12345" data-testid="input-lab-account-number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Tracking #
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="1Z999AA1…" data-testid="input-tracking-number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dateSentToLab" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date Sent
                    </FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-date-sent" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-muted-foreground" /> Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Rush job, redo, special instructions…"
                      rows={3}
                      data-testid="textarea-notes"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending} data-testid="button-send-to-lab">
                  <FlaskConical className="w-4 h-4 mr-1.5" />
                  {mutation.isPending ? "Sending…" : "Send to Lab"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Edit Lab Order Dialog ─────────────────────────────────────────────────────

const editOrderSchema = z.object({
  labOrderNumber: z.string().optional().nullable(),
  labAccountNumber: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  dateSentToLab: z.string().optional().nullable(),
  labName: z.string().optional().nullable(),
  visionPlan: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type EditOrderValues = z.infer<typeof editOrderSchema>;

function EditLabOrderDialog({ order, open, onClose }: { order: LabOrder; open: boolean; onClose: () => void }) {
  const { toast } = useToast();

  const form = useForm<EditOrderValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      labOrderNumber: order.labOrderNumber ?? "",
      labAccountNumber: order.labAccountNumber ?? "",
      trackingNumber: order.trackingNumber ?? "",
      dateSentToLab: order.dateSentToLab ?? "",
      labName: order.labName ?? "",
      visionPlan: order.visionPlan ?? "",
      notes: order.notes ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: EditOrderValues) =>
      apiRequest("PATCH", `/api/lab-orders/${order.id}`, {
        labOrderNumber: values.labOrderNumber || null,
        labAccountNumber: values.labAccountNumber || null,
        trackingNumber: values.trackingNumber || null,
        dateSentToLab: values.dateSentToLab || null,
        labName: values.labName || null,
        visionPlan: values.visionPlan || null,
        notes: values.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      toast({ title: "Lab order updated" });
      onClose();
    },
    onError: () => toast({ title: "Failed to update lab order", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Lab Order</DialogTitle>
          <DialogDescription>{order.frameBrand} — {order.frameModel}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="visionPlan" render={({ field }) => (
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
                    <SelectItem value="none">None / Out of Pocket</SelectItem>
                    {VISION_PLAN_OPTIONS.map((plan) => (
                      <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="labName" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Lab Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. HOYA Lab" data-testid="input-edit-lab-name" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="labOrderNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Order #
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ORD-12345" data-testid="input-edit-lab-order-number" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="labAccountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Account #
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="A12345" data-testid="input-edit-lab-account-number" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Tracking #
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="1Z999AA1..." data-testid="input-edit-tracking-number" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateSentToLab" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date Sent
                  </FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-edit-date-sent" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground" /> Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Rush job, redo, special instructions…"
                    rows={3}
                    data-testid="textarea-edit-notes"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
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

// ─── Mark Received Dialog ─────────────────────────────────────────────────────

function MarkReceivedDialog({ order, open, onClose }: { order: LabOrder | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const orderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (order) orderIdRef.current = order.id;
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => {
      const id = orderIdRef.current;
      if (!id) throw new Error("No order selected");
      return apiRequest("PATCH", `/api/lab-orders/${id}`, {
        status: "received",
        dateReceivedFromLab: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Order marked as received", description: "The frame has been marked as sold." });
      onClose();
    },
    onError: () => toast({ title: "Failed to update order", variant: "destructive" }),
  });

  function handleConfirm() {
    const id = order?.id ?? orderIdRef.current;
    if (!id) return;
    orderIdRef.current = id;
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-green-600" />
            Mark as Received
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {order && (
              <>
                Confirm that the order for{" "}
                <span className="font-semibold text-foreground">{order.frameBrand} {order.frameModel}</span>{" "}
                has been received from the lab. Today&apos;s date will be recorded. The frame will be marked as sold.
              </>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-confirm-received"
          >
            {mutation.isPending ? "Updating..." : "Mark Received"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Lab Order Dialog ───────────────────────────────────────────────────

function DeleteLabOrderDialog({ order, open, onClose }: { order: LabOrder | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();

  const orderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (order) orderIdRef.current = order.id;
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => {
      const id = orderIdRef.current;
      if (!id) throw new Error("No order selected");
      return apiRequest("DELETE", `/api/lab-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Lab order deleted" });
      onClose();
    },
    onError: () => toast({ title: "Failed to delete lab order", variant: "destructive" }),
  });

  function handleDelete() {
    const id = order?.id ?? orderIdRef.current;
    if (!id) return;
    orderIdRef.current = id;
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete Lab Order?</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {order && (
              <>
                This will permanently delete the lab order for{" "}
                <span className="font-semibold text-foreground">{order.frameBrand} {order.frameModel}</span>.
                The frame will remain in inventory and the sold count will not change.
              </>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={mutation.isPending}
            variant="destructive"
            data-testid="button-confirm-delete-order"
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Frame Sold Dialog ─────────────────────────────────────────────────────────

function FrameSoldDialog({ order, open, onClose }: { order: LabOrder | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const orderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (order) orderIdRef.current = order.id;
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => {
      const id = orderIdRef.current;
      if (!id) throw new Error("No order selected");
      return apiRequest("POST", `/api/lab-orders/${id}/frame-sold`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({
        title: order?.patientOwnFrame ? "Payment recorded" : "Frame sale recorded",
        description: order?.patientOwnFrame
          ? "Lab order marked as paid."
          : "Sales analytics have been updated.",
      });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to record frame sale";
      toast({ title: msg, variant: "destructive" });
    },
  });

  function handleConfirm() {
    const id = order?.id ?? orderIdRef.current;
    if (!id) return;
    orderIdRef.current = id;
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            {order?.patientOwnFrame ? "Record Payment" : "Record Frame Sale"}
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            {order && (
              order.patientOwnFrame ? (
                <>
                  <p>Confirm that the patient has paid for this lab order.</p>
                  <p className="text-xs">This is a Patient Own Frame (POF) order — no inventory or frame analytics will be updated.</p>
                </>
              ) : (
                <>
                  <p>
                    Confirm that the patient has paid for:{" "}
                    <span className="font-semibold text-foreground">{order.frameBrand} {order.frameModel} ({order.frameColor})</span>.
                  </p>
                  <p className="text-xs">Sales analytics (top frames, manufacturers, revenue) will be updated.</p>
                </>
              )
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-confirm-frame-sold"
          >
            {mutation.isPending ? "Recording..." : order?.patientOwnFrame ? "Confirm Payment" : "Confirm Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type DaysFilter = "all" | "0-7" | "8-13" | "14+";
type StatusFilter = "all" | "pending" | "received";

export default function LabOrders() {
  const [editOrder, setEditOrder] = useState<LabOrder | null>(null);
  const [receiveOrder, setReceiveOrder] = useState<LabOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<LabOrder | null>(null);
  const [sellOrder, setSellOrder] = useState<LabOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLab, setFilterLab] = useState("all");
  const [filterVisionPlan, setFilterVisionPlan] = useState("all");
  const [filterDays, setFilterDays] = useState<DaysFilter>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLabOrder, setShowAddLabOrder] = useState(false);

  const { data: ordersData, isLoading } = useQuery<LabOrder[]>({
    queryKey: ["/api/lab-orders"],
  });

  const { data: labsData = [] } = useQuery<{ id: string; name: string; account: string }[]>({
    queryKey: ["/api/labs"],
  });

  const orders = ordersData ?? [];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterStatus !== "all" && order.status !== filterStatus) return false;
      if (filterLab !== "all" && order.labName !== filterLab) return false;
      if (filterVisionPlan !== "all" && order.visionPlan !== filterVisionPlan) return false;
      if (filterDays !== "all") {
        const days = calcDaysAtLab(order.dateSentToLab);
        if (filterDays === "0-7" && (days === null || days > 7)) return false;
        if (filterDays === "8-13" && (days === null || days < 8 || days > 13)) return false;
        if (filterDays === "14+" && (days === null || days < 14)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !order.frameBrand.toLowerCase().includes(q) &&
          !order.frameModel.toLowerCase().includes(q) &&
          !order.frameColor.toLowerCase().includes(q) &&
          !(order.labName ?? "").toLowerCase().includes(q) &&
          !(order.labOrderNumber ?? "").toLowerCase().includes(q) &&
          !(order.visionPlan ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [orders, filterStatus, filterLab, filterVisionPlan, filterDays, searchQuery]);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const urgentCount = pendingOrders.filter((o) => {
    const days = calcDaysAtLab(o.dateSentToLab);
    return days !== null && days >= 14;
  }).length;

  const uniqueLabs = [...new Set(orders.map((o) => o.labName).filter(Boolean))];
  const uniqueVisionPlans = [...new Set(orders.map((o) => o.visionPlan).filter(Boolean))];

  const hasActiveFilters = filterLab !== "all" || filterVisionPlan !== "all" || filterDays !== "all" || filterStatus !== "pending";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-lab-orders-title">Lab Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
            {isLoading ? "..." : `${pendingOrders.length} pending`}
          </div>
          <Button onClick={() => setShowAddLabOrder(true)} data-testid="button-add-lab-order">
            <Plus className="w-4 h-4 mr-1.5" /> Add Lab Order
          </Button>
        </div>
      </div>

      {/* Days at lab legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Days at lab:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> 0–7 days
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> 8–13 days
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> 14+ days (overdue)
        </span>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search by frame, lab, order number…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-orders"
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          data-testid="button-toggle-filters"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1.5 bg-white/20 text-xs rounded-full px-1.5 py-0.5">active</span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap p-4 rounded-lg bg-muted/30 border border-border">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
            <SelectTrigger className="w-36 h-8 text-sm" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLab} onValueChange={setFilterLab}>
            <SelectTrigger className="w-44 h-8 text-sm" data-testid="select-filter-lab">
              <SelectValue placeholder="All labs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All labs</SelectItem>
              {uniqueLabs.map((lab) => (
                <SelectItem key={lab!} value={lab!}>{lab}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterVisionPlan} onValueChange={setFilterVisionPlan}>
            <SelectTrigger className="w-44 h-8 text-sm" data-testid="select-filter-vision-plan">
              <SelectValue placeholder="All vision plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vision plans</SelectItem>
              {uniqueVisionPlans.map((vp) => (
                <SelectItem key={vp!} value={vp!}>{vp}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDays} onValueChange={(v) => setFilterDays(v as DaysFilter)}>
            <SelectTrigger className="w-40 h-8 text-sm" data-testid="select-filter-days">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All durations</SelectItem>
              <SelectItem value="0-7">0–7 days</SelectItem>
              <SelectItem value="8-13">8–13 days</SelectItem>
              <SelectItem value="14+">14+ days (overdue)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterLab("all");
                setFilterVisionPlan("all");
                setFilterDays("all");
                setFilterStatus("pending");
              }}
              data-testid="button-clear-filters"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Frame</TableHead>
              <TableHead className="font-semibold">Lab</TableHead>
              <TableHead className="font-semibold">Order #</TableHead>
              <TableHead className="font-semibold">Vision Plan</TableHead>
              <TableHead className="font-semibold">Tracking</TableHead>
              <TableHead className="font-semibold">Days at Lab</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-sm">
                    {orders.length === 0 ? "No lab orders yet" : "No orders match your filters"}
                  </p>
                  <p className="text-xs mt-1">
                    {orders.length === 0
                      ? "Click \"Add Lab Order\" to create your first lab order"
                      : "Try adjusting your search or filters"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const days = calcDaysAtLab(order.dateSentToLab);
                const isReceived = order.status === "received";
                return (
                  <TableRow key={order.id} className={isReceived ? "opacity-60" : undefined} data-testid={`row-order-${order.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-foreground" data-testid={`text-brand-${order.id}`}>{order.frameBrand}</p>
                        {order.patientOwnFrame && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0 text-[10px] px-1.5 py-0" data-testid={`badge-pof-${order.id}`}>
                            POF
                          </Badge>
                        )}
                      </div>
                      {!order.patientOwnFrame && (
                        <>
                          <p className="text-sm text-muted-foreground" data-testid={`text-model-${order.id}`}>{order.frameModel}</p>
                          <p className="text-xs text-muted-foreground">{order.frameColor}</p>
                        </>
                      )}
                      <div className="flex items-start gap-1 mt-1" data-testid={`notes-section-${order.id}`}>
                        <StickyNote className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        {order.notes ? (
                          <p className="text-xs text-muted-foreground leading-snug" data-testid={`text-notes-${order.id}`}>{order.notes}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground/50 italic">No notes added</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm" data-testid={`text-lab-name-${order.id}`}>
                          {order.labName ?? <span className="text-muted-foreground italic">—</span>}
                        </span>
                      </div>
                      {order.labAccountNumber && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 ml-5">#{order.labAccountNumber}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.labOrderNumber ? (
                        <span className="font-mono text-sm" data-testid={`text-order-num-${order.id}`}>{order.labOrderNumber}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.visionPlan ? (
                        <span className="text-sm" data-testid={`text-vision-plan-${order.id}`}>{order.visionPlan}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.trackingNumber ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-xs text-primary cursor-default truncate max-w-[120px] block" data-testid={`text-tracking-${order.id}`}>
                              {order.trackingNumber}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{order.trackingNumber}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isReceived && order.dateReceivedFromLab ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-muted-foreground">{order.dateReceivedFromLab}</span>
                        </div>
                      ) : (
                        <DaysAtLabBadge days={days} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {isReceived ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 w-fit" data-testid={`badge-status-${order.id}`}>
                            Received
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-0 w-fit" data-testid={`badge-status-${order.id}`}>
                            Pending
                          </Badge>
                        )}
                        {order.frameSold && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0 w-fit" data-testid={`badge-frame-sold-${order.id}`}>
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            Frame Sold
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditOrder(order)}
                              data-testid={`button-edit-${order.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit order details</TooltipContent>
                        </Tooltip>
                        {!isReceived && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 border-green-200 dark:border-green-800"
                                onClick={() => setReceiveOrder(order)}
                                data-testid={`button-receive-${order.id}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Mark Received
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark order as received from lab</TooltipContent>
                          </Tooltip>
                        )}
                        {(order.frameId || order.patientOwnFrame) && !order.frameSold && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                                onClick={() => setSellOrder(order)}
                                data-testid={`button-frame-sold-${order.id}`}
                              >
                                <DollarSign className="w-3.5 h-3.5 mr-1" />
                                {order.patientOwnFrame ? "Mark Paid" : "Frame Sold"}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {order.patientOwnFrame
                                ? "Record payment for this lab order (no inventory change)"
                                : "Record frame sale & update analytics"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {order.frameSold && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded border border-dashed border-muted-foreground/30">
                                <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
                                <span>Sold {order.frameSoldAt ?? ""}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Frame sale recorded on {order.frameSoldAt ?? "unknown date"}</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteOrder(order)}
                              data-testid={`button-delete-${order.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete lab order</TooltipContent>
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

      {filteredOrders.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      )}

      <AddLabOrderDialog
        open={showAddLabOrder}
        onClose={() => setShowAddLabOrder(false)}
      />

      {editOrder && (
        <EditLabOrderDialog
          order={editOrder}
          open={!!editOrder}
          onClose={() => setEditOrder(null)}
        />
      )}

      <MarkReceivedDialog
        order={receiveOrder}
        open={!!receiveOrder}
        onClose={() => setReceiveOrder(null)}
      />

      <DeleteLabOrderDialog
        order={deleteOrder}
        open={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
      />

      <FrameSoldDialog
        order={sellOrder}
        open={!!sellOrder}
        onClose={() => setSellOrder(null)}
      />
    </div>
  );
}
