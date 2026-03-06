import { pgTable, text, numeric, integer, varchar, timestamp } from "drizzle-orm/pg-core";
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
  retailPrice: numeric("retail_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["on_board", "at_lab", "sold"] }).notNull().default("on_board"),
  barcode: text("barcode"),
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
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
