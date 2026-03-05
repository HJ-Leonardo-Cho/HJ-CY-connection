import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMyStatus() {
  return useQuery({
    queryKey: [api.status.getMine.path],
    queryFn: async () => {
      const res = await fetch(api.status.getMine.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch my status");
      return api.status.getMine.responses[200].parse(await res.json());
    }
  });
}

export function usePartnerStatus() {
  return useQuery({
    queryKey: [api.status.getPartner.path],
    queryFn: async () => {
      const res = await fetch(api.status.getPartner.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch partner status");
      return api.status.getPartner.responses[200].parse(await res.json());
    }
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { currentStatus?: string | null; futureNotice?: string | null }) => {
      const res = await fetch(api.status.update.path, {
        method: api.status.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.status.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.status.getMine.path] })
  });
}
