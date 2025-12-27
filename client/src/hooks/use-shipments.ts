import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useShipmentsList() {
  return useQuery({
    queryKey: [api.shipments.list.path],
    queryFn: async () => {
      const res = await fetch(api.shipments.list.path);
      if (!res.ok) throw new Error("Failed to fetch shipments");
      return api.shipments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.shipments.create.input>) => {
      const res = await fetch(api.shipments.create.path, {
        method: api.shipments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.shipments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create shipment");
      }
      return api.shipments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.shipments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Scheduled" | "In Transit" | "Delivered" }) => {
      const url = buildUrl(api.shipments.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.shipments.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update shipment status");
      }
      return api.shipments.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.shipments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}
