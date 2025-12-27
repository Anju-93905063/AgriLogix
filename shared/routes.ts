import { z } from "zod";
import {
  insertUserSchema,
  insertProduceSchema,
  insertShipmentSchema,
  userSchema,
  produceSchema,
  shipmentSchema
} from "./schema.js";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(userSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/users",
      input: insertUserSchema,
      responses: {
        201: userSchema,
        400: errorSchemas.validation,
      },
    },
  },
  produce: {
    list: {
      method: "GET" as const,
      path: "/api/produce",
      responses: {
        200: z.array(produceSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/produce/:id",
      responses: {
        200: produceSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/produce",
      input: insertProduceSchema,
      responses: {
        201: produceSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/produce/:id",
      input: insertProduceSchema.partial(),
      responses: {
        200: produceSchema,
        404: errorSchemas.notFound,
      },
    },
  },
  shipments: {
    list: {
      method: "GET" as const,
      path: "/api/shipments",
      responses: {
        200: z.array(shipmentSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/shipments",
      input: insertShipmentSchema,
      responses: {
        201: shipmentSchema,
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/shipments/:id/status",
      input: z.object({ status: z.enum(["Scheduled", "In Transit", "Delivered"]) }),
      responses: {
        200: shipmentSchema,
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    dashboard: {
      method: "GET" as const,
      path: "/api/analytics/dashboard",
      responses: {
        200: z.object({
          totalProduce: z.number(),
          inTransitDeliveries: z.number(),
          deliveredItems: z.number(),
          lowStockItems: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
