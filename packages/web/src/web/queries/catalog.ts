import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function usePublicProducts() { return useQuery(orpc.catalog.publicList.queryOptions({ staleTime: 60_000 })); }
export function useSiteSettings() { return useQuery(orpc.catalog.settings.queryOptions()); }
export function useAdminProducts() { return useQuery(orpc.catalog.adminList.queryOptions()); }
export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation(orpc.catalog.save.mutationOptions({ onSuccess: () => {
    qc.invalidateQueries({ queryKey: orpc.catalog.adminList.key() });
    qc.invalidateQueries({ queryKey: orpc.catalog.publicList.key() });
    qc.invalidateQueries({ queryKey: orpc.catalog.partnerPrices.key() });
  } }));
}
export function useRemoveProduct() {
  const qc = useQueryClient();
  return useMutation(orpc.catalog.remove.mutationOptions({ onSuccess: () => {
    qc.invalidateQueries({ queryKey: orpc.catalog.adminList.key() });
    qc.invalidateQueries({ queryKey: orpc.catalog.publicList.key() });
    qc.invalidateQueries({ queryKey: orpc.catalog.partnerPrices.key() });
  } }));
}
export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation(orpc.catalog.saveSettings.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalog.settings.key() }) }));
}