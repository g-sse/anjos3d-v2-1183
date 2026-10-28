import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function usePublishedContent(enabled = true) {
  return useQuery(orpc.cms.published.queryOptions({ enabled, staleTime: 0, refetchInterval: 30_000 }));
}
export function useCmsEditor() {
  return useQuery(orpc.cms.editor.queryOptions({ staleTime: 0, gcTime: 0 }));
}
export function useCmsPreview(enabled: boolean) {
  return useQuery(orpc.cms.preview.queryOptions({ enabled, staleTime: 0, gcTime: 0, refetchInterval: 30_000, retry: false }));
}
export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation(orpc.cms.saveDraft.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.cms.editor.key() }) }));
}
export function usePublishContent() {
  const qc = useQueryClient();
  return useMutation(orpc.cms.publish.mutationOptions({ onSuccess: async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: orpc.cms.editor.key() }),
      qc.invalidateQueries({ queryKey: orpc.cms.published.key() }),
      qc.invalidateQueries({ queryKey: orpc.catalog.settings.key() }),
    ]);
  } }));
}
export function useRestoreContent() {
  const qc = useQueryClient();
  return useMutation(orpc.cms.restore.mutationOptions({ onSuccess: () => qc.invalidateQueries({ queryKey: orpc.cms.editor.key() }) }));
}