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
  RotateCcw,
  ChevronsUpDown,
  Hash,
  Truck,
  Building2,
} from "lucide-react";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { insertFrameSchema, type Frame, type Manufacturer, type Brand, type Lab } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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

import { VISION_PLAN_OPTIONS } from "@/lib/constants";

const formSchema = insertFrameSchema.extend({
  eyeSize: z.coerce.number().min(1, "Required").max(99),
  bridge: z.coerce.number().min(1, "Required").max(99),
  templeLength: z.coerce.number().min(1, "Required").max(999),
  cost: z.coerce
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a valid price"),
  multiplier: z.coerce
    .string()
    .refine((v) => v === "" || v === null || (!isNaN(parseFloat(v)) && parseFloat(v) > 0), "Must be a positive number")
    .optional()
    .nullable(),
  retailPrice: z.coerce
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a valid price"),
  barcode: z.string().optional().nullable(),
  labOrderNumber: z.string().optional().nullable(),
  labName: z.string().optional().nullable(),
  labAccountNumber: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  dateSentToLab: z.string().optional().nullable(),
  visionPlan: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === "at_lab" && !data.visionPlan) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vision Plan is required",
      path: ["visionPlan"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_CONFIG = {
  on_board: {
    label: "On Board",
    icon: Package,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  at_lab: {
    label: "At Lab",
    icon: FlaskConical,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  sold: {
    label: "Sold",
    icon: CheckCircle,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}


function FrameFoundCard({
  frame,
  onDismiss,
  onEdit,
}: {
  frame: Frame;
  onDismiss: () => void;
  onEdit: () => void;
}) {
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiRequest("PATCH", `/api/frames/${frame.id}`, { status }),
    onSuccess: (_data, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/frames"] });
      const labels: Record<string, string> = {
        at_lab: "Sent to lab",
        sold: "Marked as sold",
        on_board: "Returned to board",
      };
      toast({
        title: labels[status] ?? "Status updated",
        description: `${frame.brand} ${frame.model} has been updated.`,
      });
      onDismiss();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  const quickActions = [
    {
      key: "at_lab",
      label: "Send to Lab",
      icon: FlaskConical,
      className: "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400",
      show: frame.status !== "at_lab",
    },
    {
      key: "sold",
      label: "Mark Sold",
      icon: CheckCircle,
      className: "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400",
      show: frame.status !== "sold",
    },
    {
      key: "on_board",
      label: "Return to Board",
      icon: RotateCcw,
      className: "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400",
      show: frame.status !== "on_board",
    },
  ].filter((a) => a.show);

  return (
    <div
      className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 overflow-hidden"
      data-testid="frame-found-card"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-semibold">Frame found in inventory</span>
          {frame.barcode && (
            <span className="font-mono text-xs bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
              {frame.barcode}
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-emerald-600 dark:text-emerald-500 flex-shrink-0"
          data-testid="button-dismiss-found-card"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">
              {frame.brand} {frame.model}
            </p>
            <p className="text-sm text-muted-foreground">
              {frame.manufacturer} · {frame.color}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Size</span>
              <p className="font-mono font-medium text-foreground">
                {frame.eyeSize}/{frame.bridge}/{frame.templeLength}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Wholesale</span>
              <p className="font-medium text-foreground">
                ${parseFloat(frame.cost as string).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Retail</span>
              <p className="font-semibold text-foreground">
                ${parseFloat(frame.retailPrice as string).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Status</span>
              <div className="mt-0.5">
                <StatusPill status={frame.status} />
              </div>
            </div>
            {frame.labName && (
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Lab</span>
                <p className="font-medium text-foreground">{frame.labName}</p>
              </div>
            )}
            {frame.labOrderNumber && (
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Order #</span>
                <p className="font-mono font-medium text-foreground">{frame.labOrderNumber}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {quickActions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              size="sm"
              className={`gap-1.5 ${action.className}`}
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(action.key)}
              data-testid={`button-quick-action-${action.key}`}
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </Button>
          ))}
          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onEdit}
            data-testid="button-found-edit"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>
    </div>
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

  const { data: manufacturersData = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });
  const { data: labsData = [] } = useQuery<Lab[]>({
    queryKey: ["/api/labs"],
  });
  const { data: settingsData = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const allManufacturers = manufacturersData.map((m) => m.name);
  const allLabs = labsData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      barcode: "",
      multiplier: "",
      labOrderNumber: "",
      labName: "",
      labAccountNumber: "",
      trackingNumber: "",
      dateSentToLab: "",
      visionPlan: "",
    },
  });

  const watchedManufacturer = form.watch("manufacturer");
  const watchedStatus = form.watch("status");
  const watchedCost = form.watch("cost");
  const watchedMultiplier = form.watch("multiplier");

  useEffect(() => {
    const cost = parseFloat(watchedCost as string);
    const multiplier = parseFloat(watchedMultiplier as string);
    if (!isNaN(cost) && !isNaN(multiplier) && multiplier > 0) {
      form.setValue("retailPrice", (cost * multiplier).toFixed(2), { shouldValidate: false });
    }
  }, [watchedCost, watchedMultiplier]);

  useEffect(() => {
    if (watchedStatus === "at_lab" && !form.getValues("dateSentToLab")) {
      form.setValue("dateSentToLab", new Date().toISOString().split("T")[0]);
    }
  }, [watchedStatus]);

  const selectedMfgObj = manufacturersData.find((m) => m.name === watchedManufacturer);
  const { data: brandsData = [] } = useQuery<Brand[]>({
    queryKey: ["/api/manufacturers", selectedMfgObj?.id, "brands"],
    enabled: !!selectedMfgObj?.id,
  });
  const availableBrandNames = brandsData.map((b) => b.name);

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
              multiplier: editFrame.multiplier ? String(editFrame.multiplier) : "",
              labOrderNumber: editFrame.labOrderNumber ?? "",
              labName: editFrame.labName ?? "",
              labAccountNumber: editFrame.labAccountNumber ?? "",
              trackingNumber: editFrame.trackingNumber ?? "",
              dateSentToLab: editFrame.dateSentToLab ?? "",
              visionPlan: editFrame.visionPlan ?? "",
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
              multiplier: settingsData.defaultMultiplier || "",
              retailPrice: "",
              status: "on_board",
              barcode: prefillBarcode ?? "",
              labOrderNumber: "",
              labName: "",
              labAccountNumber: "",
              trackingNumber: "",
              dateSentToLab: "",
              visionPlan: "",
            }
      );
    }
  }, [open, editFrame, prefillBarcode]);

  function handleManufacturerChange(value: string, fieldOnChange: (v: string) => void) {
    fieldOnChange(value);
    form.setValue("brand", "");
  }

  function handleBrandChange(value: string, fieldOnChange: (v: string) => void) {
    fieldOnChange(value);
  }

  function handleLabChange(value: string, fieldOnChange: (v: string) => void) {
    fieldOnChange(value);
    const lab = allLabs.find((l) => l.name === value);
    form.setValue("labAccountNumber", lab?.account ?? "");
  }

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
    const payload = {
      ...values,
      barcode: values.barcode || null,
      multiplier: values.multiplier || null,
      labOrderNumber: values.labOrderNumber || null,
      labName: values.labName || null,
      labAccountNumber: values.labAccountNumber || null,
      trackingNumber: values.trackingNumber || null,
      dateSentToLab: values.dateSentToLab || null,
      visionPlan: values.visionPlan || null,
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  const isAtLab = watchedStatus === "at_lab";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Frame" : "Add New Frame"}</DialogTitle>
            {!isEdit && prefillBarcode && (
              <DialogDescription>
                No frame found for barcode{" "}
                <span className="font-mono font-semibold text-foreground">{prefillBarcode}</span>. Fill in the details below.
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Barcode */}
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

              {/* Manufacturer + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => handleManufacturerChange(v, field.onChange)}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-manufacturer">
                            <SelectValue placeholder="Select manufacturer..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Manufacturers</SelectLabel>
                            {allManufacturers.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                      <Select
                        value={field.value}
                        onValueChange={(v) => handleBrandChange(v, field.onChange)}
                        disabled={!watchedManufacturer}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-brand">
                            <SelectValue
                              placeholder={
                                watchedManufacturer
                                  ? "Select brand..."
                                  : "Select manufacturer first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableBrandNames.length > 0 ? (
                            <SelectGroup>
                              <SelectLabel>{watchedManufacturer} Brands</SelectLabel>
                              {availableBrandNames.map((b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ) : (
                            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                              No brands for this manufacturer.<br />Add brands in Settings.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Model + Color */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. RB5154" data-testid="input-model" {...field} />
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
                        <Input placeholder="e.g. Matte Black" data-testid="input-color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sizes */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="eyeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye Size (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={99} data-testid="input-eye-size" {...field} />
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
                        <Input type="number" min={1} max={99} data-testid="input-bridge" {...field} />
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
                        <Input type="number" min={1} max={999} data-testid="input-temple" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wholesale Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} placeholder="0.00" data-testid="input-cost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          placeholder="e.g. 3"
                          data-testid="input-multiplier"
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
                  name="retailPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retail Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} placeholder="0.00" data-testid="input-retail-price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status" className="w-48">
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

              {/* Lab fields — shown only when status = at_lab */}
              {isAtLab && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <FlaskConical className="w-4 h-4" />
                    <p className="text-sm font-semibold">Lab Details</p>
                  </div>

                  {/* Vision Plan — required */}
                  <FormField
                    control={form.control}
                    name="visionPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Vision Plan <span className="text-destructive ml-0.5">*</span>
                        </FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-vision-plan">
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

                  {/* Row 1: Lab Name + Account Number display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="labName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" /> Lab Name
                          </FormLabel>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => handleLabChange(v, field.onChange)}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-lab-name">
                                <SelectValue placeholder="Select lab..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Labs</SelectLabel>
                                {allLabs.map((lab) => (
                                  <SelectItem key={lab.name} value={lab.name}>
                                    <span className="flex items-center justify-between gap-3 w-full">
                                      <span>{lab.name}</span>
                                      {lab.account && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          #{lab.account}
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="labAccountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-muted-foreground" /> Account Number
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Auto-filled on lab selection"
                                data-testid="input-lab-account-number"
                                {...field}
                                value={field.value ?? ""}
                                className="font-mono"
                                readOnly={!!allLabs.find((l) => l.name === form.watch("labName") && l.account)}
                              />
                              {field.value && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                                  auto
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Order Number + Date + Tracking */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="labOrderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-muted-foreground" /> Order Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. ORD-12345"
                              data-testid="input-lab-order-number"
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
                          <FormLabel className="flex items-center gap-1">
                            <ChevronsUpDown className="w-3 h-3 text-muted-foreground" /> Date Sent
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              data-testid="input-date-sent-to-lab"
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
                          <FormLabel className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted-foreground" /> Tracking Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 1Z999AA0..."
                              data-testid="input-tracking-number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-frame">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-frame">
                  {isPending ? "Saving..." : isEdit ? "Update Frame" : "Add Frame"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </>
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
  const [foundFrame, setFoundFrame] = useState<Frame | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [scanState, setScanState] = useState<"idle" | "found" | "not_found">("idle");
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
      toast({ title: "Frame deleted", description: "The frame has been removed from inventory." });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete frame.", variant: "destructive" });
    },
  });

  const filtered = frames.filter((frame) => {
    const matchesStatus = statusFilter === "all" || frame.status === statusFilter;
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

  function highlightFrame(id: string) {
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 4000);
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
      const match = frames.find((f) => f.barcode && f.barcode.trim() === barcode);
      if (match) {
        setScanState("found");
        setFoundFrame(match);
        highlightFrame(match.id);
        setScanValue("");
      } else {
        setScanState("not_found");
        setFoundFrame(null);
        setScanValue("");
        setPrefillBarcode(barcode);
        setEditFrame(null);
        setDialogOpen(true);
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

  function dismissFoundCard() {
    setFoundFrame(null);
    setScanState("idle");
    scanInputRef.current?.focus();
  }

  function openEditFromFound() {
    if (!foundFrame) return;
    setFoundFrame(null);
    setScanState("idle");
    setEditFrame(foundFrame);
    setPrefillBarcode("");
    setDialogOpen(true);
  }

  function openAdd() {
    setEditFrame(null);
    setPrefillBarcode("");
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {frames.length} frame{frames.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={openAdd} data-testid="button-add-frame">
          <Plus className="w-4 h-4 mr-2" />
          Add Frame
        </Button>
      </div>

      {/* Barcode scanner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors duration-200 ${
          scanState === "found"
            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
            : scanState === "not_found"
            ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20"
            : "border-border bg-muted/30"
        }`}
        data-testid="barcode-scanner-panel"
      >
        <div
          className={`p-2.5 rounded-md flex-shrink-0 transition-colors duration-200 ${
            scanState === "found"
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
              : scanState === "not_found"
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
              : "bg-background text-muted-foreground"
          }`}
        >
          <ScanLine className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor="scan-input" className="block text-sm font-medium text-foreground mb-1">
            Scan Frame Barcode
          </label>
          <div className="relative">
            <Input
              id="scan-input"
              ref={scanInputRef}
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              onKeyDown={handleScanKeyDown}
              placeholder="Focus here and scan with USB barcode scanner..."
              className="font-mono"
              autoComplete="off"
              data-testid="input-barcode-scan"
            />
            {scanValue && (
              <button
                onClick={() => { setScanValue(""); scanInputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-clear-scan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 min-w-[90px]">
          {scanState === "found" ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Frame found
            </p>
          ) : scanState === "not_found" ? (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Not found
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Ready to scan</p>
          )}
        </div>
      </div>

      {/* Frame found detail card */}
      {foundFrame && (
        <FrameFoundCard
          frame={foundFrame}
          onDismiss={dismissFoundCard}
          onEdit={openEditFromFound}
        />
      )}

      {/* Search + filter */}
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
              {s === "all" ? "All" : s === "on_board" ? "On Board" : s === "at_lab" ? "At Lab" : "Sold"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-card-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                <Button className="mt-4" onClick={openAdd} data-testid="button-add-first-frame">
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
                    <TableHead className="text-right">Wholesale</TableHead>
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
                        className={`border-b border-card-border/60 last:border-0 transition-colors duration-500 ${
                          isHighlighted ? "bg-primary/10 dark:bg-primary/15" : ""
                        }`}
                      >
                        <TableCell className="pl-6 py-3.5">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{frame.brand}</p>
                            <p className="text-xs text-muted-foreground">{frame.model}</p>
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
                            <span className="text-xs text-muted-foreground/40 italic">—</span>
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
                          <div className="space-y-1">
                            <StatusPill status={frame.status} />
                            {frame.status === "at_lab" && frame.labName && (
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {frame.labName}
                              </p>
                            )}
                          </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Frame</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this frame from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
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
