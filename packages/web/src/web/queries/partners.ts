import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { authClient } from "../lib/auth";

export function useAccess() {
  const { data: session, isPending } = authClient.useSession();
  return useQuery({ ...orpc.partnerAccounts.access.queryOptions(), queryKey: [...orpc.partnerAccounts.access.key(), session?.user.id ?? "anonymous"], enabled: !isPending, staleTime: 0, refetchInterval: 30_000, retry: false });
}
export function usePartnerPrices(enabled: boolean) {
  const { data: session } = authClient.useSession();
  return useQuery({ ...orpc.catalog.partnerPrices.queryOptions(), queryKey: [...orpc.catalog.partnerPrices.key(), session?.user.id ?? "anonymous"], enabled: enabled && !!session, gcTime: 0, staleTime: 0, refetchInterval: 30_000, retry: false });
}
export function usePartners() { return useQuery(orpc.partnerAccounts.list.queryOptions()); }
export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation(orpc.partnerAccounts.create.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.partnerAccounts.list.key() }) }));
}
export function useSetPartnerActive() {
  const qc = useQueryClient();
  return useMutation(orpc.partnerAccounts.setActive.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.partnerAccounts.list.key() }) }));
}
export function useResetPartnerPassword() { return useMutation(orpc.partnerAccounts.resetPassword.mutationOptions()); }
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => {
    await qc.cancelQueries();
    qc.clear();
    const result = await authClient.signOut();
    if (result.error) throw new Error("Não foi possível sair. Tente novamente.");
    qc.clear();
  } });
}