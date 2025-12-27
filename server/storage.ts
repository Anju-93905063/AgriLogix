import {
  User, InsertUser,
  Produce, InsertProduce,
  Shipment, InsertShipment
} from "../shared/schema.js";
import mongoose, { Schema } from "mongoose";

// Mongoose Schemas
const userSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["farmer", "distributor", "vendor"], required: true },
});

const produceSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  harvestDate: { type: String, required: true },
  sourceLocation: { type: String, required: true },
  status: { type: String, enum: ["Available", "In Transit", "Delivered"], default: "Available" },
});

const logSchema = new Schema({
  status: { type: String, enum: ["Scheduled", "In Transit", "Delivered"], required: true },
  timestamp: { type: String, required: true },
});

const shipmentSchema = new Schema({
  produceId: { type: String, required: true },
  destination: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  status: { type: String, enum: ["Scheduled", "In Transit", "Delivered"], default: "Scheduled" },
  logs: [logSchema],
  routeData: {
    distance: String,
    duration: String,
    source: String,
    destination: String,
    coordinates: {
      start: { lat: Number, lng: Number },
      end: { lat: Number, lng: Number }
    }
  },
});

// Models
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const ProduceModel = mongoose.models.Produce || mongoose.model("Produce", produceSchema);
const ShipmentModel = mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);

export interface IStorage {
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  getAllProduce(): Promise<Produce[]>;
  getProduce(id: string): Promise<Produce | undefined>;
  createProduce(produce: InsertProduce): Promise<Produce>;
  updateProduce(id: string, produce: Partial<InsertProduce>): Promise<Produce | undefined>;

  getShipments(): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(id: string, status: "Scheduled" | "In Transit" | "Delivered"): Promise<Shipment | undefined>;

  getDashboardStats(): Promise<{
    totalProduce: number;
    inTransitDeliveries: number;
    deliveredItems: number;
    lowStockItems: number;
  }>;
}

export class MongoStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map(u => ({ ...u.toObject(), id: u._id.toString() }));
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    return { ...newUser.toObject(), id: newUser._id.toString() };
  }

  async getAllProduce(): Promise<Produce[]> {
    const produce = await ProduceModel.find();
    return produce.map(p => ({ ...p.toObject(), id: p._id.toString() }));
  }

  async getProduce(id: string): Promise<Produce | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const produce = await ProduceModel.findById(id);
    return produce ? { ...produce.toObject(), id: produce._id.toString() } : undefined;
  }

  async createProduce(produce: InsertProduce): Promise<Produce> {
    const newProduce = new ProduceModel(produce);
    await newProduce.save();
    return { ...newProduce.toObject(), id: newProduce._id.toString() };
  }

  async updateProduce(id: string, update: Partial<InsertProduce>): Promise<Produce | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const updated = await ProduceModel.findByIdAndUpdate(id, update, { new: true });
    return updated ? { ...updated.toObject(), id: updated._id.toString() } : undefined;
  }

  async getShipments(): Promise<Shipment[]> {
    const shipments = await ShipmentModel.find();
    return shipments.map(s => ({ ...s.toObject(), id: s._id.toString() }));
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const newShipment = new ShipmentModel({
      ...shipment,
      logs: [{ status: "Scheduled", timestamp: new Date().toISOString() }]
    });
    await newShipment.save();
    return { ...newShipment.toObject(), id: newShipment._id.toString() };
  }

  async updateShipmentStatus(id: string, status: "Scheduled" | "In Transit" | "Delivered"): Promise<Shipment | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const shipment = await ShipmentModel.findById(id);
    if (!shipment) return undefined;

    shipment.status = status;
    shipment.logs.push({ status, timestamp: new Date().toISOString() });
    await shipment.save();

    return { ...shipment.toObject(), id: shipment._id.toString() };
  }

  async getDashboardStats() {
    const totalProduce = await ProduceModel.countDocuments();
    const inTransitDeliveries = await ShipmentModel.countDocuments({ status: "In Transit" });
    const deliveredItems = await ShipmentModel.countDocuments({ status: "Delivered" });
    const lowStockItems = await ProduceModel.countDocuments({ quantity: { $lt: 50 } });

    return {
      totalProduce,
      inTransitDeliveries,
      deliveredItems,
      lowStockItems,
    };
  }
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private produce: Produce[] = [];
  private shipments: Shipment[] = [];
  private userIdCounter = 1;
  private produceIdCounter = 1;
  private shipmentIdCounter = 1;

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { ...user, id: (this.userIdCounter++).toString() };
    this.users.push(newUser);
    return newUser;
  }

  async getAllProduce(): Promise<Produce[]> {
    return this.produce;
  }

  async getProduce(id: string): Promise<Produce | undefined> {
    return this.produce.find(p => p.id === id);
  }

  async createProduce(produce: InsertProduce): Promise<Produce> {
    const newProduce: Produce = {
      ...produce,
      id: (this.produceIdCounter++).toString(),
      status: produce.status || "Available"
    };
    this.produce.push(newProduce);
    return newProduce;
  }

  async updateProduce(id: string, update: Partial<InsertProduce>): Promise<Produce | undefined> {
    const index = this.produce.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.produce[index] = { ...this.produce[index], ...update };
    return this.produce[index];
  }

  async getShipments(): Promise<Shipment[]> {
    return this.shipments;
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const newShipment: Shipment = {
      ...shipment,
      id: (this.shipmentIdCounter++).toString(),
      status: shipment.status || "Scheduled",
      //@ts-ignore
      logs: [{ status: "Scheduled", timestamp: new Date().toISOString() }],
    };
    this.shipments.push(newShipment);
    return newShipment;
  }

  async updateShipmentStatus(id: string, status: "Scheduled" | "In Transit" | "Delivered"): Promise<Shipment | undefined> {
    const index = this.shipments.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.shipments[index].status = status;
    this.shipments[index].logs.push({ status, timestamp: new Date().toISOString() });
    return this.shipments[index];
  }

  async getDashboardStats() {
    return {
      totalProduce: this.produce.length,
      inTransitDeliveries: this.shipments.filter(s => s.status === "In Transit").length,
      deliveredItems: this.shipments.filter(s => s.status === "Delivered").length,
      lowStockItems: this.produce.filter(p => p.quantity < 50).length,
    };
  }
}

export const storage = process.env.MONGODB_URI ? new MongoStorage() : new MemStorage();
