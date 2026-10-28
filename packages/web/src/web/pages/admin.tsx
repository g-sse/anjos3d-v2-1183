import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { authClient } from "../lib/auth";
import { client } from "../lib/api";
import { useAccess, useLogout } from "../queries/partners";
import { AdminPartners } from "../components/admin-partners";
import { AdminCms } from "../components/admin-cms";
import { AdminAppearance, AdminThemeToggle } from "../components/admin-appearance";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminProducts,
  useRemoveProduct,
  useSaveProduct,
  useSaveSettings,
  useSiteSettings,
} from "../queries/catalog";

type Form = {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: string;
  resalePrice: string;
  consignmentPrice: string;
  material: string;
  dimensions: string;
  images: string[];
  imageUrls: string[];
  available: boolean;
  published: boolean;
};
const blank: Form = {
  name: "",
  description: "",
  category: "Decoração",
  price: "",
  resalePrice: "",
  consignmentPrice: "",
  material: "",
  dimensions: "",
  images: [],
  imageUrls: [],
  available: true,
  published: false,
};

function priceToCents(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("Informe os preços com no máximo dois decimais, ou deixe em branco.");
  const [whole, decimals = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("O preço deve ser positivo, ou ficar em branco para negociar.");
  return cents;
}

function Login() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await qc.cancelQueries(); qc.clear();
      const result = await authClient.signIn.email({ email, password });
      if (result.error) setError("E-mail ou senha inválidos.");
    } catch { setError("Não foi possível entrar. Tente novamente."); }
    finally { setLoading(false); }
  };
  return (
    <div className="admin-login">
      <AdminThemeToggle className="login-theme-toggle" />
      <a href="/" className="back-site">
        <ArrowLeft size={17} /> VOLTAR AO SITE
      </a>
      <div className="login-box">
        <img src="/images/anjos-mark.png" alt="Anjos3D" />
        <span className="overline blue">ÁREA RESTRITA / ANJOS3D</span>
        <h1>
          GERENCIE
          <br />O QUE <em>CRIAMOS.</em>
        </h1>
        <p>Acesse seu painel para editar o site, publicar conteúdo e organizar o catálogo.</p>
        <form onSubmit={submit}>
          <label>
            E-MAIL
            <input
              aria-label="E-mail do administrador"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            SENHA
            <input
              aria-label="Senha do administrador"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <span className="form-error">{error}</span>}
          <button type="submit" className="button-orange" disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR NO PAINEL"}
            <ArrowUpRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState("Site e conteúdo");
  const [cmsDirty, setCmsDirty] = useState(false);
  const logout = useLogout();
  const products = useAdminProducts(),
    settings = useSiteSettings(),
    save = useSaveProduct(),
    remove = useRemoveProduct(),
    saveSettings = useSaveSettings();
  const [form, setForm] = useState<Form | null>(null),
    [quantity, setQuantity] = useState(5),
    [notice, setNotice] = useState(""),
    [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (settings.data) { setQuantity(settings.data.negotiationQuantity); }
  }, [settings.data]);
  const edit = (item: NonNullable<typeof products.data>[number]) => {
    setNotice("");
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price:
        item.priceCents === null
          ? ""
          : (item.priceCents / 100).toFixed(2).replace(".", ","),
      resalePrice: item.resalePriceCents === null ? "" : (item.resalePriceCents / 100).toFixed(2).replace(".", ","),
      consignmentPrice: item.consignmentPriceCents === null ? "" : (item.consignmentPriceCents / 100).toFixed(2).replace(".", ","),
      material: item.material,
      dimensions: item.dimensions,
      images: JSON.parse(item.images),
      imageUrls: item.imageUrls,
      available: item.available,
      published: item.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const upload = async (files: FileList | null) => {
    if (!files || !form) return;
    setUploading(true);
    setNotice("");
    try {
      const newKeys: string[] = [];
      const newUrls: string[] = [];
      for (const file of Array.from(files).slice(0, 6 - form.images.length)) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 8 * 1024 * 1024
        )
          throw new Error("Use JPG, PNG ou WebP de até 8 MB.");
        const signed = await client.catalog.upload({
          contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
          filename: file.name,
        });
        const result = await fetch(signed.url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!result.ok) throw new Error("Falha ao enviar foto.");
        newKeys.push(signed.key);
        newUrls.push(URL.createObjectURL(file));
      }
      setForm((prev) =>
        prev
          ? {
              ...prev,
              images: [...prev.images, ...newKeys],
              imageUrls: [...prev.imageUrls, ...newUrls],
            }
          : null,
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setNotice("");
    try {
      await save.mutateAsync({
        id: form.id,
        name: form.name,
        description: form.description,
        category: form.category,
        priceCents: priceToCents(form.price),
        resalePriceCents: priceToCents(form.resalePrice),
        consignmentPriceCents: priceToCents(form.consignmentPrice),
        material: form.material,
        dimensions: form.dimensions,
        images: form.images,
        available: form.available,
        published: form.published,
      });
      setForm(null);
      setNotice("Produto salvo com sucesso.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    }
  };
  const del = async (id: number) => {
    if (!window.confirm("Remover este produto do catálogo?")) return;
    try {
      await remove.mutateAsync({ id });
      setNotice("Produto removido.");
    } catch {
      setNotice("Não foi possível remover.");
    }
  };
  if (products.isLoading || settings.isLoading)
    return (
      <div className="admin-loading">
        CARREGANDO PAINEL<span className="blink">_</span>
      </div>
    );
  if (products.isError)
    return (
      <div className="admin-loading">
        ACESSO NÃO AUTORIZADO{" "}
        <button onClick={() => logout.mutate()} disabled={logout.isPending}>SAIR</button>
      </div>
    );
  return (
    <div className="admin-app">
      <header className="admin-top">
        <a href="/" className="brand">
          <img src="/images/anjos-mark.png" alt="" />
          <span>
            ANJOS<span>3D</span>
            <small>PAINEL DE CONTROLE</small>
          </span>
        </a>
        <div>
          <AdminThemeToggle />
          <a href="/" target="_blank" rel="noreferrer">
            VER SITE <ArrowUpRight size={16} />
          </a>
          <button onClick={() => logout.mutate()} disabled={logout.isPending}>
            SAIR <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <span className="overline blue">SEU ESTÚDIO / ADMINISTRAÇÃO</span>
            <h1>
              CONTROLE DO <em>SEU SITE.</em>
            </h1>
            <p>Edite o conteúdo, revise o rascunho e publique no seu tempo.</p>
          </div>
          {tab === "Catálogo" && <button
            className="button-orange"
            onClick={() => {
              setForm({ ...blank });
              setNotice("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Plus size={18} /> NOVO PRODUTO
          </button>}
        </div>
        <nav className="admin-nav" aria-label="Áreas administrativas">{["Site e conteúdo", "Catálogo", "Parceiros"].map(area => <button key={area} aria-current={tab === area ? "page" : undefined} className={tab === area ? "active" : ""} onClick={() => { if (tab === area) return; if (cmsDirty && !window.confirm("Trocar de área sem salvar? As alterações locais do site serão descartadas.")) return; setTab(area); }}>{area}</button>)}</nav>
        {tab === "Site e conteúdo" && <AdminCms onDirtyChange={setCmsDirty} />}
        {tab === "Parceiros" && <AdminPartners />}
        {tab === "Catálogo" && <>
        <p className="cms-hint">Produtos têm salvamento imediato. Nome, fotos, preços e publicação do catálogo não fazem parte do rascunho institucional do site.</p>
        {notice && (
          <div className="admin-notice">
            <Check size={17} />
            {notice}
            <button onClick={() => setNotice("")} aria-label="Fechar aviso">
              <X size={16} />
            </button>
          </div>
        )}
        {form && (
          <section className="admin-editor">
            <div className="editor-title">
              <div>
                <span className="overline blue">
                  {form.id ? "EDITAR PEÇA" : "NOVA PEÇA"}
                </span>
                <h2>{form.id ? "EDITAR PRODUTO" : "CADASTRAR PRODUTO"}</h2>
              </div>
              <button onClick={() => setForm(null)} aria-label="Fechar editor">
                <X />
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="editor-grid">
                <label>
                  NOME DO PRODUTO *
                  <input
                    required
                    aria-label="Nome do produto"
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex.: Vaso orgânico"
                  />
                </label>
                <label>
                  CATEGORIA *
                  <input
                    required
                    aria-label="Categoria do produto"
                    maxLength={80}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Ex.: Decoração"
                  />
                </label>
                <label className="full">
                  DESCRIÇÃO
                  <textarea
                    aria-label="Descrição do produto"
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Conte a história desta peça..."
                  />
                </label>
                <label>
                  PREÇO VAREJO (R$)
                  <input
                    aria-label="Preço de venda"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="Ex.: 89,90 — deixe vazio para sob consulta"
                  />
                </label>
                <label>PREÇO REVENDA (R$)<input aria-label="Preço de revenda" inputMode="decimal" value={form.resalePrice} onChange={e => setForm({ ...form, resalePrice: e.target.value })} placeholder="Vazio = clique para negociar" /><small>Visível somente para parceiros ativos.</small></label>
                <label>PREÇO CONSIGNAÇÃO (R$)<input aria-label="Preço de consignação" inputMode="decimal" value={form.consignmentPrice} onChange={e => setForm({ ...form, consignmentPrice: e.target.value })} placeholder="Vazio = clique para negociar" /><small>Visível somente para parceiros ativos.</small></label>
                <label>
                  MATERIAL
                  <input
                    aria-label="Material do produto"
                    value={form.material}
                    onChange={(e) =>
                      setForm({ ...form, material: e.target.value })
                    }
                    placeholder="Ex.: PLA biodegradável"
                  />
                </label>
                <label>
                  DIMENSÕES
                  <input
                    aria-label="Dimensões do produto"
                    value={form.dimensions}
                    onChange={(e) =>
                      setForm({ ...form, dimensions: e.target.value })
                    }
                    placeholder="Ex.: 15 × 12 × 20 cm"
                  />
                </label>
                <div className="admin-photos">
                  <span>FOTOS DO PRODUTO (ATÉ 6)</span>
                  <div className="photo-tiles">
                    {form.imageUrls.map((url, i) => (
                      <div className="photo-tile" key={form.images[i]}>
                        <img src={url} alt={`Foto ${i + 1}`} />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              images: form.images.filter((_, n) => n !== i),
                              imageUrls: form.imageUrls.filter(
                                (_, n) => n !== i,
                              ),
                            })
                          }
                          aria-label="Remover foto"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 6 && (
                      <label className="upload-tile">
                        <ImagePlus size={26} />
                        <span>
                          {uploading ? "ENVIANDO..." : "ADICIONAR FOTO"}
                        </span>
                        <input
                          aria-label="Adicionar fotos do produto"
                          hidden
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          disabled={uploading}
                          onChange={(e) => {
                            upload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="editor-toggles">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      aria-label="Disponibilidade do produto"
                      checked={form.available}
                      onChange={(e) =>
                        setForm({ ...form, available: e.target.checked })
                      }
                    />
                    <span>
                      DISPONÍVEL PARA PEDIDO
                      <small>O cliente poderá solicitar esta peça.</small>
                    </span>
                  </label>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      aria-label="Publicação do produto"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({ ...form, published: e.target.checked })
                      }
                    />
                    <span>
                      PUBLICAR NO CATÁLOGO
                      <small>O produto aparecerá no site para todos.</small>
                    </span>
                  </label>
                </div>
              </div>
              <div className="editor-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setForm(null)}
                >
                  CANCELAR
                </button>
                <button
                  className="button-orange"
                  type="submit"
                  disabled={save.isPending || uploading}
                >
                  <Save size={18} />
                  {save.isPending ? "SALVANDO..." : "SALVAR PRODUTO"}
                </button>
              </div>
            </form>
          </section>
        )}
        <section className="admin-list">
          <div className="admin-section-title">
            <h2>SEUS PRODUTOS</h2>
            <span>
              {String(products.data?.length ?? 0).padStart(2, "0")} ITENS
            </span>
          </div>
          {products.data?.length ? (
            <div className="admin-table">
              {products.data.map((item) => (
                <div className="admin-row" key={item.id}>
                  <div className="admin-thumb">
                    {item.imageUrls[0] ? (
                      <img src={item.imageUrls[0]} alt="" />
                    ) : (
                      <Box size={24} />
                    )}
                  </div>
                  <div className="admin-product-name">
                    <strong>{item.name}</strong>
                    <span>
                      {item.category} ·{" "}
                      {item.priceCents === null
                        ? "Sob consulta"
                        : (item.priceCents / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                    </span>
                  </div>
                  <span className={item.published ? "pill published" : "pill"}>
                    {item.published ? "PUBLICADO" : "RASCUNHO"}
                  </span>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => edit(item)}
                      aria-label={`Editar ${item.name}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => del(item.id)}
                      disabled={remove.isPending}
                      aria-label={`Excluir ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <Box size={38} />
              <h3>O CATÁLOGO AINDA ESTÁ VAZIO.</h3>
              <p>Cadastre seu primeiro produto para começar.</p>
            </div>
          )}
        </section>
        <section className="admin-settings">
          <div>
            <span className="overline blue">CONFIGURAÇÕES / NEGOCIAÇÃO</span>
            <h2>QUANTIDADE DE VOLUME</h2>
            <p>A quantidade é salva imediatamente. O WhatsApp agora fica em Site e conteúdo → WhatsApp, com rascunho e publicação.</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveSettings.mutateAsync({
                  negotiationQuantity: quantity,
                });
                setNotice("Quantidade atualizada.");
              } catch {
                setNotice("Informe uma quantidade entre 1 e 10000.");
              }
            }}
          >
            <label>QUANTIDADE PARA NEGOCIAR<input aria-label="Quantidade para negociar" type="number" min={1} max={10000} required value={quantity} onChange={e => setQuantity(Number(e.target.value))} /><small>Chamada “{quantity}+ unidades?” nas condições de parceiro.</small></label>
            <button
              type="submit"
              className="outline-button"
              disabled={saveSettings.isPending}
            >
              {saveSettings.isPending ? "SALVANDO..." : "SALVAR QUANTIDADE"}
            </button>
          </form>
        </section>
        </>}
      </main>
    </div>
  );
}

function AdminAccess() {
  const { data: session, isPending } = authClient.useSession();
  const access = useAccess();
  useEffect(() => {
    if (session && access.data && access.data.role !== "admin") window.location.replace("/#catalogo");
  }, [session, access.data]);
  if (isPending)
    return (
      <div className="admin-loading">
        VERIFICANDO ACESSO<span className="blink">_</span>
      </div>
    );
  if (!session) return <Login />;
  if (access.isPending) return <div className="admin-loading">VERIFICANDO PERMISSÕES…</div>;
  if (access.isError) return <div className="admin-loading">Não foi possível verificar seu acesso. <a href="/">Voltar ao site</a></div>;
  return access.data?.role === "admin" ? <Dashboard /> : <div className="admin-loading">VOLTANDO AO CATÁLOGO…</div>;
}

export default function Admin() { return <AdminAppearance><AdminAccess /></AdminAppearance>; }
