import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { connectDB } from "./db";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await connectDB();

  // Users
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Produce
  app.get(api.produce.list.path, async (req, res) => {
    const produce = await storage.getAllProduce();
    res.json(produce);
  });

  app.get(api.produce.get.path, async (req, res) => {
    const produce = await storage.getProduce(req.params.id);
    if (!produce) return res.status(404).json({ message: "Not found" });
    res.json(produce);
  });

  app.post(api.produce.create.path, async (req, res) => {
    try {
      const input = api.produce.create.input.parse(req.body);
      const produce = await storage.createProduce(input);
      res.status(201).json(produce);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.produce.update.path, async (req, res) => {
    try {
      const input = api.produce.update.input.parse(req.body);
      const produce = await storage.updateProduce(req.params.id, input);
      if (!produce) return res.status(404).json({ message: "Not found" });
      res.json(produce);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Shipments
  app.get(api.shipments.list.path, async (req, res) => {
    const shipments = await storage.getShipments();
    res.json(shipments);
  });

  app.post(api.shipments.create.path, async (req, res) => {
    try {
      const input = api.shipments.create.input.parse(req.body);
      const shipment = await storage.createShipment(input);
      res.status(201).json(shipment);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.patch(api.shipments.updateStatus.path, async (req, res) => {
    try {
      const input = api.shipments.updateStatus.input.parse(req.body);
      const shipment = await storage.updateShipmentStatus(req.params.id, input.status);
      if (!shipment) return res.status(404).json({ message: "Not found" });
      res.json(shipment);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Analytics
  app.get(api.analytics.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });
  
  // Seed Data
  try {
    const users = await storage.getUsers();
    if (users.length === 0) {
      console.log("Seeding database...");
      await storage.createUser({ name: "John Farmer", role: "farmer" });
      await storage.createUser({ name: "Fast Logistics", role: "distributor" });
      await storage.createUser({ name: "Fresh Market", role: "vendor" });
      
      const produce = await storage.createProduce({
        name: "Apples", quantity: 100, harvestDate: new Date().toISOString(), sourceLocation: "Farm A", status: "Available"
      });
      
      await storage.createProduce({
        name: "Corn", quantity: 40, harvestDate: new Date().toISOString(), sourceLocation: "Farm B", status: "Available"
      });
      
      await storage.createShipment({
        produceId: produce.id,
        destination: "Market NYC",
        deliveryDate: new Date(Date.now() + 86400000).toISOString(),
      });
      console.log("Database seeded");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }

  return httpServer;
}
