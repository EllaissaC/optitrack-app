import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings as SettingsIcon, Mail, FlaskConical, Users, Tag, ChevronRight,
  Plus, Pencil, Trash2, Copy, Check, AlertCircle, Send, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Lab, Manufacturer, Brand } from "@shared/schema";

// ─── Settings (Email + Pricing) ───────────────────────────────────────────────

const emailSettingsSchema = z.object({
  reminderEmail: z.string().email("Enter a valid email address").or(z.literal("")),
  emailFrom: z.string().email("Enter a valid sender email address").or(z.literal("")),
  labReminderDays: z.string().refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 1), {
    message: "Must be a number of days (1 or more)",
  }),
  defaultMultiplier: z.string().refine((v) => !v || (!isNaN(Number(v)) && Number(v) > 0), {
    message: "Must be a positive number",
  }),
});

type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;

function GeneralSettingsTab({ settingsMap }: { settingsMap: Record<string, string> }) {
  const { toast } = useToast();

  const form = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      reminderEmail: settingsMap.reminderEmail || "",
      emailFrom: settingsMap.emailFrom || "",
      labReminderDays: settingsMap.labReminderDays || "14",
      defaultMultiplier: settingsMap.defaultMultiplier || "",
    },
  });

  const save = useMutation({
    mutationFn: async (data: EmailSettingsValues) => {
      await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
    onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
  });

  const checkReminders = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reminders/check");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reminder check complete",
        description: data.reason || `${data.sent} email(s) sent, ${data.skipped} skipped`,
      });
    },
    onError: () => toast({ title: "Reminder check failed", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" /> Email Reminders
          </CardTitle>
          <CardDescription>Configure automatic lab follow-up email reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="reminderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="reminders@clinic.com" data-testid="input-reminder-email" />
                    </FormControl>
                    <FormDescription>Where to send lab follow-up reminder emails.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="noreply@clinic.com" data-testid="input-email-from" />
                    </FormControl>
                    <FormDescription>Must be a verified sender in your SendGrid account.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="labReminderDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Reminder Delay (days)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" placeholder="14" data-testid="input-reminder-days" />
                    </FormControl>
                    <FormDescription>Send a reminder after this many days at the lab. Default is 14.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={form.control}
                name="defaultMultiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Price Multiplier</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0.01" placeholder="e.g. 2.5" data-testid="input-default-multiplier" />
                    </FormControl>
                    <FormDescription>Pre-fills the multiplier field when adding a new frame.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" disabled={save.isPending} data-testid="button-save-settings">
                  {save.isPending ? "Saving..." : "Save settings"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={checkReminders.isPending}
                  onClick={() => checkReminders.mutate()}
                  data-testid="button-send-reminders"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {checkReminders.isPending ? "Checking..." : "Send reminders now"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Email sending not configured</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Add a <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">SENDGRID_API_KEY</code> secret to enable email delivery. The reminder system will still track overdue frames even without email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Labs Management ─────────────────────────────────────────────────────────

function LabsTab() {
  const { toast } = useToast();
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAccount, setFormAccount] = useState("");

  const { data: labs = [], isLoading } = useQuery<Lab[]>({ queryKey: ["/api/labs"] });

  const createLab = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/labs", { name: formName.trim(), account: formAccount.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labs"] });
      setShowAdd(false);
      setFormName("");
      setFormAccount("");
      toast({ title: "Lab added" });
    },
    onError: (e: any) => toast({ title: e.message?.replace(/^\d+:\s*/, "") || "Failed to add lab", variant: "destructive" }),
  });

  const updateLab = useMutation({
    mutationFn: async () => {
      if (!editLab) return;
      await apiRequest("PATCH", `/api/labs/${editLab.id}`, { name: formName.trim(), account: formAccount.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labs"] });
      setEditLab(null);
      toast({ title: "Lab updated" });
    },
    onError: () => toast({ title: "Failed to update lab", variant: "destructive" }),
  });

  const deleteLab = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/labs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labs"] });
      toast({ title: "Lab deleted" });
    },
    onError: () => toast({ title: "Failed to delete lab", variant: "destructive" }),
  });

  function openEdit(lab: Lab) {
    setEditLab(lab);
    setFormName(lab.name);
    setFormAccount(lab.account);
  }

  function openAdd() {
    setFormName("");
    setFormAccount("");
    setShowAdd(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Labs</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{labs.length} lab{labs.length !== 1 ? "s" : ""} configured</p>
        </div>
        <Button size="sm" onClick={openAdd} data-testid="button-add-lab">
          <Plus className="w-4 h-4 mr-1.5" /> Add Lab
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : labs.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No labs yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {labs.map((lab) => (
                <div key={lab.id} className="flex items-center justify-between px-4 py-3 gap-3" data-testid={`row-lab-${lab.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{lab.name}</p>
                    {lab.account && (
                      <p className="text-xs text-muted-foreground">Account: {lab.account}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lab)} data-testid={`button-edit-lab-${lab.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteLab.mutate(lab.id)}
                      disabled={deleteLab.isPending}
                      data-testid={`button-delete-lab-${lab.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <FormLabel>Lab Name</FormLabel>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Vision-Craft" data-testid="input-lab-name" />
            </div>
            <div className="space-y-2">
              <FormLabel>Account Number</FormLabel>
              <Input value={formAccount} onChange={(e) => setFormAccount(e.target.value)} placeholder="e.g. Y1500" data-testid="input-lab-account" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => createLab.mutate()} disabled={!formName.trim() || createLab.isPending} data-testid="button-confirm-add-lab">
              {createLab.isPending ? "Adding..." : "Add Lab"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLab} onOpenChange={(open) => !open && setEditLab(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <FormLabel>Lab Name</FormLabel>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} data-testid="input-edit-lab-name" />
            </div>
            <div className="space-y-2">
              <FormLabel>Account Number</FormLabel>
              <Input value={formAccount} onChange={(e) => setFormAccount(e.target.value)} data-testid="input-edit-lab-account" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLab(null)}>Cancel</Button>
            <Button onClick={() => updateLab.mutate()} disabled={!formName.trim() || updateLab.isPending} data-testid="button-confirm-edit-lab">
              {updateLab.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Manufacturers & Brands ───────────────────────────────────────────────────

function ManufacturersTab() {
  const { toast } = useToast();
  const [selectedMfgId, setSelectedMfgId] = useState<string | null>(null);
  const [editMfg, setEditMfg] = useState<Manufacturer | null>(null);
  const [showAddMfg, setShowAddMfg] = useState(false);
  const [mfgName, setMfgName] = useState("");
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [brandName, setBrandName] = useState("");

  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({ queryKey: ["/api/manufacturers"] });
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/manufacturers", selectedMfgId, "brands"],
    enabled: !!selectedMfgId,
  });

  const selectedMfg = manufacturers.find((m) => m.id === selectedMfgId);

  const createMfg = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/manufacturers", { name: mfgName.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setShowAddMfg(false);
      setMfgName("");
      toast({ title: "Manufacturer added" });
    },
    onError: (e: any) => toast({ title: e.message?.replace(/^\d+:\s*/, "") || "Failed", variant: "destructive" }),
  });

  const updateMfg = useMutation({
    mutationFn: async () => {
      if (!editMfg) return;
      await apiRequest("PATCH", `/api/manufacturers/${editMfg.id}`, { name: mfgName.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setEditMfg(null);
      toast({ title: "Manufacturer updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMfg = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/manufacturers/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      if (selectedMfgId === id) setSelectedMfgId(null);
      toast({ title: "Manufacturer deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const createBrand = useMutation({
    mutationFn: async () => {
      if (!selectedMfgId) return;
      await apiRequest("POST", `/api/manufacturers/${selectedMfgId}/brands`, { name: brandName.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers", selectedMfgId, "brands"] });
      setShowAddBrand(false);
      setBrandName("");
      toast({ title: "Brand added" });
    },
    onError: (e: any) => toast({ title: e.message?.replace(/^\d+:\s*/, "") || "Failed", variant: "destructive" }),
  });

  const updateBrand = useMutation({
    mutationFn: async () => {
      if (!editBrand) return;
      await apiRequest("PATCH", `/api/brands/${editBrand.id}`, { name: brandName.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers", selectedMfgId, "brands"] });
      setEditBrand(null);
      toast({ title: "Brand updated" });
    },
    onError: () => toast({ title: "Failed to update brand", variant: "destructive" }),
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers", selectedMfgId, "brands"] });
      toast({ title: "Brand deleted" });
    },
    onError: () => toast({ title: "Failed to delete brand", variant: "destructive" }),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Manufacturers</h3>
          <Button size="sm" onClick={() => { setMfgName(""); setShowAddMfg(true); }} data-testid="button-add-manufacturer">
            <Plus className="w-4 h-4 mr-1.5" /> Add
          </Button>
        </div>
        <Card className="border-border">
          <CardContent className="p-0 max-h-[420px] overflow-y-auto">
            {manufacturers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No manufacturers yet</div>
            ) : (
              <div className="divide-y divide-border">
                {manufacturers.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between px-4 py-2.5 gap-2 cursor-pointer transition-colors ${selectedMfgId === m.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/40"}`}
                    onClick={() => setSelectedMfgId(m.id === selectedMfgId ? null : m.id)}
                    data-testid={`row-manufacturer-${m.id}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform text-muted-foreground ${selectedMfgId === m.id ? "rotate-90" : ""}`} />
                      <span className="text-sm font-medium truncate">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditMfg(m); setMfgName(m.name); }} data-testid={`button-edit-manufacturer-${m.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMfg.mutate(m.id)} data-testid={`button-delete-manufacturer-${m.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {selectedMfg ? `Brands — ${selectedMfg.name}` : "Brands"}
          </h3>
          {selectedMfg && (
            <Button size="sm" onClick={() => { setBrandName(""); setShowAddBrand(true); }} data-testid="button-add-brand">
              <Plus className="w-4 h-4 mr-1.5" /> Add
            </Button>
          )}
        </div>
        <Card className="border-border">
          <CardContent className="p-0 max-h-[420px] overflow-y-auto">
            {!selectedMfgId ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Select a manufacturer to see its brands</div>
            ) : brands.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No brands yet</div>
            ) : (
              <div className="divide-y divide-border">
                {brands.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-4 py-2.5 gap-2" data-testid={`row-brand-${b.id}`}>
                    <span className="text-sm text-foreground flex-1 min-w-0 truncate">{b.name}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBrand(b); setBrandName(b.name); }} data-testid={`button-edit-brand-${b.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteBrand.mutate(b.id)} data-testid={`button-delete-brand-${b.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddMfg} onOpenChange={setShowAddMfg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Manufacturer</DialogTitle></DialogHeader>
          <div className="py-1">
            <FormLabel>Name</FormLabel>
            <Input className="mt-2" value={mfgName} onChange={(e) => setMfgName(e.target.value)} placeholder="e.g. Luxottica" data-testid="input-manufacturer-name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMfg(false)}>Cancel</Button>
            <Button onClick={() => createMfg.mutate()} disabled={!mfgName.trim() || createMfg.isPending} data-testid="button-confirm-add-manufacturer">
              {createMfg.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editMfg} onOpenChange={(o) => !o && setEditMfg(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Manufacturer</DialogTitle></DialogHeader>
          <div className="py-1">
            <FormLabel>Name</FormLabel>
            <Input className="mt-2" value={mfgName} onChange={(e) => setMfgName(e.target.value)} data-testid="input-edit-manufacturer-name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMfg(null)}>Cancel</Button>
            <Button onClick={() => updateMfg.mutate()} disabled={!mfgName.trim() || updateMfg.isPending} data-testid="button-confirm-edit-manufacturer">
              {updateMfg.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddBrand} onOpenChange={setShowAddBrand}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Brand to {selectedMfg?.name}</DialogTitle></DialogHeader>
          <div className="py-1">
            <FormLabel>Brand Name</FormLabel>
            <Input className="mt-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Ray-Ban" data-testid="input-brand-name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBrand(false)}>Cancel</Button>
            <Button onClick={() => createBrand.mutate()} disabled={!brandName.trim() || createBrand.isPending} data-testid="button-confirm-add-brand">
              {createBrand.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBrand} onOpenChange={(o) => !o && setEditBrand(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Brand</DialogTitle></DialogHeader>
          <div className="py-1">
            <FormLabel>Brand Name</FormLabel>
            <Input className="mt-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} data-testid="input-edit-brand-name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBrand(null)}>Cancel</Button>
            <Button onClick={() => updateBrand.mutate()} disabled={!brandName.trim() || updateBrand.isPending} data-testid="button-confirm-edit-brand">
              {updateBrand.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Team Management ─────────────────────────────────────────────────────────

interface TeamUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff";
  isActive: boolean;
  createdAt: string;
  hasInvitePending: boolean;
}

function TeamTab() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: users = [], isLoading } = useQuery<TeamUser[]>({ queryKey: ["/api/users"] });

  const invite = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/users/invite", { email: inviteEmail.trim(), role: inviteRole });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setGeneratedLink(data.inviteUrl);
      setInviteEmail("");
      toast({ title: "Invite created" });
    },
    onError: (e: any) => toast({ title: e.message?.replace(/^\d+:\s*/, "") || "Failed to create invite", variant: "destructive" }),
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User updated" });
    },
    onError: () => toast({ title: "Failed to update user", variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User removed" });
    },
    onError: (e: any) => toast({ title: e.message?.replace(/^\d+:\s*/, "") || "Failed to remove user", variant: "destructive" }),
  });

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => { setInviteEmail(""); setInviteRole("staff"); setGeneratedLink(null); setShowInvite(true); }} data-testid="button-invite-user">
          <Plus className="w-4 h-4 mr-1.5" /> Invite User
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No users yet</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3" data-testid={`row-user-${u.id}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {(u.username || u.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{u.username}</p>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {u.role}
                      </Badge>
                      {u.hasInvitePending && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          pending
                        </Badge>
                      )}
                      {!u.isActive && !u.hasInvitePending && (
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                          disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {u.id !== currentUser?.id && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline" size="sm" className="h-7 text-xs"
                        onClick={() => updateUser.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                        disabled={updateUser.isPending}
                        data-testid={`button-toggle-user-${u.id}`}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteUser.mutate(u.id)}
                        disabled={deleteUser.isPending}
                        data-testid={`button-delete-user-${u.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={(open) => { setShowInvite(open); if (!open) setGeneratedLink(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          {generatedLink ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Invite link generated. Share it with the user — it expires in 7 days.
                {" "}If SendGrid is configured and a reminder email address is set, an email was also sent.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <code className="text-xs flex-1 min-w-0 break-all text-foreground">{generatedLink}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => copyLink(generatedLink)} data-testid="button-copy-invite-link">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowInvite(false); setGeneratedLink(null); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <FormLabel>Email address</FormLabel>
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="staff@clinic.com" data-testid="input-invite-email" />
              </div>
              <div className="space-y-2">
                <FormLabel>Role</FormLabel>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "staff")}>
                  <SelectTrigger data-testid="select-invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                <Button
                  onClick={() => invite.mutate()}
                  disabled={!inviteEmail.trim() || invite.isPending}
                  data-testid="button-confirm-invite"
                >
                  {invite.isPending ? "Creating..." : "Create Invite"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settingsMap = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    enabled: isAdmin,
  });

  if (authLoading) return null;

  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">You need admin access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage system configuration and user access.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general" data-testid="tab-general">
            <Mail className="w-4 h-4 mr-1.5" /> General
          </TabsTrigger>
          <TabsTrigger value="labs" data-testid="tab-labs">
            <FlaskConical className="w-4 h-4 mr-1.5" /> Labs
          </TabsTrigger>
          <TabsTrigger value="manufacturers" data-testid="tab-manufacturers">
            <Package className="w-4 h-4 mr-1.5" /> Brands
          </TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">
            <Users className="w-4 h-4 mr-1.5" /> Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab settingsMap={settingsMap} />
        </TabsContent>
        <TabsContent value="labs">
          <LabsTab />
        </TabsContent>
        <TabsContent value="manufacturers">
          <ManufacturersTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
