import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePairingStatus() {
  return useQuery({
    queryKey: [api.pairing.status.path],
    queryFn: async () => {
      const res = await fetch(api.pairing.status.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pairing status");
      return api.pairing.status.responses[200].parse(await res.json());
    },
    retry: false
  });
}

export function usePairingCode() {
  return useQuery({
    queryKey: [api.pairing.getCode.path],
    queryFn: async () => {
      const res = await fetch(api.pairing.getCode.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pairing code");
      return api.pairing.getCode.responses[200].parse(await res.json());
    }
  });
}

export function useGeneratePairingCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.pairing.generateCode.path, {
        method: api.pairing.generateCode.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to generate code");
      return api.pairing.generateCode.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pairing.getCode.path] })
  });
}

export function useUsePairingCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(api.pairing.useCode.path, {
        method: api.pairing.useCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid code");
      }
      return api.pairing.useCode.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pairing.status.path] })
  });
}

export function useUnpair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.pairing.unpair.path, {
        method: api.pairing.unpair.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to unpair");
      return api.pairing.unpair.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pairing.status.path] })
  });
}
