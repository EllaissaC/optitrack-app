import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  frames,
  type Frame,
  type InsertFrame,
  clinics,
  type Clinic,
  type InsertClinic,
  users,
  type User,
  type InsertUser,
  settings,
  type Setting,
  labs,
  type Lab,
  type InsertLab,
  manufacturers,
  type Manufacturer,
  type InsertManufacturer,
  brands,
  type Brand,
  type InsertBrand,
  weeklyMetrics,
  type WeeklyMetric,
  type InsertWeeklyMetric,
  labOrders,
  type LabOrder,
  type InsertLabOrder,
  frameHolds,
  type FrameHold,
  type InsertFrameHold,
} from "@shared/schema";

export interface IStorage {
  getFrames(clinicId?: string | null): Promise<Frame[]>;
  getFrame(id: string): Promise<Frame | undefined>;
  createFrame(frame: InsertFrame): Promise<Frame>;
  updateFrame(
    id: string,
    frame: Partial<InsertFrame>,
  ): Promise<Frame | undefined>;
  deleteFrame(id: string): Promise<boolean>;

  getClinics(): Promise<Clinic[]>;
  getClinic(id: string): Promise<Clinic | undefined>;
  createClinic(data: InsertClinic): Promise<Clinic>;
  updateClinic(
    id: string,
    data: Partial<InsertClinic>,
  ): Promise<Clinic | undefined>;
  deleteClinic(id: string): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByInviteToken(token: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(data: {
    username: string;
    email: string;
    password: string;
    role: "admin" | "optician" | "staff";
    clinicId?: string | null;
    isActive?: boolean;
  }): Promise<User>;
  updateUser(
    id: string,
    data: Partial<
      Pick<
        User,
        | "username"
        | "email"
        | "password"
        | "role"
        | "clinicId"
        | "inviteToken"
        | "inviteExpiry"
        | "isActive"
      >
    >,
  ): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  countUsers(): Promise<number>;

  getSetting(key: string): Promise<string | undefined>;
  getSettings(): Promise<Setting[]>;
  setSetting(key: string, value: string): Promise<void>;
  setSettings(entries: { key: string; value: string }[]): Promise<void>;

  getLabs(clinicId?: string | null): Promise<Lab[]>;
  getLab(id: string): Promise<Lab | undefined>;
  getLabByName(
    name: string,
    clinicId?: string | null,
  ): Promise<Lab | undefined>;
  createLab(data: InsertLab): Promise<Lab>;
  updateLab(id: string, data: Partial<InsertLab>): Promise<Lab | undefined>;
  deleteLab(id: string): Promise<boolean>;
  labsExist(clinicId?: string | null): Promise<boolean>;

  getManufacturers(): Promise<Manufacturer[]>;
  getManufacturer(id: string): Promise<Manufacturer | undefined>;
  createManufacturer(data: InsertManufacturer): Promise<Manufacturer>;
  updateManufacturer(
    id: string,
    data: Partial<InsertManufacturer>,
  ): Promise<Manufacturer | undefined>;
  deleteManufacturer(id: string): Promise<boolean>;
  manufacturersExist(): Promise<boolean>;

  getBrands(manufacturerId?: string): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(data: InsertBrand): Promise<Brand>;
  updateBrand(
    id: string,
    data: Partial<InsertBrand>,
  ): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;

  getWeeklyMetrics(clinicId?: string | null): Promise<WeeklyMetric[]>;
  createWeeklyMetric(data: InsertWeeklyMetric): Promise<WeeklyMetric>;
  updateWeeklyMetric(
    id: string,
    data: Partial<InsertWeeklyMetric>,
  ): Promise<WeeklyMetric | undefined>;
  deleteWeeklyMetric(id: string): Promise<boolean>;

  findDuplicateFrame(params: {
    barcode?: string | null;
    brand: string;
    model: string;
    color: string;
    eyeSize: number;
    bridge: number;
    templeLength: number;
    clinicId?: string | null;
  }): Promise<Frame | null>;
  replaceFrame(oldFrameId: string, newFrameData: InsertFrame): Promise<Frame>;

  getLabOrders(clinicId?: string | null): Promise<LabOrder[]>;
  getLabOrder(id: string): Promise<LabOrder | undefined>;
  createLabOrder(data: InsertLabOrder): Promise<LabOrder>;
  updateLabOrder(
    id: string,
    data: Partial<InsertLabOrder>,
  ): Promise<LabOrder | undefined>;
  deleteLabOrder(id: string): Promise<boolean>;
  markLabOrderFrameSold(labOrderId: string): Promise<void>;
  updateFrameStatus(frameId: string, status: string): Promise<void>;
  adjustFrameInventory(
    frameId: string,
    onBoardDelta: number,
    offBoardDelta: number,
  ): Promise<void>;
  reorderFrame(frameId: string, qty: number): Promise<Frame>;
  backOnBoard(frameId: string): Promise<Frame>;
  syncFrameSoldCount(frameId: string): Promise<void>;
  syncAllFramesFromLabOrders(): Promise<void>;
  fixManufacturerData(): Promise<void>;
  recalculateRetailPrices(): Promise<void>;

  getFrameHolds(clinicId?: string | null): Promise<FrameHold[]>;
  getFrameHold(id: string): Promise<FrameHold | undefined>;
  createFrameHold(data: InsertFrameHold): Promise<FrameHold>;
  updateFrameHold(
    id: string,
    data: Partial<InsertFrameHold>,
  ): Promise<FrameHold | undefined>;
  deleteFrameHold(id: string): Promise<boolean>;
  releaseFrameHold(
    id: string,
  ): Promise<{ hold: FrameHold; frame: Frame | null }>;
  extendFrameHold(
    id: string,
    newExpirationDate: string,
  ): Promise<FrameHold | undefined>;
  autoExpireHolds(clinicId?: string | null): Promise<void>;
}

export class DbStorage implements IStorage {
  async getFrames(clinicId?: string | null): Promise<Frame[]> {
    if (clinicId) {
      return db
        .select()
        .from(frames)
        .where(eq(frames.clinicId, clinicId))
        .orderBy(frames.createdAt);
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

  async updateFrame(
    id: string,
    frame: Partial<InsertFrame>,
  ): Promise<Frame | undefined> {
    const [updated] = await db
      .update(frames)
      .set(frame)
      .where(eq(frames.id, id))
      .returning();
    return updated;
  }

  async deleteFrame(id: string): Promise<boolean> {
    const result = await db.delete(frames).where(eq(frames.id, id)).returning();
    return result.length > 0;
  }

  async findDuplicateFrame(params: {
    barcode?: string | null;
    brand: string;
    model: string;
    color: string;
    eyeSize: number;
    bridge: number;
    templeLength: number;
    clinicId?: string | null;
  }): Promise<Frame | null> {
    if (params.barcode) {
      const conds = [eq(frames.barcode, params.barcode)];
      if (params.clinicId) conds.push(eq(frames.clinicId, params.clinicId));
      const [frame] = await db
        .select()
        .from(frames)
        .where(and(...conds));
      return frame ?? null;
    }
    const conds = [
      sql`LOWER(TRIM(${frames.brand})) = LOWER(TRIM(${params.brand}))`,
      sql`LOWER(TRIM(${frames.model})) = LOWER(TRIM(${params.model}))`,
      sql`LOWER(TRIM(${frames.color})) = LOWER(TRIM(${params.color}))`,
      eq(frames.eyeSize, params.eyeSize),
      eq(frames.bridge, params.bridge),
      eq(frames.templeLength, params.templeLength),
    ];
    if (params.clinicId) conds.push(eq(frames.clinicId, params.clinicId));
    const [frame] = await db
      .select()
      .from(frames)
      .where(and(...conds));
    return frame ?? null;
  }

  async replaceFrame(
    oldFrameId: string,
    newFrameData: InsertFrame,
  ): Promise<Frame> {
    const oldFrame = await this.getFrame(oldFrameId);
    if (!oldFrame) throw new Error("Existing frame not found");
    await db.delete(frames).where(eq(frames.id, oldFrameId));
    const [created] = await db
      .insert(frames)
      .values({
        ...newFrameData,
        soldCount: oldFrame.soldCount,
        dateSold: oldFrame.dateSold,
      })
      .returning();
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

  async updateClinic(
    id: string,
    data: Partial<InsertClinic>,
  ): Promise<Clinic | undefined> {
    const [updated] = await db
      .update(clinics)
      .set(data)
      .where(eq(clinics.id, id))
      .returning();
    return updated;
  }

  async deleteClinic(id: string): Promise<boolean> {
    const result = await db
      .delete(clinics)
      .where(eq(clinics.id, id))
      .returning();
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByInviteToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.inviteToken, token));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    role: "admin" | "optician" | "staff";
    clinicId?: string | null;
    isActive?: boolean;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        clinicId: data.clinicId ?? null,
        isActive: data.isActive ?? true,
      })
      .returning();
    return user;
  }

