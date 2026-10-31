import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth";
import { client } from "../lib/api";
import { useAccess } from "../queries/partners";
import "../public-site.css";
import "../public-palette-logo.css";
import { usePublicPalette } from "../hooks/use-public-palette";

export default function PartnerLogin() {
  const access = useAccess();
  const qc = useQueryClient();
  const { palette } = usePublicPalette();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (access.data?.role === "partner" || access.data?.role === "admin") window.location.replace("/#catalogo"); }, [access.data?.role]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      await qc.cancelQueries(); qc.clear();
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error("E-mail ou senha inválidos, ou acesso bloqueado. Fale com a Anjos3D.");
      const allowed = await client.partnerAccounts.access();
      if (allowed.role === "anonymous") { await authClient.signOut(); throw new Error("Este acesso não está ativo. Fale com a Anjos3D."); }
      setPassword(""); window.location.replace("/#catalogo");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível entrar. Tente novamente."); setLoading(false); }
  };
  return <div className="public-site partner-login-page" data-palette={palette}>
    <a className="partner-back" href="/#catalogo"><ArrowLeft size={16} /> Voltar ao catálogo</a>
    <main className="partner-login-card">
      <a href="/" className="partner-login-brand"><img src="/images/anjos-mark.png" alt="" /> ANJOS3D</a>
      <h1>Bom ter você por aqui.</h1>
      <p>Entre com o acesso recebido da Anjos3D para consultar as condições de revenda e consignação.</p>
      <form onSubmit={submit}>
        <label>E-mail<input aria-label="E-mail do parceiro" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Senha<input aria-label="Senha do parceiro" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="partner-login-error" aria-live="polite">{error}</p>}
        <button className="button-orange" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar no catálogo"}<ArrowUpRight size={17} /></button>
      </form>
      <p className="partner-login-help">Ainda não tem acesso ou precisa de uma nova senha? <a href="/#contato">Fale com a Anjos3D.</a> Os cadastros são criados pela nossa equipe.</p>
    </main>
  </div>;
}