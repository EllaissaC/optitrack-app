import { pgTable, text, numeric, integer, varchar, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicName: text("clinic_name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClinicSchema = createInsertSchema(clinics).omit({ id: true, createdAt: true });
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;

export const frames = pgTable("frames", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "cascade" }),
  manufacturer: text("manufacturer").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  color: text("color").notNull(),
  eyeSize: integer("eye_size").notNull(),
  bridge: integer("bridge").notNull(),
  templeLength: integer("temple_length").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  multiplier: numeric("multiplier", { precision: 10, scale: 4 }),
  retailPrice: numeric("retail_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["on_board", "at_lab", "sold"] }).notNull().default("on_board"),
  quantity: integer("quantity").notNull().default(1),
  soldCount: integer("sold_count").notNull().default(0),
  barcode: text("barcode"),
  labOrderNumber: text("lab_order_number"),
  labName: text("lab_name"),
  labAccountNumber: text("lab_account_number"),
  trackingNumber: text("tracking_number"),
  dateSentToLab: text("date_sent_to_lab"),
  visionPlan: text("vision_plan"),
  dateReceivedFromLab: text("date_received_from_lab"),
  dateSold: text("date_sold"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFrameSchema = createInsertSchema(frames).omit({
  id: true,
  createdAt: true,
});

export type InsertFrame = z.infer<typeof insertFrameSchema>;
export type Frame = typeof frames.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "optician", "staff"] }).notNull().default("staff"),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "set null" }),
  inviteToken: text("invite_token"),
  inviteExpiry: timestamp("invite_expiry"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Setting = typeof settings.$inferSelect;

export const labs = pgTable("labs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  account: text("account").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.clinicId, table.name),
]);

export const insertLabSchema = createInsertSchema(labs).omit({ id: true, createdAt: true });
export type InsertLab = z.infer<typeof insertLabSchema>;
export type Lab = typeof labs.$inferSelect;

export const manufacturers = pgTable("manufacturers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManufacturerSchema = createInsertSchema(manufacturers).omit({ id: true, createdAt: true });
export type InsertManufacturer = z.infer<typeof insertManufacturerSchema>;
export type Manufacturer = typeof manufacturers.$inferSelect;

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manufacturerId: varchar("manufacturer_id").notNull().references(() => manufacturers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.manufacturerId, table.name),
]);

export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

export const weeklyMetrics = pgTable("weekly_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "cascade" }),
  weekStarting: text("week_starting").notNull(),
  totalComprehensiveExams: integer("total_comprehensive_exams").notNull(),
  followUps: integer("follow_ups").notNull(),
  totalOpticalOrders: integer("total_optical_orders").notNull(),
  dailyData: text("daily_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWeeklyMetricSchema = createInsertSchema(weeklyMetrics).omit({ id: true, createdAt: true });
export type InsertWeeklyMetric = z.infer<typeof insertWeeklyMetricSchema>;
export type WeeklyMetric = typeof weeklyMetrics.$inferSelect;

export const labOrders = pgTable("lab_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id, { onDelete: "cascade" }),
  frameId: varchar("frame_id").references(() => frames.id, { onDelete: "set null" }),
  frameBrand: text("frame_brand").notNull(),
  frameModel: text("frame_model").notNull(),
  frameColor: text("frame_color").notNull(),
  frameManufacturer: text("frame_manufacturer").notNull(),
  visionPlan: text("vision_plan"),
  labName: text("lab_name"),
  labOrderNumber: text("lab_order_number"),
  labAccountNumber: text("lab_account_number"),
  trackingNumber: text("tracking_number"),
  dateSentToLab: text("date_sent_to_lab"),
  dateReceivedFromLab: text("date_received_from_lab"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  patientOwnFrame: boolean("patient_own_frame").notNull().default(false),
  frameSold: boolean("frame_sold").notNull().default(false),
  frameSoldAt: text("frame_sold_at"),
  customDueDate: text("custom_due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabOrderSchema = createInsertSchema(labOrders).omit({ id: true, createdAt: true });
export type InsertLabOrder = z.infer<typeof insertLabOrderSchema>;
export type LabOrder = typeof labOrders.$inferSelect;
