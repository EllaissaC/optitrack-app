import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  frames, type Frame, type InsertFrame,
  clinics, type Clinic, type InsertClinic,
  users, type User, type InsertUser,
  settings, type Setting,
  labs, type Lab, type InsertLab,
  manufacturers, type Manufacturer, type InsertManufacturer,
  brands, type Brand, type InsertBrand,
  weeklyMetrics, type WeeklyMetric, type InsertWeeklyMetric,
  labOrders, type LabOrder, type InsertLabOrder,
} from "@shared/schema";

export interface IStorage {
  getFrames(clinicId?: string | null): Promise<Frame[]>;
  getFrame(id: string): Promise<Frame | undefined>;
  createFrame(frame: InsertFrame): Promise<Frame>;
  updateFrame(id: string, frame: Partial<InsertFrame>): Promise<Frame | undefined>;
  deleteFrame(id: string): Promise<boolean>;

  getClinics(): Promise<Clinic[]>;
  getClinic(id: string): Promise<Clinic | undefined>;
  createClinic(data: InsertClinic): Promise<Clinic>;
  updateClinic(id: string, data: Partial<InsertClinic>): Promise<Clinic | undefined>;
  deleteClinic(id: string): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByInviteToken(token: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(data: { username: string; email: string; password: string; role: "admin" | "optician" | "staff"; clinicId?: string | null; isActive?: boolean }): Promise<User>;
  updateUser(id: string, data: Partial<Pick<User, "username" | "email" | "password" | "role" | "clinicId" | "inviteToken" | "inviteExpiry" | "isActive">>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  countUsers(): Promise<number>;

  getSetting(key: string): Promise<string | undefined>;
  getSettings(): Promise<Setting[]>;
  setSetting(key: string, value: string): Promise<void>;
  setSettings(entries: { key: string; value: string }[]): Promise<void>;

  getLabs(clinicId?: string | null): Promise<Lab[]>;
  getLab(id: string): Promise<Lab | undefined>;
  getLabByName(name: string, clinicId?: string | null): Promise<Lab | undefined>;
  createLab(data: InsertLab): Promise<Lab>;
  updateLab(id: string, data: Partial<InsertLab>): Promise<Lab | undefined>;
  deleteLab(id: string): Promise<boolean>;
  labsExist(clinicId?: string | null): Promise<boolean>;

  getManufacturers(): Promise<Manufacturer[]>;
  getManufacturer(id: string): Promise<Manufacturer | undefined>;
  createManufacturer(data: InsertManufacturer): Promise<Manufacturer>;
  updateManufacturer(id: string, data: Partial<InsertManufacturer>): Promise<Manufacturer | undefined>;
  deleteManufacturer(id: string): Promise<boolean>;
  manufacturersExist(): Promise<boolean>;

  getBrands(manufacturerId?: string): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(data: InsertBrand): Promise<Brand>;
  updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;

  getWeeklyMetrics(clinicId?: string | null): Promise<WeeklyMetric[]>;
  createWeeklyMetric(data: InsertWeeklyMetric): Promise<WeeklyMetric>;
  deleteWeeklyMetric(id: string): Promise<boolean>;

  findDuplicateFrame(params: { barcode?: string | null; brand: string; model: string; color: string; eyeSize: number; clinicId?: string | null }): Promise<Frame | null>;
  replaceFrame(oldFrameId: string, newFrameData: InsertFrame): Promise<Frame>;

  getLabOrders(clinicId?: string | null): Promise<LabOrder[]>;
  getLabOrder(id: string): Promise<LabOrder | undefined>;
  createLabOrder(data: InsertLabOrder): Promise<LabOrder>;
  updateLabOrder(id: string, data: Partial<InsertLabOrder>): Promise<LabOrder | undefined>;
  deleteLabOrder(id: string): Promise<boolean>;
  markLabOrderFrameSold(labOrderId: string): Promise<void>;
  updateFrameStatus(frameId: string, status: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getFrames(clinicId?: string | null): Promise<Frame[]> {
    if (clinicId) {
      return db.select().from(frames).where(eq(frames.clinicId, clinicId)).orderBy(frames.createdAt);
    }
    return db.select().from(frames).orderBy(frames.createdAt);
  }

  async getFrame(id: string): Promise<Frame | undefined> {
    const [frame] = await db.select().from(frames).where(eq(frames.id, id));
    return frame;
  }

  async createFrame(frame: InsertFrame): Promise<Frame> {
    const [created] = await db.insert(frames).values(frame).returning();
    return created;
  }

  async updateFrame(id: string, frame: Partial<InsertFrame>): Promise<Frame | undefined> {
    const [updated] = await db.update(frames).set(frame).where(eq(frames.id, id)).returning();
    return updated;
  }

  async deleteFrame(id: string): Promise<boolean> {
    const result = await db.delete(frames).where(eq(frames.id, id)).returning();
    return result.length > 0;
  }

  async findDuplicateFrame(params: { barcode?: string | null; brand: string; model: string; color: string; eyeSize: number; clinicId?: string | null }): Promise<Frame | null> {
    if (params.barcode) {
      const conds = [eq(frames.barcode, params.barcode)];
      if (params.clinicId) conds.push(eq(frames.clinicId, params.clinicId));
      const [frame] = await db.select().from(frames).where(and(...conds));
      return frame ?? null;
    }
    const conds = [
      eq(frames.brand, params.brand),
      eq(frames.model, params.model),
      eq(frames.color, params.color),
      eq(frames.eyeSize, params.eyeSize),
    ];
    if (params.clinicId) conds.push(eq(frames.clinicId, params.clinicId));
    const [frame] = await db.select().from(frames).where(and(...conds));
    return frame ?? null;
  }

  async replaceFrame(oldFrameId: string, newFrameData: InsertFrame): Promise<Frame> {
    const oldFrame = await this.getFrame(oldFrameId);
    if (!oldFrame) throw new Error("Existing frame not found");
    await db.delete(frames).where(eq(frames.id, oldFrameId));
    const [created] = await db.insert(frames).values({
      ...newFrameData,
      soldCount: oldFrame.soldCount,
      dateSold: oldFrame.dateSold,
    }).returning();
    return created;
  }

  async getClinics(): Promise<Clinic[]> {
    return db.select().from(clinics).orderBy(clinics.clinicName);
  }

  async getClinic(id: string): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic;
  }

  async createClinic(data: InsertClinic): Promise<Clinic> {
    const [created] = await db.insert(clinics).values(data).returning();
    return created;
  }

  async updateClinic(id: string, data: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const [updated] = await db.update(clinics).set(data).where(eq(clinics.id, id)).returning();
    return updated;
  }

  async deleteClinic(id: string): Promise<boolean> {
    const result = await db.delete(clinics).where(eq(clinics.id, id)).returning();
    return result.length > 0;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByInviteToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.inviteToken, token));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(data: { username: string; email: string; password: string; role: "admin" | "optician" | "staff"; clinicId?: string | null; isActive?: boolean }): Promise<User> {
    const [user] = await db.insert(users).values({
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      clinicId: data.clinicId ?? null,
      isActive: data.isActive ?? true,
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<Pick<User, "username" | "email" | "password" | "role" | "clinicId" | "inviteToken" | "inviteExpiry" | "isActive">>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async countUsers(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [row] = await db.select().from(settings).where(eq(settings.key, key));
    return row?.value;
  }

  async getSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db.insert(settings).values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  async setSettings(entries: { key: string; value: string }[]): Promise<void> {
    for (const entry of entries) {
      await this.setSetting(entry.key, entry.value);
    }
  }

  async getLabs(clinicId?: string | null): Promise<Lab[]> {
    if (clinicId) {
      return db.select().from(labs).where(eq(labs.clinicId, clinicId)).orderBy(labs.name);
    }
    return db.select().from(labs).orderBy(labs.name);
  }

  async getLab(id: string): Promise<Lab | undefined> {
    const [lab] = await db.select().from(labs).where(eq(labs.id, id));
    return lab;
  }

  async getLabByName(name: string, clinicId?: string | null): Promise<Lab | undefined> {
    if (clinicId) {
      const [lab] = await db.select().from(labs).where(and(eq(labs.name, name), eq(labs.clinicId, clinicId)));
      return lab;
    }
    const [lab] = await db.select().from(labs).where(eq(labs.name, name));
    return lab;
  }

  async createLab(data: InsertLab): Promise<Lab> {
    const [created] = await db.insert(labs).values(data).returning();
    return created;
  }

  async updateLab(id: string, data: Partial<InsertLab>): Promise<Lab | undefined> {
    const [updated] = await db.update(labs).set(data).where(eq(labs.id, id)).returning();
    return updated;
  }

  async deleteLab(id: string): Promise<boolean> {
    const result = await db.delete(labs).where(eq(labs.id, id)).returning();
    return result.length > 0;
  }

  async labsExist(clinicId?: string | null): Promise<boolean> {
    if (clinicId) {
      const result = await db.select().from(labs).where(eq(labs.clinicId, clinicId));
      return result.length > 0;
    }
    const result = await db.select().from(labs);
    return result.length > 0;
  }

  async getManufacturers(): Promise<Manufacturer[]> {
    return db.select().from(manufacturers).orderBy(manufacturers.name);
  }

  async getManufacturer(id: string): Promise<Manufacturer | undefined> {
    const [m] = await db.select().from(manufacturers).where(eq(manufacturers.id, id));
    return m;
  }

  async createManufacturer(data: InsertManufacturer): Promise<Manufacturer> {
    const [created] = await db.insert(manufacturers).values(data).returning();
    return created;
  }

  async updateManufacturer(id: string, data: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> {
    const [updated] = await db.update(manufacturers).set(data).where(eq(manufacturers.id, id)).returning();
    return updated;
  }

  async deleteManufacturer(id: string): Promise<boolean> {
    const result = await db.delete(manufacturers).where(eq(manufacturers.id, id)).returning();
    return result.length > 0;
  }

  async manufacturersExist(): Promise<boolean> {
    const result = await db.select().from(manufacturers);
    return result.length > 0;
  }

  async getBrands(manufacturerId?: string): Promise<Brand[]> {
    if (manufacturerId) {
      return db.select().from(brands).where(eq(brands.manufacturerId, manufacturerId)).orderBy(brands.name);
    }
    return db.select().from(brands).orderBy(brands.name);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async createBrand(data: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(data).returning();
    return created;
  }

  async updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [updated] = await db.update(brands).set(data).where(eq(brands.id, id)).returning();
    return updated;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning();
    return result.length > 0;
  }

  async getWeeklyMetrics(clinicId?: string | null): Promise<WeeklyMetric[]> {
    if (clinicId) {
      return db.select().from(weeklyMetrics).where(eq(weeklyMetrics.clinicId, clinicId)).orderBy(desc(weeklyMetrics.weekStarting));
    }
    return db.select().from(weeklyMetrics).orderBy(desc(weeklyMetrics.weekStarting));
  }

  async createWeeklyMetric(data: InsertWeeklyMetric): Promise<WeeklyMetric> {
    const [created] = await db.insert(weeklyMetrics).values(data).returning();
    return created;
  }

  async deleteWeeklyMetric(id: string): Promise<boolean> {
    const result = await db.delete(weeklyMetrics).where(eq(weeklyMetrics.id, id)).returning();
    return result.length > 0;
  }

  async getLabOrders(clinicId?: string | null): Promise<LabOrder[]> {
    if (clinicId) {
      return db.select().from(labOrders).where(eq(labOrders.clinicId, clinicId)).orderBy(desc(labOrders.createdAt));
    }
    return db.select().from(labOrders).orderBy(desc(labOrders.createdAt));
  }

  async getLabOrder(id: string): Promise<LabOrder | undefined> {
    const [order] = await db.select().from(labOrders).where(eq(labOrders.id, id));
    return order;
  }

  async createLabOrder(data: InsertLabOrder): Promise<LabOrder> {
    const [created] = await db.insert(labOrders).values(data).returning();
    return created;
  }

  async updateLabOrder(id: string, data: Partial<InsertLabOrder>): Promise<LabOrder | undefined> {
    const [updated] = await db.update(labOrders).set(data).where(eq(labOrders.id, id)).returning();
    return updated;
  }

  async deleteLabOrder(id: string): Promise<boolean> {
    const order = await this.getLabOrder(id);

    const result = await db.delete(labOrders).where(eq(labOrders.id, id)).returning();
    if (result.length === 0) return false;

    if (order && !order.patientOwnFrame && order.frameId) {
      const frameRows = await db.select().from(frames).where(eq(frames.id, order.frameId)).limit(1);
      if (frameRows.length > 0) {
        const frame = frameRows[0];
        const updates: Record<string, unknown> = { status: "on_board" };
        if (order.frameSold) {
          const newCount = Math.max(0, (frame.soldCount ?? 0) - 1);
          updates.soldCount = newCount;
          updates.dateSold = newCount === 0 ? null : frame.dateSold;
        }
        await db.update(frames).set(updates).where(eq(frames.id, order.frameId));
      }
    }

    return true;
  }

  async markLabOrderFrameSold(labOrderId: string): Promise<void> {
    const order = await this.getLabOrder(labOrderId);
    if (!order) throw new Error("Lab order not found");
    if (order.frameSold) throw new Error("Frame already marked as sold");

    const today = new Date().toISOString().split("T")[0];

    await db.update(labOrders)
      .set({ frameSold: true, frameSoldAt: today })
      .where(eq(labOrders.id, labOrderId));

    if (order.frameId) {
      await db.update(frames)
        .set({
          status: "sold",
          soldCount: sql`${frames.soldCount} + 1`,
          dateSold: today,
        })
        .where(eq(frames.id, order.frameId));
    }
  }

  async updateFrameStatus(frameId: string, status: string): Promise<void> {
    await db.update(frames).set({ status }).where(eq(frames.id, frameId));
  }
}

export const storage = new DbStorage();
