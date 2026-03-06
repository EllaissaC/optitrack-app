import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  FlaskConical,
  CheckCircle,
  Barcode,
  ScanLine,
  AlertCircle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertFrameSchema, type Frame } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = insertFrameSchema.extend({
  eyeSize: z.coerce.number().min(1, "Required").max(99),
  bridge: z.coerce.number().min(1, "Required").max(99),
  templeLength: z.coerce.number().min(1, "Required").max(999),
  cost: z.coerce
    .string()
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      "Must be a valid price"
    ),
  retailPrice: z.coerce
    .string()
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      "Must be a valid price"
    ),
  barcode: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_CONFIG = {
  on_board: {
    label: "On Board",
    icon: Package,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  at_lab: {
    label: "At Lab",
    icon: FlaskConical,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  sold: {
    label: "Sold",
    icon: CheckCircle,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}

function FrameFormDialog({
  open,
  onClose,
  editFrame,
  prefillBarcode,
}: {
  open: boolean;
  onClose: () => void;
  editFrame?: Frame | null;
  prefillBarcode?: string;
}) {
  const { toast } = useToast();
  const isEdit = !!editFrame;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editFrame
      ? {
          manufacturer: editFrame.manufacturer,
          brand: editFrame.brand,
          model: editFrame.model,
          color: editFrame.color,
          eyeSize: editFrame.eyeSize,
          bridge: editFrame.bridge,
          templeLength: editFrame.templeLength,
          cost: String(editFrame.cost),
          retailPrice: String(editFrame.retailPrice),
          status: editFrame.status as "on_board" | "at_lab" | "sold",
          barcode: editFrame.barcode ?? "",
        }
      : {
          manufacturer: "",
          brand: "",
          model: "",
          color: "",
          eyeSize: 52,
          bridge: 18,
          templeLength: 145,
          cost: "",
          retailPrice: "",
          status: "on_board",
          barcode: prefillBarcode ?? "",
        },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editFrame
          ? {
              manufacturer: editFrame.manufacturer,
              brand: editFrame.brand,
              model: editFrame.model,
              color: editFrame.color,
              eyeSize: editFrame.eyeSize,
              bridge: editFrame.bridge,
              templeLength: editFrame.templeLength,
              cost: String(editFrame.cost),
              retailPrice: String(editFrame.retailPrice),
              status: editFrame.status as "on_board" | "at_lab" | "sold",
              barcode: editFrame.barcode ?? "",
            }
          : {
              manufacturer: "",
              brand: "",
              model: "",
              color: "",
              eyeSize: 52,
              bridge: 18,
              templeLength: 145,
              cost: "",
              retailPrice: "",
              status: "on_board",
              barcode: prefillBarcode ?? "",
            }
      );
    }
  }, [open, editFrame, prefillBarcode]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/frames", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Frame added", description: "The frame has been added to inventory." });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add frame.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiRequest("PATCH", `/api/frames/${editFrame!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({ title: "Frame updated", description: "The frame has been updated." });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update frame.", variant: "destructive" });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    const payload = { ...values, barcode: values.barcode || null };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Frame" : "Add New Frame"}</DialogTitle>
          {!isEdit && prefillBarcode && (
            <DialogDescription>
              No frame was found for barcode{" "}
              <span className="font-mono font-semibold text-foreground">
                {prefillBarcode}
              </span>
              . Fill in the details below to register it.
            </DialogDescription>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                    Barcode
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Scan or type barcode..."
                      data-testid="input-barcode"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Luxottica"
                        data-testid="input-manufacturer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Ray-Ban"
                        data-testid="input-brand"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. RB5154"
                        data-testid="input-model"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Matte Black"
                        data-testid="input-color"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="eyeSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eye Size (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        data-testid="input-eye-size"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bridge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bridge (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        data-testid="input-bridge"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="templeLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temple (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        data-testid="input-temple"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        data-testid="input-cost"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retailPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        data-testid="input-retail-price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="on_board">On Board</SelectItem>
                        <SelectItem value="at_lab">At Lab</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-frame"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-frame"
              >
                {isPending
                  ? "Saving..."
                  : isEdit
                  ? "Update Frame"
                  : "Add Frame"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFrame, setEditFrame] = useState<Frame | null>(null);
  const [prefillBarcode, setPrefillBarcode] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "found" | "not_found">("idle");
  const scanInputRef = useRef<HTMLInputElement>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const { data: frames = [], isLoading } = useQuery<Frame[]>({
    queryKey: ["/api/frames"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/frames/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      toast({
        title: "Frame deleted",
        description: "The frame has been removed from inventory.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete frame.",
        variant: "destructive",
      });
    },
  });

  const filtered = frames.filter((frame) => {
    const matchesStatus =
      statusFilter === "all" || frame.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      frame.manufacturer.toLowerCase().includes(q) ||
      frame.brand.toLowerCase().includes(q) ||
      frame.model.toLowerCase().includes(q) ||
      frame.color.toLowerCase().includes(q) ||
      (frame.barcode && frame.barcode.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  function openAdd(barcode?: string) {
    setEditFrame(null);
    setPrefillBarcode(barcode ?? "");
    setDialogOpen(true);
  }

  function openEdit(frame: Frame) {
    setEditFrame(frame);
    setPrefillBarcode("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditFrame(null);
    setPrefillBarcode("");
    scanInputRef.current?.focus();
  }

  function highlightFrame(id: string) {
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 3000);
  }

  useEffect(() => {
    if (highlightedId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedId]);

  const handleScan = useCallback(
    (value: string) => {
      const barcode = value.trim();
      if (!barcode) return;

      const match = frames.find(
        (f) => f.barcode && f.barcode.trim() === barcode
      );

      if (match) {
        setScanStatus("found");
        highlightFrame(match.id);
        openEdit(match);
        setScanValue("");
        setTimeout(() => setScanStatus("idle"), 2500);
      } else {
        setScanStatus("not_found");
        setScanValue("");
        openAdd(barcode);
        setTimeout(() => setScanStatus("idle"), 2500);
      }
    },
    [frames]
  );

  function handleScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan(scanValue);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {frames.length} frame{frames.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => openAdd()} data-testid="button-add-frame">
          <Plus className="w-4 h-4 mr-2" />
          Add Frame
        </Button>
      </div>

      {/* Barcode Scanner Input */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
          scanStatus === "found"
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : scanStatus === "not_found"
            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
            : "border-border bg-muted/30"
        }`}
        data-testid="barcode-scanner-panel"
      >
        <div
          className={`p-2.5 rounded-md flex-shrink-0 ${
            scanStatus === "found"
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
              : scanStatus === "not_found"
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
              : "bg-background text-muted-foreground"
          }`}
        >
          <ScanLine className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <label
            htmlFor="scan-input"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Scan Frame Barcode
          </label>
          <div className="relative">
            <Input
              id="scan-input"
              ref={scanInputRef}
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              onKeyDown={handleScanKeyDown}
              placeholder="Focus here and scan with USB barcode scanner, or type and press Enter..."
              className="pr-24 font-mono"
              autoComplete="off"
              data-testid="input-barcode-scan"
            />
            {scanValue && (
              <button
                onClick={() => {
                  setScanValue("");
                  scanInputRef.current?.focus();
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-clear-scan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
              onClick={() => handleScan(scanValue)}
              disabled={!scanValue.trim()}
              data-testid="button-scan-submit"
            >
              Scan
            </Button>
          </div>
        </div>
        <div className="flex-shrink-0 min-w-0 hidden sm:block">
          {scanStatus === "found" && (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Frame found
            </p>
          )}
          {scanStatus === "not_found" && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Not in inventory
            </p>
          )}
          {scanStatus === "idle" && (
            <p className="text-xs text-muted-foreground">Ready to scan</p>
          )}
        </div>
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by brand, model, barcode..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              data-testid="button-clear-search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "on_board", "at_lab", "sold"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              data-testid={`button-filter-${s}`}
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s === "all"
                ? "All"
                : s === "on_board"
                ? "On Board"
                : s === "at_lab"
                ? "At Lab"
                : "Sold"}
            </button>
          ))}
        </div>
      </div>

      {/* Frames Table */}
      <Card className="border-card-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-foreground">No frames found</p>
              <p className="text-sm mt-1">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Add your first frame to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Button
                  className="mt-4"
                  onClick={() => openAdd()}
                  data-testid="button-add-first-frame"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Frame
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-card-border">
                    <TableHead className="pl-6">Brand / Model</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-center">Size</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5" /> Barcode
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Retail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((frame) => {
                    const isHighlighted = frame.id === highlightedId;
                    return (
                      <TableRow
                        key={frame.id}
                        ref={isHighlighted ? highlightedRowRef : null}
                        data-testid={`row-frame-${frame.id}`}
                        className={`border-b border-card-border/60 last:border-0 transition-colors duration-300 ${
                          isHighlighted
                            ? "bg-primary/10 dark:bg-primary/15"
                            : ""
                        }`}
                      >
                        <TableCell className="pl-6 py-3.5">
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {frame.brand}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {frame.model}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3.5">
                          {frame.manufacturer}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3.5">
                          {frame.color}
                        </TableCell>
                        <TableCell className="text-center py-3.5">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {frame.eyeSize}/{frame.bridge}/{frame.templeLength}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {frame.barcode ? (
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground tracking-wider">
                              {frame.barcode}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm py-3.5">
                          <span className="text-muted-foreground">
                            ${parseFloat(frame.cost as string).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold py-3.5">
                          ${parseFloat(frame.retailPrice as string).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <StatusPill status={frame.status} />
                        </TableCell>
                        <TableCell className="pr-6 text-right py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(frame)}
                              data-testid={`button-edit-frame-${frame.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(frame.id)}
                              data-testid={`button-delete-frame-${frame.id}`}
                              className="text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

      <FrameFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        editFrame={editFrame}
        prefillBarcode={prefillBarcode}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Frame</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this frame from your inventory. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
