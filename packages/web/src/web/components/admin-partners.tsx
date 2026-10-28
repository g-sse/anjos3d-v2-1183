import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { useCreatePartner, usePartners, useResetPartnerPassword, useSetPartnerActive } from "../queries/partners";
import "../partners-admin.css";

export function AdminPartners() {
  const partners = usePartners();
  const create = useCreatePartner();
  const changeStatus = useSetPartnerActive();
  const reset = useResetPartnerPassword();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(true);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState("");
  const [notice, setNotice] = useState("");
  const busy = create.isPending || changeStatus.isPending || reset.isPending;
  return <section className="admin-partners">
    <div className="admin-section-title"><div><h2>PARCEIROS</h2><p>Acessos ao catálogo, sem permissão de administração.</p></div><button className="outline-button" onClick={() => { setCreating(!creating); setPassword(""); setNotice(""); }} disabled={busy}><Plus size={16} /> NOVO PARCEIRO</button></div>
    {notice && <p className="partner-admin-notice" aria-live="polite">{notice}</p>}
    {creating && <form className="partner-admin-form" onSubmit={async e => {
      e.preventDefault();setNotice("");
      try { await create.mutateAsync({ name, email, password, active });setCreating(false);setName("");setEmail("");setPassword("");setActive(true);setNotice("Acesso criado. Entregue o e-mail e a senha inicial ao parceiro pelo seu canal habitual. Nenhum e-mail foi enviado."); }
      catch (cause) { setNotice(cause instanceof Error ? cause.message : "Não foi possível criar o acesso."); }
    }}>
      <label>NOME<input aria-label="Nome do parceiro" required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>E-MAIL<input aria-label="E-mail do parceiro" required type="email" maxLength={254} autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>SENHA INICIAL<input aria-label="Senha inicial do parceiro" required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /><small>Pelo menos 8 caracteres. A senha não fica visível na lista.</small></label>
      <label className="partner-active-check"><input aria-label="Acesso ativo do parceiro" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> ACESSO ATIVO</label>
      <div className="partner-form-actions"><button type="button" className="outline-button" onClick={() => { setCreating(false);setPassword(""); }} disabled={busy}>CANCELAR</button><button type="submit" className="button-orange" disabled={busy}><Save size={16} />{create.isPending ? "CRIANDO…" : "CRIAR ACESSO"}</button></div>
    </form>}
    {partners.isLoading ? <p>Carregando parceiros…</p> : partners.isError ? <p>Não foi possível carregar os acessos. <button className="outline-button" onClick={() => partners.refetch()}>TENTAR NOVAMENTE</button></p> : !partners.data?.length ? <p className="partner-admin-empty">Nenhum parceiro cadastrado. Crie um acesso para um cliente ou lojista.</p> : <div className="partner-admin-list">{partners.data.map(partner => <div className="partner-admin-row" key={partner.userId}>
      <div><strong>{partner.name}</strong><span>{partner.email}</span></div><span className={`pill${partner.active ? " published" : ""}`}>{partner.active ? "ATIVO" : "BLOQUEADO"}</span>
      <div className="partner-row-actions"><button className="outline-button" disabled={busy} onClick={async () => {
        setNotice("");try { await changeStatus.mutateAsync({ userId: partner.userId, active: !partner.active });setNotice(partner.active ? "Acesso bloqueado e sessões encerradas." : "Acesso reativado. O parceiro precisa entrar novamente."); } catch { setNotice("Não foi possível alterar o acesso."); }
      }}>{changeStatus.isPending && changeStatus.variables?.userId === partner.userId ? "SALVANDO…" : partner.active ? "BLOQUEAR" : "REATIVAR"}</button><button className="outline-button" disabled={busy} onClick={() => { setResetId(partner.userId);setResetValue("");setNotice(""); }}>REDEFINIR SENHA</button></div>
      {resetId === partner.userId && <form className="partner-reset-form" onSubmit={async e => {
        e.preventDefault();setNotice("");try { await reset.mutateAsync({ userId: partner.userId, password: resetValue });setResetId(null);setResetValue("");setNotice("Senha redefinida e sessões encerradas. Entregue a nova senha ao parceiro."); } catch { setNotice("Não foi possível redefinir a senha."); }
      }}><label>NOVA SENHA<input aria-label="Nova senha do parceiro" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={resetValue} onChange={e => setResetValue(e.target.value)} /></label><button type="submit" className="button-orange" disabled={busy}>{reset.isPending ? "SALVANDO…" : "SALVAR NOVA SENHA"}</button><button type="button" className="outline-button" aria-label="Cancelar redefinição" disabled={busy} onClick={() => { setResetId(null);setResetValue(""); }}><X size={16} /></button><p>As sessões atuais serão encerradas. O status de bloqueio não muda.</p></form>}
    </div>)}</div>}
  </section>;
}