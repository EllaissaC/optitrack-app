import { eq } from "drizzle-orm";
import { db } from "./db";
import { frames, type Frame, type InsertFrame } from "@shared/schema";

export interface IStorage {
  getFrames(): Promise<Frame[]>;
  getFrame(id: string): Promise<Frame | undefined>;
  createFrame(frame: InsertFrame): Promise<Frame>;
  updateFrame(id: string, frame: Partial<InsertFrame>): Promise<Frame | undefined>;
  deleteFrame(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getFrames(): Promise<Frame[]> {
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
}

export const storage = new DbStorage();
