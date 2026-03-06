import { pgTable, text, numeric, integer, varchar, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const frames = pgTable("frames", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  role: text("role", { enum: ["admin", "staff"] }).notNull().default("staff"),
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
  name: text("name").notNull().unique(),
  account: text("account").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
