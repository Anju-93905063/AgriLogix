import { z } from "zod";

// Enums
export const roleEnum = z.enum(["farmer", "distributor", "vendor"]);
export const produceStatusEnum = z.enum(["Available", "In Transit", "Delivered"]);
export const shipmentStatusEnum = z.enum(["Scheduled", "In Transit", "Delivered"]);

// User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: roleEnum,
});

export const insertUserSchema = userSchema.omit({ id: true });

// Produce Schema
export const produceSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0),
  harvestDate: z.string(), // ISO date string
  sourceLocation: z.string(),
  status: produceStatusEnum.default("Available"),
});

export const insertProduceSchema = produceSchema.omit({ id: true });

// Shipment Schema
export const logSchema = z.object({
  status: shipmentStatusEnum,
  timestamp: z.string(),
});

export const shipmentSchema = z.object({
  id: z.string(),
  produceId: z.string(),
  destination: z.string(),
  deliveryDate: z.string(),
  status: shipmentStatusEnum.default("Scheduled"),
  logs: z.array(logSchema),
  routeData: z.object({
    distance: z.string(),
    duration: z.string(),
    source: z.string(),
    destination: z.string(),
    coordinates: z.object({
      start: z.object({ lat: z.number(), lng: z.number() }),
      end: z.object({ lat: z.number(), lng: z.number() }),
    }).optional(),
  }).optional(),
});

export const insertShipmentSchema = shipmentSchema.omit({ id: true, logs: true });

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Produce = z.infer<typeof produceSchema>;
export type InsertProduce = z.infer<typeof insertProduceSchema>;
export type Shipment = z.infer<typeof shipmentSchema>;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type ShipmentLog = z.infer<typeof logSchema>;
