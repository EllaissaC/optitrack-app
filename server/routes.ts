import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import { storage } from "./storage";
import { insertFrameSchema, insertWeeklyMetricSchema, insertClinicSchema, insertLabOrderSchema } from "@shared/schema";
import { requireAuth, requireAdmin } from "./auth";
import { sendLabFollowUpEmail } from "./email";
import { parseInvoiceFromImage, parseInvoiceFromPdf } from "./invoiceParser";
import { z } from "zod";
import type { User, Clinic } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Auth Routes ──────────────────────────────────────────────────────────

  app.get("/api/auth/me", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as User;
    let clinic: Clinic | undefined;
    if (user.clinicId) {
      clinic = await storage.getClinic(user.clinicId);
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      clinicId: user.clinicId ?? null,
      clinic: clinic ?? null,
    });
  });

  app.get("/api/auth/setup-required", async (_req, res) => {
    const count = await storage.countUsers();
    res.json({ setupRequired: count === 0 });
  });

  app.post("/api/auth/setup", async (req, res) => {
    try {
      const count = await storage.countUsers();
      if (count > 0) return res.status(400).json({ message: "Setup already complete" });

      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ username, email, password: hashed, role: "admin" });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after setup" });
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
      });
    } catch {
      res.status(500).json({ message: "Setup failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      req.login(user, async (loginErr) => {
        if (loginErr) return next(loginErr);
        const setting = await storage.getSetting("sessionExpirationDays");
        const days = setting ? Math.max(1, parseInt(setting)) : 7;
        const maxAge = days * 24 * 60 * 60 * 1000;
        req.session.expiresAt = Date.now() + maxAge;
        req.session.cookie.maxAge = maxAge;
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.patch("/api/auth/account", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { currentPassword, newEmail, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const fullUser = await storage.getUser(user.id);
      if (!fullUser) return res.status(404).json({ message: "User not found" });

      const valid = await bcrypt.compare(currentPassword, fullUser.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      if (!newEmail && !newPassword) {
        return res.status(400).json({ message: "No changes provided" });
      }

      if (newPassword && newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      const updates: Partial<Pick<User, "email" | "password">> = {};

      if (newEmail && newEmail !== fullUser.email) {
        const existing = await storage.getUserByEmail(newEmail);
        if (existing) {
          return res.status(409).json({ message: "That email address is already in use" });
        }
        updates.email = newEmail;
      }

      if (newPassword) {
        updates.password = await bcrypt.hash(newPassword, 12);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No changes to save" });
      }

      const updated = await storage.updateUser(user.id, updates);
      if (!updated) return res.status(500).json({ message: "Failed to update account" });

      await new Promise<void>((resolve, reject) => {
        req.login(updated, (err) => (err ? reject(err) : resolve()));
      });

      res.json({ id: updated.id, username: updated.username, email: updated.email, role: updated.role });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to update account" });
    }
  });

  app.get("/api/auth/invite/:token", async (req, res) => {
    const user = await storage.getUserByInviteToken(req.params.token);
    if (!user) return res.status(404).json({ message: "Invalid or expired invite" });
    if (user.inviteExpiry && new Date() > user.inviteExpiry) {
      return res.status(410).json({ message: "Invite link has expired" });
    }
    res.json({ email: user.email, role: user.role });
  });

  app.post("/api/auth/accept-invite", async (req, res) => {
    try {
      const { token, username, password } = req.body;
      if (!token || !username || !password) {
        return res.status(400).json({ message: "Token, username, and password are required" });
      }

      const user = await storage.getUserByInviteToken(token);
      if (!user) return res.status(404).json({ message: "Invalid or expired invite" });
      if (user.inviteExpiry && new Date() > user.inviteExpiry) {
        return res.status(410).json({ message: "Invite link has expired" });
      }

      const hashed = await bcrypt.hash(password, 12);
      const updated = await storage.updateUser(user.id, {
        username,
        password: hashed,
        isActive: true,
        inviteToken: null as any,
        inviteExpiry: null as any,
      });

      if (!updated) return res.status(500).json({ message: "Failed to activate account" });

      req.login(updated, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after accepting invite" });
        res.json({ id: updated.id, username: updated.username, email: updated.email, role: updated.role });
      });
    } catch {
      res.status(500).json({ message: "Failed to accept invite" });
    }
  });

  // ─── User Management (Admin Only) ──────────────────────────────────────────

  app.get("/api/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getUsers();
    res.json(allUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      hasInvitePending: !!u.inviteToken,
    })));
  });

  app.post("/api/users/invite", requireAdmin, async (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email || !role) return res.status(400).json({ message: "Email and role are required" });
      if (!["admin", "optician", "staff"].includes(role)) return res.status(400).json({ message: "Invalid role" });

      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(409).json({ message: "A user with this email already exists" });

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(tempPassword, 12);

      const invitingAdmin = req.user as User;
      const user = await storage.createUser({
        username: email,
        email,
        password: hashed,
        role: role as "admin" | "optician" | "staff",
        clinicId: invitingAdmin.clinicId ?? null,
        isActive: false,
      });

      await storage.updateUser(user.id, { inviteToken: token, inviteExpiry: expiry });

      const inviteUrl = `${req.protocol}://${req.get("host")}/invite?token=${token}`;

      const reminderEmail = await storage.getSetting("reminderEmail");
      const emailFrom = await storage.getSetting("emailFrom");

      if (reminderEmail && emailFrom && process.env.SENDGRID_API_KEY) {
        try {
          const sgMail = await import("@sendgrid/mail");
          sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
          await sgMail.default.send({
            to: email,
            from: emailFrom,
            subject: "You have been invited to OptiTrack",
            text: `You have been invited to join OptiTrack as ${role}.\n\nClick the link below to set up your account:\n${inviteUrl}\n\nThis link expires in 7 days.`,
            html: `<p>You have been invited to join OptiTrack as <strong>${role}</strong>.</p><p><a href="${inviteUrl}">Accept Invitation</a></p><p>This link expires in 7 days.</p>`,
          });
        } catch {
          // Email failed, but invite was created — return the URL anyway
        }
      }

      res.status(201).json({ inviteUrl, email, role });
    } catch {
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { role, isActive } = req.body;
      const updates: any = {};
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;

      const updated = await storage.updateUser(req.params.id as string, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({ id: updated.id, username: updated.username, email: updated.email, role: updated.role, isActive: updated.isActive });
    } catch {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (req.params.id as string === currentUser.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      const deleted = await storage.deleteUser(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ─── Settings (Admin Only) ──────────────────────────────────────────────────

  app.get("/api/settings", requireAuth, async (_req, res) => {
    const rows = await storage.getSettings();
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  });

  app.put("/api/settings", requireAdmin, async (req, res) => {
    try {
      const entries = Object.entries(req.body).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await storage.setSettings(entries);
      res.json({ message: "Settings saved" });
    } catch {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // ─── Clinics ───────────────────────────────────────────────────────────────

  app.get("/api/clinics", requireAuth, async (_req, res) => {
    const allClinics = await storage.getClinics();
    res.json(allClinics);
  });

  app.post("/api/clinics", requireAdmin, async (req, res) => {
    try {
      const parsed = insertClinicSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid clinic data" });
      const clinic = await storage.createClinic(parsed.data);
      res.status(201).json(clinic);
    } catch {
      res.status(500).json({ message: "Failed to create clinic" });
    }
  });

  app.put("/api/clinics/:id", requireAdmin, async (req, res) => {
    try {
      const { clinicName, address, city, state, zip } = req.body;
      const updates: Record<string, string | null> = {};
      if (clinicName !== undefined) updates.clinicName = clinicName;
      if (address !== undefined) updates.address = address || null;
      if (city !== undefined) updates.city = city || null;
      if (state !== undefined) updates.state = state || null;
      if (zip !== undefined) updates.zip = zip || null;
      const updated = await storage.updateClinic(req.params.id, updates as any);
      if (!updated) return res.status(404).json({ message: "Clinic not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update clinic" });
    }
  });

  app.delete("/api/clinics/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteClinic(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Clinic not found" });
      res.json({ message: "Clinic deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete clinic" });
    }
  });

  app.patch("/api/users/:id/clinic", requireAdmin, async (req, res) => {
    try {
      const { clinicId } = req.body;
      const updated = await storage.updateUser(req.params.id, { clinicId: clinicId ?? null });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({ id: updated.id, username: updated.username, clinicId: updated.clinicId });
    } catch {
      res.status(500).json({ message: "Failed to update user clinic" });
    }
  });

  // ─── Labs ──────────────────────────────────────────────────────────────────

  app.get("/api/labs", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allLabs = await storage.getLabs(user.clinicId);
    res.json(allLabs);
  });

  app.post("/api/labs", requireAdmin, async (req, res) => {
    try {
      const { name, account } = req.body;
      if (!name) return res.status(400).json({ message: "Lab name is required" });
      const user = req.user as User;
      const lab = await storage.createLab({ name, account: account || "", clinicId: user.clinicId ?? null });
      res.status(201).json(lab);
    } catch {
      res.status(500).json({ message: "Failed to create lab" });
    }
  });

  app.patch("/api/labs/:id", requireAdmin, async (req, res) => {
    try {
      const { name, account } = req.body;
      const updated = await storage.updateLab(req.params.id as string, { name, account });
      if (!updated) return res.status(404).json({ message: "Lab not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update lab" });
    }
  });

  app.delete("/api/labs/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteLab(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Lab not found" });
      res.json({ message: "Lab deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete lab" });
    }
  });

  // ─── Manufacturers ──────────────────────────────────────────────────────────

  app.get("/api/manufacturers", requireAuth, async (_req, res) => {
    const all = await storage.getManufacturers();
    res.json(all);
  });

  app.post("/api/manufacturers", requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Manufacturer name is required" });
      const mfg = await storage.createManufacturer({ name });
      res.status(201).json(mfg);
    } catch {
      res.status(500).json({ message: "Failed to create manufacturer" });
    }
  });

  app.patch("/api/manufacturers/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateManufacturer(req.params.id as string, { name: req.body.name });
      if (!updated) return res.status(404).json({ message: "Manufacturer not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update manufacturer" });
    }
  });

  app.delete("/api/manufacturers/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteManufacturer(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Manufacturer not found" });
      res.json({ message: "Manufacturer deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete manufacturer" });
    }
  });

  // ─── Brands ────────────────────────────────────────────────────────────────

  app.get("/api/manufacturers/:id/brands", requireAuth, async (req, res) => {
    const all = await storage.getBrands(req.params.id as string);
    res.json(all);
  });

  app.post("/api/manufacturers/:id/brands", requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Brand name is required" });
      const brand = await storage.createBrand({ manufacturerId: req.params.id as string, name });
      res.status(201).json(brand);
    } catch {
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.patch("/api/brands/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateBrand(req.params.id as string, { name: req.body.name });
      if (!updated) return res.status(404).json({ message: "Brand not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete("/api/brands/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBrand(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Brand not found" });
      res.json({ message: "Brand deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  // ─── Frame Reminder Check ──────────────────────────────────────────────────

  app.post("/api/reminders/check", requireAdmin, async (req, res) => {
    try {
      const reminderEmail = await storage.getSetting("reminderEmail");
      const emailFrom = await storage.getSetting("emailFrom") || reminderEmail;
      const reminderDaysStr = await storage.getSetting("labReminderDays");
      const reminderDays = reminderDaysStr ? parseInt(reminderDaysStr) : 14;

      if (!reminderEmail || !emailFrom) {
        return res.json({ sent: 0, skipped: 0, reason: "No reminder email configured in Settings" });
      }

      const adminUser = req.user as User;
      const allFrames = await storage.getFrames(adminUser.clinicId);
      const today = new Date();
      let sent = 0;
      let skipped = 0;
      const results: any[] = [];

      for (const frame of allFrames) {
        if (frame.status !== "at_lab" || !frame.dateSentToLab) continue;

        const dateSent = new Date(frame.dateSentToLab);
        const daysAtLab = Math.floor((today.getTime() - dateSent.getTime()) / (1000 * 60 * 60 * 24));

        if (daysAtLab >= reminderDays) {
          const result = await sendLabFollowUpEmail({
            to: reminderEmail,
            from: emailFrom,
            brand: frame.brand,
            model: frame.model,
            labName: frame.labName || "Unknown Lab",
            visionPlan: frame.visionPlan || "",
            labOrderNumber: frame.labOrderNumber || "",
            dateSentToLab: frame.dateSentToLab,
            daysAtLab,
          });
          if (result.sent) {
            sent++;
          } else {
            skipped++;
          }
          results.push({ frame: `${frame.brand} ${frame.model}`, daysAtLab, ...result });
        }
      }

      res.json({ sent, skipped, results });
    } catch {
      res.status(500).json({ message: "Failed to check reminders" });
    }
  });

  // ─── Frames ────────────────────────────────────────────────────────────────

  app.get("/api/frames", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const allFrames = await storage.getFrames(user.clinicId);
      res.json(allFrames);
    } catch {
      res.status(500).json({ message: "Failed to fetch frames" });
    }
  });

  app.get("/api/frames/:id", requireAuth, async (req, res) => {
    try {
      const frame = await storage.getFrame(req.params.id as string);
      if (!frame) return res.status(404).json({ message: "Frame not found" });
      res.json(frame);
    } catch {
      res.status(500).json({ message: "Failed to fetch frame" });
    }
  });

  app.post("/api/frames", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const parsed = insertFrameSchema.safeParse({ ...req.body, clinicId: user.clinicId ?? null });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const duplicate = await storage.findDuplicateFrame({
        barcode: parsed.data.barcode,
        brand: parsed.data.brand,
        model: parsed.data.model,
        color: parsed.data.color,
        eyeSize: parsed.data.eyeSize,
        clinicId: parsed.data.clinicId,
      });
      if (duplicate) {
        return res.status(409).json({
          existingFrameId: duplicate.id,
          existingBrand: duplicate.brand,
          existingModel: duplicate.model,
          existingColor: duplicate.color,
        });
      }
      const frame = await storage.createFrame(parsed.data);
      res.status(201).json(frame);
    } catch {
      res.status(500).json({ message: "Failed to create frame" });
    }
  });

  app.post("/api/frames/replace", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { existingFrameId, newFrame } = req.body;
      if (!existingFrameId || !newFrame) {
        return res.status(400).json({ message: "existingFrameId and newFrame are required" });
      }
      const parsed = insertFrameSchema.safeParse({ ...newFrame, clinicId: user.clinicId ?? null });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const frame = await storage.replaceFrame(existingFrameId as string, parsed.data);
      res.status(201).json(frame);
    } catch {
      res.status(500).json({ message: "Failed to replace frame" });
    }
  });

  app.patch("/api/frames/:id", requireAuth, async (req, res) => {
    try {
      const parsed = insertFrameSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const updates = { ...parsed.data };
      if (updates.status === "sold" && !updates.dateSold) {
        updates.dateSold = new Date().toISOString().split("T")[0];
      }
      const frame = await storage.updateFrame(req.params.id as string, updates);
      if (!frame) return res.status(404).json({ message: "Frame not found" });
      res.json(frame);
    } catch {
      res.status(500).json({ message: "Failed to update frame" });
    }
  });

  app.delete("/api/frames/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteFrame(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Frame not found" });
      res.json({ message: "Frame deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete frame" });
    }
  });

  app.get("/api/weekly-metrics", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const metrics = await storage.getWeeklyMetrics(user.clinicId);
      res.json(metrics);
    } catch {
      res.status(500).json({ message: "Failed to fetch weekly metrics" });
    }
  });

  app.post("/api/weekly-metrics", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const parsed = insertWeeklyMetricSchema.safeParse({ ...req.body, clinicId: user.clinicId ?? null });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const metric = await storage.createWeeklyMetric(parsed.data);
      res.status(201).json(metric);
    } catch {
      res.status(500).json({ message: "Failed to save weekly metrics" });
    }
  });

  app.delete("/api/weekly-metrics/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteWeeklyMetric(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete weekly metric" });
    }
  });

  // ─── Lab Orders ─────────────────────────────────────────────────────────────

  app.get("/api/lab-orders", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const orders = await storage.getLabOrders(user.clinicId);
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Failed to fetch lab orders" });
    }
  });

  app.post("/api/lab-orders", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const parsed = insertLabOrderSchema.safeParse({ ...req.body, clinicId: user.clinicId ?? null });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid lab order data", errors: parsed.error.errors });
      }
      const order = await storage.createLabOrder(parsed.data);
      if (!parsed.data.patientOwnFrame && parsed.data.frameId) {
        await storage.markLabOrderFrameSold(order.id);
      }
      const finalOrder = await storage.getLabOrder(order.id);
      res.status(201).json(finalOrder ?? order);
    } catch {
      res.status(500).json({ message: "Failed to create lab order" });
    }
  });

  const updateLabOrderSchema = z.object({
    status: z.enum(["pending", "received"]).optional(),
    visionPlan: z.string().nullable().optional(),
    labName: z.string().nullable().optional(),
    labOrderNumber: z.string().nullable().optional(),
    labAccountNumber: z.string().nullable().optional(),
    trackingNumber: z.string().nullable().optional(),
    dateSentToLab: z.string().nullable().optional(),
    dateReceivedFromLab: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  });

  app.patch("/api/lab-orders/:id", requireAuth, async (req, res) => {
    try {
      const parsed = updateLabOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid lab order data", errors: parsed.error.errors });
      }
      const order = await storage.updateLabOrder(req.params.id as string, parsed.data);
      if (!order) return res.status(404).json({ message: "Lab order not found" });
      if (parsed.data.status === "received" && !order.patientOwnFrame && order.frameId) {
        if (!order.frameSold) {
          await storage.markLabOrderFrameSold(order.id);
        }
      }
      const finalOrder = await storage.getLabOrder(order.id);
      res.json(finalOrder ?? order);
    } catch (err) {
      console.error("[lab-orders PATCH] Error:", err);
      res.status(500).json({ message: "Failed to update lab order" });
    }
  });

  app.post("/api/lab-orders/:id/frame-sold", requireAuth, async (req, res) => {
    try {
      await storage.markLabOrderFrameSold(req.params.id as string);
      res.json({ message: "Frame marked as sold" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark frame as sold";
      const status = msg === "Frame already marked as sold" ? 409 : 500;
      res.status(status).json({ message: msg });
    }
  });

  app.delete("/api/lab-orders/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLabOrder(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "Lab order not found" });
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete lab order" });
    }
  });

  const invoiceUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and image files (JPEG, PNG, WebP) are supported."));
      }
    },
  });

  app.post("/api/invoice/parse", requireAuth, invoiceUpload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      let frames;
      if (file.mimetype === "application/pdf") {
        frames = await parseInvoiceFromPdf(file.buffer);
      } else {
        const base64 = file.buffer.toString("base64");
        frames = await parseInvoiceFromImage(base64, file.mimetype);
      }

      res.json({ frames });
    } catch (err) {
      console.error("[invoice/parse] Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to parse invoice";
      res.status(500).json({ message: msg });
    }
  });

  return httpServer;
}
