import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, FileText, Globe, History, Save } from "lucide-react";
import { contentFields, contentKeys, sectionLabels, siteDocumentSchema, publishDocumentSchema } from "../../shared/site-content";
import type { ContentKey, SiteDocument } from "../../shared/site-content";
import { useCmsEditor, usePublishContent, useRestoreContent, useSaveDraft } from "../queries/cms";
import "../cms-admin.css";

type EditorData = NonNullable<ReturnType<typeof useCmsEditor>["data"]>;
const date = (value: Date) => new Date(value).toLocaleString("pt-BR");
const groups = [...new Set(contentKeys.map(key => contentFields[key].group))];

export function AdminCms({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const editor = useCmsEditor();
  if (editor.isPending) return <div className="cms-state">Carregando editor do site…</div>;
  if (editor.isError || !editor.data) return <div className="cms-state" role="alert">Não foi possível carregar o editor. <button onClick={() => editor.refetch()}>Tentar novamente</button></div>;
  return <CmsWorkspace initial={editor.data} refresh={async () => (await editor.refetch()).data} onDirtyChange={onDirtyChange} />;
}

function CmsWorkspace({ initial, refresh, onDirtyChange }: { initial: EditorData; refresh: () => Promise<EditorData | undefined>; onDirtyChange: (dirty: boolean) => void }) {
  const save = useSaveDraft(), publish = usePublishContent(), restore = useRestoreContent();
  const [document, setDocument] = useState<SiteDocument>(initial.draft);
  const [saved, setSaved] = useState(JSON.stringify(initial.draft));
  const [revision, setRevision] = useState(initial.draftRevision);
  const [view, setView] = useState("Visão geral");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const dirty = JSON.stringify(document) !== saved;
  const busy = save.isPending || publish.isPending || restore.isPending || publishing;
  const stale = revision !== initial.draftRevision;
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const report = (message: string, error = false) => { setNotice(message); setFailure(error); };
  const accept = (data: EditorData) => { setDocument(data.draft); setSaved(JSON.stringify(data.draft)); setRevision(data.draftRevision); };
  const reload = async () => {
    if (dirty && !window.confirm("Descartar alterações locais e carregar o último rascunho salvo?")) return;
    const data = await refresh();
    if (data) { accept(data); report("Rascunho atualizado no editor."); }
    else report("Não foi possível recarregar. Suas alterações continuam aqui.", true);
  };
  const saveDraft = async () => {
    const result = siteDocumentSchema.safeParse(document);
    if (!result.success) { report(result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(" / "), true); return; }
    try {
      const response = await save.mutateAsync({ document: result.data, expectedRevision: revision });
      setRevision(response.revision); setSaved(JSON.stringify(result.data));
      report("Rascunho salvo. O site público não mudou.");
    } catch (error) { report(error instanceof Error ? error.message : "Falha ao salvar rascunho.", true); }
  };
  const publishDraft = async () => {
    const validation = publishDocumentSchema.safeParse(document);
    if (!validation.success) { report(validation.error.issues.map(issue => issue.message).join(" / "), true); return; }
    if (!window.confirm("Publicar este rascunho? Os textos, seções e contato serão atualizados para todos os visitantes.")) return;
    setPublishing(true);
    try {
      await publish.mutateAsync({ expectedRevision: revision, expectedPublishedRevision: initial.publishedRevision });
      report("Versão publicada. As alterações já estão disponíveis no site.");
    } catch (error) { report(error instanceof Error ? error.message : "Falha ao publicar.", true); }
    finally { setPublishing(false); }
  };
  const restoreVersion = async (id: number) => {
    if (!window.confirm("Carregar esta versão como rascunho? As alterações locais serão substituídas. O site público não mudará até você publicar.")) return;
    try {
      await restore.mutateAsync({ id, expectedRevision: revision });
      const data = await refresh();
      if (data) accept(data);
      report("Versão carregada como rascunho. Revise antes de publicar.");
    } catch (error) { report(error instanceof Error ? error.message : "Falha ao restaurar versão.", true); }
  };
  const textChange = (key: ContentKey, value: string) => setDocument(prev => ({ ...prev, texts: { ...prev.texts, [key]: value } }));
  const moveSection = (index: number, delta: number) => {
    setDocument(prev => { const sections = [...prev.sections]; [sections[index], sections[index + delta]] = [sections[index + delta], sections[index]]; return { ...prev, sections }; });
  };
  return <section className="cms-workspace" aria-label="Editor do site">
    <div className="cms-toolbar">
      <div><span className="cms-kicker">GESTÃO DO SITE</span><h2>Seu site. Suas palavras.</h2><p><span className={`cms-status ${dirty || initial.hasChanges ? "draft" : "live"}`}>{dirty ? "Alterações não salvas" : initial.hasChanges ? "Rascunho salvo" : "Versão publicada"}</span><small>Rascunho {revision} · Publicação {initial.publishedRevision}</small></p></div>
      <div className="cms-actions">
        <button className="cms-secondary" disabled={busy || !dirty || stale} onClick={saveDraft}><Save size={16} />{save.isPending ? "Salvando…" : "Salvar rascunho"}</button>
        <a tabIndex={dirty || busy || stale ? -1 : 0} className={`cms-secondary ${dirty || busy || stale ? "disabled" : ""}`} href="/admin/preview" target="_blank" rel="noreferrer" aria-disabled={dirty || busy || stale} onClick={event => { if (dirty || busy || stale) event.preventDefault(); }}><Eye size={16} />Visualizar</a>
        <button className="cms-primary" disabled={busy || dirty || stale || !initial.hasChanges} onClick={publishDraft}><Globe size={16} />{publishing ? "Publicando…" : "Publicar versão"}</button>
      </div>
    </div>
    {dirty && <p className="cms-hint">Salve o rascunho para visualizar e publicar. Alterações locais ainda não chegaram ao servidor.</p>}
    {stale && <p className="cms-alert" role="alert">Existe um rascunho mais recente. <button onClick={reload} disabled={busy}>Recarregar editor</button></p>}
    {notice && <div className={failure ? "cms-alert" : "cms-success"} role={failure ? "alert" : "status"}><Check size={16} />{notice}</div>}
    <div className="cms-layout">
      <aside className="cms-sidebar" aria-label="Áreas de edição">
        {["Visão geral", "Seções", ...groups, "WhatsApp", "Histórico"].map(tab => <button key={tab} onClick={() => { setView(tab); setSearch(""); }} className={view === tab ? "active" : ""} aria-current={view === tab ? "page" : undefined}>{tab}</button>)}
      </aside>
      <div className="cms-editor-body">
        <div className="cms-view-heading"><div><span className="cms-kicker">EDITOR / {view.toUpperCase()}</span><h3>{view}</h3></div><button className="cms-text-button" onClick={reload} disabled={busy}>Recarregar</button></div>
        {view === "Visão geral" ? <>
          <div className="cms-overview"><article><FileText size={22} /><h4>1. Edite</h4><p>Escolha uma área ao lado. Os campos começam com o conteúdo atual do seu site.</p></article><article><Eye size={22} /><h4>2. Revise</h4><p>Salve o rascunho e abra a prévia protegida. Só administradores têm acesso.</p></article><article><Globe size={22} /><h4>3. Publique</h4><p>Ative a versão inteira de uma vez. Nenhum texto muda no site apenas por salvar.</p></article></div>
          <dl className="cms-facts"><div><dt>Última publicação</dt><dd>{date(initial.publishedAt)}</dd></div><div><dt>Último rascunho salvo</dt><dd>{date(initial.updatedAt)}</dd></div><div><dt>Conteúdo editável</dt><dd>{contentKeys.length} campos · 4 seções centrais</dd></div></dl>
          <p className="cms-hint">Este primeiro checkpoint cobre conteúdo, seções, contato e versões. Biblioteca de mídia, novas páginas e SEO/Google serão adicionados na próxima etapa. Produtos e parceiros continuam com salvamento imediato nas suas áreas.</p>
        </> : view === "Seções" ? <>
          <p className="cms-hint">O hero fica no início e o contato no rodapé. Você controla a ordem e a visibilidade das quatro seções centrais. Links do menu para seções ocultas também somem.</p>
          <div className="cms-sections">{document.sections.map((section, i) => <div key={section.id} className="cms-section-row"><span className="cms-order">{String(i + 1).padStart(2, "0")}</span><strong>{sectionLabels[section.id]}</strong><label><input type="checkbox" aria-label={`Mostrar ${sectionLabels[section.id]}`} checked={section.enabled} onChange={event => setDocument(prev => ({ ...prev, sections: prev.sections.map(row => row.id === section.id ? { ...row, enabled: event.target.checked } : row) }))} />Mostrar</label><button aria-label={`Subir ${sectionLabels[section.id]}`} disabled={i === 0} onClick={() => moveSection(i, -1)}><ArrowUp size={17} /></button><button aria-label={`Descer ${sectionLabels[section.id]}`} disabled={i === document.sections.length - 1} onClick={() => moveSection(i, 1)}><ArrowDown size={17} /></button></div>)}</div>
        </> : view === "WhatsApp" ? <div className="cms-fields"><label>Número com país e DDD<input aria-label="WhatsApp do site" value={document.whatsapp} inputMode="tel" maxLength={15} onChange={event => setDocument(prev => ({ ...prev, whatsapp: event.target.value.replace(/\D/g, "") }))} placeholder="5541999999999" /><small>12 a 15 dígitos, sem + ou espaços. Em branco, os botões retornam à seção de contato. Só muda para o público após publicar.</small></label><p className="cms-hint">As mensagens de WhatsApp estão nas áreas Contato e rodapé, Catálogo vazio e Condições comerciais.</p></div> : view === "Histórico" ? <>
          <p className="cms-hint">Restaurar carrega uma publicação anterior como rascunho. Não desfaz o site automaticamente. Exibindo as últimas 20 versões.</p>
          <div className="cms-history">{initial.versions.map(version => <article key={version.id}><History size={19} /><div><strong>{version.label}</strong><small>{date(version.createdAt)}</small></div><button className="cms-secondary" onClick={() => restoreVersion(version.id)} disabled={busy || stale}>Usar como rascunho</button></article>)}</div>
        </> : <>
          <label className="cms-search">Encontrar campo<input aria-label="Encontrar campo" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pelo nome do campo…" /></label>
          <div className="cms-fields">{contentKeys.filter(key => contentFields[key].group === view && contentFields[key].label.toLowerCase().includes(search.toLowerCase())).map(key => {
            const field = contentFields[key] as { label: string; kind?: string };
            return <label key={key}>{field.label}{field.kind === "paragraph" ? <textarea aria-label={field.label} rows={3} maxLength={4000} value={document.texts[key]} onChange={event => textChange(key, event.target.value)} /> : <input aria-label={field.label} maxLength={field.kind === "link" ? 2048 : 4000} value={document.texts[key]} onChange={event => textChange(key, event.target.value)} />}{field.kind === "link" && <small>Âncora (#catalogo), caminho (/sobre) ou link https://.</small>}{field.kind === "image" && <><small>Arquivo atual do site. Upload/biblioteca entram na próxima etapa.</small><img className="cms-image-preview" src={document.texts[key]} alt="Prévia do arquivo" /></>}{field.label.includes("{") && <small>Mantenha os termos entre chaves para preencher os dados automaticamente.</small>}</label>;
          })}</div>
        </>}
      </div>
    </div>
  </section>;
}