  async updateUser(
    id: string,
    data: Partial<
      Pick<
        User,
        | "username"
        | "email"
        | "password"
        | "role"
        | "clinicId"
        | "inviteToken"
        | "inviteExpiry"
        | "isActive"
      >
    >,
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
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
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  async setSettings(entries: { key: string; value: string }[]): Promise<void> {
    for (const entry of entries) {
      await this.setSetting(entry.key, entry.value);
    }
  }

  async getLabs(clinicId?: string | null): Promise<Lab[]> {
    if (clinicId) {
      return db
        .select()
        .from(labs)
        .where(eq(labs.clinicId, clinicId))
        .orderBy(labs.name);
    }
    return db.select().from(labs).orderBy(labs.name);
  }

  async getLab(id: string): Promise<Lab | undefined> {
    const [lab] = await db.select().from(labs).where(eq(labs.id, id));
    return lab;
  }

  async getLabByName(
    name: string,
    clinicId?: string | null,
  ): Promise<Lab | undefined> {
    if (clinicId) {
      const [lab] = await db
        .select()
        .from(labs)
        .where(and(eq(labs.name, name), eq(labs.clinicId, clinicId)));
      return lab;
    }
    const [lab] = await db.select().from(labs).where(eq(labs.name, name));
    return lab;
  }

  async createLab(data: InsertLab): Promise<Lab> {
    const [created] = await db.insert(labs).values(data).returning();
    return created;
  }

  async updateLab(
    id: string,
    data: Partial<InsertLab>,
  ): Promise<Lab | undefined> {
    const [updated] = await db
      .update(labs)
      .set(data)
      .where(eq(labs.id, id))
      .returning();
    return updated;
  }

  async deleteLab(id: string): Promise<boolean> {
    const result = await db.delete(labs).where(eq(labs.id, id)).returning();
    return result.length > 0;
  }

  async labsExist(clinicId?: string | null): Promise<boolean> {
    if (clinicId) {
      const result = await db
        .select()
        .from(labs)
        .where(eq(labs.clinicId, clinicId));
      return result.length > 0;
    }
    const result = await db.select().from(labs);
    return result.length > 0;
  }

  async getManufacturers(): Promise<Manufacturer[]> {
    return db.select().from(manufacturers).orderBy(manufacturers.name);
  }

  async getManufacturer(id: string): Promise<Manufacturer | undefined> {
    const [m] = await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, id));
    return m;
  }

  async createManufacturer(data: InsertManufacturer): Promise<Manufacturer> {
    const [created] = await db.insert(manufacturers).values(data).returning();
    return created;
  }

  async updateManufacturer(
    id: string,
    data: Partial<InsertManufacturer>,
  ): Promise<Manufacturer | undefined> {
    const [updated] = await db
      .update(manufacturers)
      .set(data)
      .where(eq(manufacturers.id, id))
      .returning();
    return updated;
  }

  async deleteManufacturer(id: string): Promise<boolean> {
    const result = await db
      .delete(manufacturers)
      .where(eq(manufacturers.id, id))
      .returning();
    return result.length > 0;
  }

  async manufacturersExist(): Promise<boolean> {
    const result = await db.select().from(manufacturers);
    return result.length > 0;
  }

  async getBrands(manufacturerId?: string): Promise<Brand[]> {
    if (manufacturerId) {
      return db
        .select()
        .from(brands)
        .where(eq(brands.manufacturerId, manufacturerId))
        .orderBy(brands.name);
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

  async updateBrand(
    id: string,
    data: Partial<InsertBrand>,
  ): Promise<Brand | undefined> {
    const [updated] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning();
    return result.length > 0;
  }

  async getWeeklyMetrics(clinicId?: string | null): Promise<WeeklyMetric[]> {
    if (clinicId) {
      return db
        .select()
        .from(weeklyMetrics)
        .where(eq(weeklyMetrics.clinicId, clinicId))
        .orderBy(desc(weeklyMetrics.weekStarting));
    }
    return db
      .select()
      .from(weeklyMetrics)
      .orderBy(desc(weeklyMetrics.weekStarting));
  }

  async createWeeklyMetric(data: InsertWeeklyMetric): Promise<WeeklyMetric> {
    const [created] = await db.insert(weeklyMetrics).values(data).returning();
    return created;
  }

  async updateWeeklyMetric(
    id: string,
    data: Partial<InsertWeeklyMetric>,
  ): Promise<WeeklyMetric | undefined> {
    const [updated] = await db
      .update(weeklyMetrics)
      .set(data)
      .where(eq(weeklyMetrics.id, id))
      .returning();
    return updated;
  }

  async deleteWeeklyMetric(id: string): Promise<boolean> {
    const result = await db
      .delete(weeklyMetrics)
      .where(eq(weeklyMetrics.id, id))
      .returning();
    return result.length > 0;
  }

  async getLabOrders(clinicId?: string | null): Promise<LabOrder[]> {
    if (clinicId) {
      return db
        .select()
        .from(labOrders)
        .where(eq(labOrders.clinicId, clinicId))
        .orderBy(desc(labOrders.createdAt));
    }
    return db.select().from(labOrders).orderBy(desc(labOrders.createdAt));
  }

  async getLabOrder(id: string): Promise<LabOrder | undefined> {
    const [order] = await db
      .select()
      .from(labOrders)
      .where(eq(labOrders.id, id));
    return order;
  }

  async createLabOrder(data: InsertLabOrder): Promise<LabOrder> {
    const [created] = await db.insert(labOrders).values(data).returning();
    return created;
  }

  async updateLabOrder(
    id: string,
    data: Partial<InsertLabOrder>,
  ): Promise<LabOrder | undefined> {
    const [updated] = await db
      .update(labOrders)
      .set(data)
      .where(eq(labOrders.id, id))
      .returning();
    return updated;
  }

  async deleteLabOrder(id: string): Promise<boolean> {
    const order = await this.getLabOrder(id);

    const result = await db
      .delete(labOrders)
      .where(eq(labOrders.id, id))
      .returning();
    if (result.length === 0) return false;

    if (order && !order.patientOwnFrame && order.frameId) {
      const [frame] = await db
        .select()
        .from(frames)
        .where(eq(frames.id, order.frameId));
      if (frame) {
        const newQty = (frame.quantity ?? 0) + 1;
        const newOffBoard = Math.max(0, (frame.offBoardQty ?? 0) - 1);

        const updates: Partial<typeof frames.$inferInsert> = {
          quantity: newQty,
          offBoardQty: newOffBoard,
        };

        // Restore status to on_board when frame is back and has stock
        if (newQty > 0 && frame.status === "off_board") {
          updates.status = "on_board";
        }

        await db
          .update(frames)
          .set(updates)
          .where(eq(frames.id, order.frameId));
      }
      await this.syncFrameSoldCount(order.frameId);
    }

    return true;
  }

  async markLabOrderFrameSold(labOrderId: string): Promise<void> {
    const order = await this.getLabOrder(labOrderId);
    if (!order) throw new Error("Lab order not found");
    if (order.frameSold) throw new Error("Frame already marked as sold");

    const today = new Date().toISOString().split("T")[0];

    await db
      .update(labOrders)
      .set({ frameSold: true, frameSoldAt: today })
      .where(eq(labOrders.id, labOrderId));

    if (order.frameId) {
      await this.syncFrameSoldCount(order.frameId);
    }
  }

  async updateFrameStatus(frameId: string, status: string): Promise<void> {
    await db
      .update(frames)
      .set({ status: status as "on_board" | "off_board" | "at_lab" | "sold" })
      .where(eq(frames.id, frameId));
  }

  async adjustFrameInventory(
    frameId: string,
    onBoardDelta: number,
    offBoardDelta: number,
  ): Promise<void> {
    const [frame] = await db
      .select()
      .from(frames)
      .where(eq(frames.id, frameId));
    if (!frame) return;
    const newQty = Math.max(0, (frame.quantity ?? 1) + onBoardDelta);
    const newOffBoard = Math.max(0, (frame.offBoardQty ?? 0) + offBoardDelta);

    const updates: Partial<typeof frames.$inferInsert> = {
      quantity: newQty,
      offBoardQty: newOffBoard,
    };

    // When on-board quantity hits zero, mark off-board and flag for reorder
    if (newQty === 0 && onBoardDelta < 0) {
      updates.status = "off_board";
      if ((frame.reorderCount ?? 0) === 0) {
        updates.reorderCount = 1;
      }
    }

    await db.update(frames).set(updates).where(eq(frames.id, frameId));
  }

  async reorderFrame(frameId: string, qty: number): Promise<Frame> {
    const [frame] = await db
      .select()
      .from(frames)
      .where(eq(frames.id, frameId));
    if (!frame) throw new Error("Frame not found");
    const offQty = frame.offBoardQty ?? 0;
    const moveQty = offQty > 0 ? offQty : Math.max(1, qty);
    const [updated] = await db
      .update(frames)
      .set({
        offBoardQty: 0,
        reorderedQty: (frame.reorderedQty ?? 0) + moveQty,
        reorderCount: (frame.reorderCount ?? 0) + 1,
      })
      .where(eq(frames.id, frameId))
      .returning();
    return updated;
  }

  async backOnBoard(frameId: string): Promise<Frame> {
    const [frame] = await db
      .select()
      .from(frames)
      .where(eq(frames.id, frameId));
    if (!frame) throw new Error("Frame not found");
    const reorderedQty = frame.reorderedQty ?? 0;
    const restoreQty = reorderedQty > 0 ? reorderedQty : 1;
    const [updated] = await db
      .update(frames)
      .set({
        quantity: (frame.quantity ?? 0) + restoreQty,
        reorderedQty: 0,
        offBoardQty: 0,
        status: "on_board",
      })
      .where(eq(frames.id, frameId))
      .returning();
    return updated;
  }

  async syncFrameSoldCount(frameId: string): Promise<void> {
    const rows = await db
      .select({
        count: sql<number>`cast(count(*) as int)`,
        latestDate: sql<
          string | null
        >`max(coalesce(frame_sold_at, to_char(created_at, 'YYYY-MM-DD')))`,
      })
      .from(labOrders)
      .where(
        and(
          eq(labOrders.frameId, frameId),
          eq(labOrders.patientOwnFrame, false),
          eq(labOrders.frameSold, true),
        ),
      );

    const rawCount = rows[0]?.count ?? 0;
    const soldCount = rawCount > 0 ? 1 : 0;
    const latestDate = rows[0]?.latestDate ?? null;

    await db
      .update(frames)
      .set({
        soldCount,
        dateSold: soldCount === 0 ? null : latestDate,
      })
      .where(eq(frames.id, frameId));
  }

  async syncAllFramesFromLabOrders(): Promise<void> {
    const rows = await db
      .select({
        frameId: labOrders.frameId,
        soldOrders: sql<number>`cast(count(*) filter (where ${labOrders.frameSold} = true) as int)`,
        latestDate: sql<
          string | null
        >`max(case when ${labOrders.frameSold} = true then coalesce(${labOrders.frameSoldAt}, to_char(${labOrders.createdAt}, 'YYYY-MM-DD')) end)`,
      })
      .from(labOrders)
      .where(
        and(
          sql`${labOrders.frameId} is not null`,
          eq(labOrders.patientOwnFrame, false),
        ),
      )
      .groupBy(labOrders.frameId);

    for (const row of rows) {
      if (!row.frameId) continue;

      const soldCount = (row.soldOrders ?? 0) > 0 ? 1 : 0;

      await db
        .update(frames)
        .set({
          soldCount,
          dateSold: soldCount === 0 ? null : row.latestDate,
        })
        .where(eq(frames.id, row.frameId));
    }

    console.log(`[sync] Synced ${rows.length} frames from lab orders`);
  }

  async getFrameHolds(clinicId?: string | null): Promise<FrameHold[]> {
    if (clinicId) {
      return db
        .select()
        .from(frameHolds)
        .where(eq(frameHolds.clinicId, clinicId))
        .orderBy(desc(frameHolds.createdAt));
    }
    return db.select().from(frameHolds).orderBy(desc(frameHolds.createdAt));
  }

  async getFrameHold(id: string): Promise<FrameHold | undefined> {
    const [hold] = await db
      .select()
      .from(frameHolds)
      .where(eq(frameHolds.id, id));
    return hold;
  }

  async createFrameHold(data: InsertFrameHold): Promise<FrameHold> {
    const [hold] = await db.insert(frameHolds).values(data).returning();
    if (data.frameId) {
      const [frame] = await db
        .select()
        .from(frames)
        .where(eq(frames.id, data.frameId));
      if (frame) {
        await db
          .update(frames)
          .set({ quantity: Math.max(0, (frame.quantity ?? 1) - 1) })
          .where(eq(frames.id, data.frameId));
      }
    }
    return hold;
  }

  async updateFrameHold(
    id: string,
    data: Partial<InsertFrameHold>,
  ): Promise<FrameHold | undefined> {
    const [updated] = await db
      .update(frameHolds)
      .set(data)
      .where(eq(frameHolds.id, id))
      .returning();
    return updated;
  }

  async deleteFrameHold(id: string): Promise<boolean> {
    const [hold] = await db
      .select()
      .from(frameHolds)
      .where(eq(frameHolds.id, id));
    const result = await db.delete(frameHolds).where(eq(frameHolds.id, id));
    if ((result.rowCount ?? 0) === 0) return false;

    if (hold && hold.status === "active" && hold.frameId) {
      const [frame] = await db
        .select({ quantity: frames.quantity })
        .from(frames)
        .where(eq(frames.id, hold.frameId));
      if (frame) {
        await db
          .update(frames)
          .set({ quantity: (frame.quantity ?? 0) + 1 })
          .where(eq(frames.id, hold.frameId));
      }
    }
    return true;
  }

  async releaseFrameHold(
    id: string,
  ): Promise<{ hold: FrameHold; frame: Frame | null }> {
    const [hold] = await db
      .select()
      .from(frameHolds)
      .where(eq(frameHolds.id, id));
    if (!hold) throw new Error("Hold not found");
    const [updatedHold] = await db
      .update(frameHolds)
      .set({ status: "released" })
      .where(eq(frameHolds.id, id))
      .returning();
    let updatedFrame: Frame | null = null;
    if (hold.frameId) {
      const [frame] = await db
        .select()
        .from(frames)
        .where(eq(frames.id, hold.frameId));
      if (frame) {
        const [f] = await db
          .update(frames)
          .set({ quantity: (frame.quantity ?? 0) + 1 })
          .where(eq(frames.id, hold.frameId))
          .returning();
        updatedFrame = f ?? null;
      }
    }
    return { hold: updatedHold, frame: updatedFrame };
  }

  async extendFrameHold(
    id: string,
    newExpirationDate: string,
  ): Promise<FrameHold | undefined> {
    const [updated] = await db
      .update(frameHolds)
      .set({ holdExpirationDate: newExpirationDate, status: "active" })
      .where(eq(frameHolds.id, id))
      .returning();
    return updated;
  }

  async autoExpireHolds(clinicId?: string | null): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const condition = clinicId
      ? and(eq(frameHolds.status, "active"), eq(frameHolds.clinicId, clinicId))
      : eq(frameHolds.status, "active");
    const activeHolds = await db.select().from(frameHolds).where(condition);
    for (const hold of activeHolds) {
      if (hold.holdExpirationDate < today) {
        await db
          .update(frameHolds)
          .set({ status: "expired" })
          .where(eq(frameHolds.id, hold.id));
      }
    }
  }

  async recalculateRetailPrices(): Promise<void> {
    const alreadyRun = await this.getSetting("retailPricesMigratedV3");
    if (alreadyRun === "true") return;

    const multiplierStr = await this.getSetting("defaultMultiplier");
    const multiplier =
      multiplierStr &&
      !isNaN(Number(multiplierStr)) &&
      Number(multiplierStr) > 0
        ? Number(multiplierStr)
        : 3;

    await db.execute(sql`
      UPDATE frames
      SET retail_price = ROUND(cost::numeric * ${multiplier})
      WHERE cost IS NOT NULL AND cost::numeric > 0
    `);

    await this.setSetting("retailPricesMigratedV3", "true");
    console.log(
      `[startup] Retail prices recalculated using multiplier ${multiplier}`,
    );
  }

  async fixManufacturerData(): Promise<void> {
    // Pass 1: Update frames whose brand exactly matches (case-insensitive) an entry in the brands table
    await db.execute(sql`
      UPDATE frames f
      SET manufacturer = m.name
      FROM brands b
      JOIN manufacturers m ON m.id = b.manufacturer_id
      WHERE LOWER(TRIM(f.brand)) = LOWER(TRIM(b.name))
        AND f.manufacturer != m.name
    `);

    // Pass 2: Known spelling variants not in brands table
    await db.execute(sql`
      UPDATE frames SET manufacturer = 'Luxottica'
      WHERE LOWER(TRIM(brand)) = 'ray ban' AND manufacturer != 'Luxottica'
    `);
    await db.execute(sql`
      UPDATE frames SET manufacturer = 'Luxottica'
      WHERE LOWER(TRIM(brand)) = 'tiffany & co.' AND manufacturer != 'Luxottica'
    `);
    await db.execute(sql`
      UPDATE frames SET manufacturer = 'Luxottica'
      WHERE LOWER(TRIM(brand)) = 'tiffany & co' AND manufacturer != 'Luxottica'
    `);
    await db.execute(sql`
      UPDATE frames SET manufacturer = 'Vision Source Smart'
      WHERE LOWER(TRIM(brand)) = 'vision source' AND manufacturer != 'Vision Source Smart'
    `);
    await db.execute(sql`
      UPDATE frames SET manufacturer = 'Marchon'
      WHERE LOWER(TRIM(brand)) = 'nike flexon' AND manufacturer != 'Marchon'
    `);
  }
}

export const storage = new DbStorage();
