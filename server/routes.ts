import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFrameSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/frames", async (_req, res) => {
    try {
      const allFrames = await storage.getFrames();
      res.json(allFrames);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frames" });
    }
  });

  app.get("/api/frames/:id", async (req, res) => {
    try {
      const frame = await storage.getFrame(req.params.id);
      if (!frame) {
        return res.status(404).json({ message: "Frame not found" });
      }
      res.json(frame);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frame" });
    }
  });

  app.post("/api/frames", async (req, res) => {
    try {
      const parsed = insertFrameSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const frame = await storage.createFrame(parsed.data);
      res.status(201).json(frame);
    } catch (error) {
      res.status(500).json({ message: "Failed to create frame" });
    }
  });

  app.patch("/api/frames/:id", async (req, res) => {
    try {
      const parsed = insertFrameSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid frame data", errors: parsed.error.errors });
      }
      const frame = await storage.updateFrame(req.params.id, parsed.data);
      if (!frame) {
        return res.status(404).json({ message: "Frame not found" });
      }
      res.json(frame);
    } catch (error) {
      res.status(500).json({ message: "Failed to update frame" });
    }
  });

  app.delete("/api/frames/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFrame(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Frame not found" });
      }
      res.json({ message: "Frame deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete frame" });
    }
  });

  return httpServer;
}
