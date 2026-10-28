import { useEffect } from "react";
import { useAccess } from "../queries/partners";
import { useCmsPreview } from "../queries/cms";
import { PublicSite } from "./index";
import "../cms-admin.css";

export default function CmsPreview() {
  const access = useAccess();
  const preview = useCmsPreview(access.data?.role === "admin");
  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Prévia de rascunho — Anjos3D";
    const meta = document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex, nofollow";
    document.head.append(meta);
    return () => { meta.remove(); document.title = oldTitle; };
  }, []);
  if (access.isPending) return <div className="cms-preview-notice">Verificando acesso à prévia…</div>;
  if (access.isError || access.data?.role !== "admin") return <div className="cms-preview-notice"><h1>Prévia restrita</h1><p>Entre como administrador para visualizar o rascunho.</p><a href="/admin">Acessar o painel</a></div>;
  if (preview.isPending) return <div className="cms-preview-notice">Carregando rascunho…</div>;
  if (preview.isError || !preview.data) return <div className="cms-preview-notice" role="alert">Não foi possível carregar o rascunho. <button onClick={() => preview.refetch()}>Tentar novamente</button> <a href="/admin">Voltar ao painel</a></div>;
  return <><div className="cms-preview-banner"><span>PRÉVIA DE RASCUNHO · Não é a versão pública. Exibe o último rascunho salvo; produtos usam o catálogo atual.</span><a href="/admin">Voltar ao editor</a></div><PublicSite document={preview.data} /></>;
}