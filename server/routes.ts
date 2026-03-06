import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import { insertFrameSchema, insertWeeklyMetricSchema } from "@shared/schema";
import { requireAuth, requireAdmin } from "./auth";
import { sendLabFollowUpEmail } from "./email";
import { z } from "zod";
import type { User } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Auth Routes ──────────────────────────────────────────────────────────

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as User;
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive });
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

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
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
      if (!["admin", "staff"].includes(role)) return res.status(400).json({ message: "Invalid role" });

      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(409).json({ message: "A user with this email already exists" });

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(tempPassword, 12);

      const user = await storage.createUser({
        username: email,
        email,
        password: hashed,
        role: role as "admin" | "staff",
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

  // ─── Labs ──────────────────────────────────────────────────────────────────

  app.get("/api/labs", requireAuth, async (_req, res) => {
    const allLabs = await storage.getLabs();
    res.json(allLabs);
  });

  app.post("/api/labs", requireAdmin, async (req, res) => {
    try {
      const { name, account } = req.body;
      if (!name) return res.status(400).json({ message: "Lab name is required" });
      const lab = await storage.createLab({ name, account: account || "" });
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

  app.post("/api/reminders/check", requireAdmin, async (_req, res) => {
    try {
      const reminderEmail = await storage.getSetting("reminderEmail");
      const emailFrom = await storage.getSetting("emailFrom") || reminderEmail;
      const reminderDaysStr = await storage.getSetting("labReminderDays");
      const reminderDays = reminderDaysStr ? parseInt(reminderDaysStr) : 14;

      if (!reminderEmail || !emailFrom) {
        return res.json({ sent: 0, skipped: 0, reason: "No reminder email configured in Settings" });
      }

      const allFrames = await storage.getFrames();
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

  app.get("/api/frames", requireAuth, async (_req, res) => {
    try {
      const allFrames = await storage.getFrames();
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
      const parsed = insertFrameSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const frame = await storage.createFrame(parsed.data);
      res.status(201).json(frame);
    } catch {
      res.status(500).json({ message: "Failed to create frame" });
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

  app.get("/api/weekly-metrics", requireAuth, async (_req, res) => {
    try {
      const metrics = await storage.getWeeklyMetrics();
      res.json(metrics);
    } catch {
      res.status(500).json({ message: "Failed to fetch weekly metrics" });
    }
  });

  app.post("/api/weekly-metrics", requireAuth, async (req, res) => {
    try {
      const parsed = insertWeeklyMetricSchema.safeParse(req.body);
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

  return httpServer;
}
