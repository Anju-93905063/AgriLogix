import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useProduceList() {
  return useQuery({
    queryKey: [api.produce.list.path],
    queryFn: async () => {
      const res = await fetch(api.produce.list.path);
      if (!res.ok) throw new Error("Failed to fetch produce list");
      return api.produce.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduce(id: string) {
  return useQuery({
    queryKey: [api.produce.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.produce.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch produce item");
      return api.produce.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProduce() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.produce.create.input>) => {
      const res = await fetch(api.produce.create.path, {
        method: api.produce.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.produce.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create produce");
      }
      return api.produce.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.produce.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}

export function useUpdateProduce() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & z.infer<typeof api.produce.update.input>) => {
      const url = buildUrl(api.produce.update.path, { id });
      const res = await fetch(url, {
        method: api.produce.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error("Failed to update produce");
      }
      return api.produce.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.produce.list.path] });
    },
  });
}
