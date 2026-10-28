import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Menu,
  X,
  MoveUpRight,
  Box,
  Layers3,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import { usePublicProducts, useSiteSettings } from "../queries/catalog";
import { ScrollHero } from "../components/scroll-hero";
import { ProductConditions } from "../components/product-conditions";
import { useAccess, useLogout, usePartnerPrices } from "../queries/partners";
import { usePublishedContent } from "../queries/cms";
import { SiteContentProvider, TextLines, useSiteContent } from "../components/site-content";
import { fillText } from "../../shared/site-content";
import type { SiteDocument } from "../../shared/site-content";
import { readPublishedCache, cachePublishedContent } from "../lib/published-content-cache";
import "../public-site.css";
import "../public-palette-logo.css";
import { usePublicPalette } from "../hooks/use-public-palette";
import type { PublicPalette } from "../hooks/use-public-palette";

type Product = NonNullable<
  ReturnType<typeof usePublicProducts>["data"]
>[number];
const money = (cents: number | null) =>
  cents === null
    ? "Sob consulta"
    : (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
const waLink = (number: string, text: string) =>
  number
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : "#contato";

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function PaletteToggle({ palette, onToggle }: { palette: PublicPalette; onToggle: () => void }) {
  const label = palette === "logo" ? "Mudar para as cores anteriores" : "Mudar para as cores da logo";
  return (
    <button type="button" className="palette-toggle" data-next={palette === "logo" ? "original" : "logo"} onClick={onToggle} aria-label={label} title={label}>
      <Palette size={15} aria-hidden="true" />
      <span className="palette-swatch" aria-hidden="true" />
    </button>
  );
}

function Header({ palette, onTogglePalette }: { palette: PublicPalette; onTogglePalette: () => void }) {
  const [menu, setMenu] = useState(false);
  const { texts: t, sections } = useSiteContent();
  const visible = (id: string) => sections.some(section => section.id === id && section.enabled);
  return (
    <header className="site-header">
      <a href="#inicio" className="brand">
        <img src={t.brandImage} alt={t.brandAlt} />
        <span>
          {t.brandName}<span>{t.brandSuffix}</span>
          <small>{t.brandTagline}</small>
        </span>
      </a>
      <div className="header-end">
      <nav className={menu ? "nav-open" : ""} aria-label="Navegação principal">
        {visible("processo") && <a href="#processo" onClick={() => setMenu(false)}>{t.navProcess}</a>}
        {visible("possibilidades") && <a href="#possibilidades" onClick={() => setMenu(false)}>{t.navPossibilities}</a>}
        {visible("catalogo") && <a href="#catalogo" onClick={() => setMenu(false)}>{t.navCatalog}</a>}
        <a href="/entrar" onClick={() => setMenu(false)}>{t.navPartners}</a>
        <a
          className="nav-contact"
          href="#contato"
          onClick={() => setMenu(false)}
        >
          {t.navContact} <ArrowUpRight size={16} />
        </a>
      </nav>
      <PaletteToggle palette={palette} onToggle={onTogglePalette} />
      <button
        className="menu-toggle"
        onClick={() => setMenu(!menu)}
        aria-label={menu ? "Fechar menu" : "Abrir menu"}
      >
        {menu ? <X /> : <Menu />}
      </button>
      </div>
    </header>
  );
}

function Process() {
  const { texts: t } = useSiteContent();
  return (
    <section className="process-section section-shell" id="processo">
      <div className="section-topline">
        <span>{t.processLabel}</span>
        <span>{t.processNote}</span>
      </div>
      <Reveal className="process-heading">
        <h2>
          {t.processTitle1}
          <br />
          {t.processTitle2} <em>{t.processTitle3}</em>
        </h2>
        <p>
          <TextLines text={t.processDescription} />
        </p>
      </Reveal>
      <Reveal className="process-visual">
        <img
          src={t.processImage}
          alt={t.processAlt}
          loading="lazy"
        />
        <div className="process-photo-label">
          <ScanLine size={18} /> {t.processCaption}{" "}
          <span>{t.processFigure}</span>
        </div>
      </Reveal>
      <div className="steps">
        <Reveal>
          <span>01 /</span>
          <h3>{t.step1Title}</h3>
          <p>
            <TextLines text={t.step1Text} />
          </p>
        </Reveal>
        <Reveal delay={0.09}>
          <span>02 /</span>
          <h3>{t.step2Title}</h3>
          <p>
            <TextLines text={t.step2Text} />
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <span>03 /</span>
          <h3>{t.step3Title}</h3>
          <p>
            <TextLines text={t.step3Text} />
          </p>
        </Reveal>
      </div>
      <Reveal className="process-closing">
        <p>{t.processClosing1}</p>
        <p>{t.processClosing2}</p>
      </Reveal>
    </section>
  );
}

function Possibilities() {
  const { texts: t } = useSiteContent();
  return (
    <section className="possibilities" id="possibilidades">
      <div className="section-shell">
        <div className="section-topline">
          <span>{t.possibilitiesLabel}</span>
          <span>{t.possibilitiesNote}</span>
        </div>
        <Reveal className="possibility-intro">
          <h2>
            {t.possibilitiesTitle1}
            <br />
            {t.possibilitiesTitle2} <em>{t.possibilitiesTitle3}</em>
          </h2>
          <p className="possibility-story">{t.possibilitiesStory}</p>
        </Reveal>
        <Reveal className="possibility-grid">
          <div className="possibility-main">
            <img
              src={t.possibilitiesImage}
              alt={t.possibilitiesAlt}
              loading="lazy"
            />
            <div className="possibility-caption">
              <span>{t.possibilitiesCaption}</span>
              <h3>
                {t.possibilitiesHeading1}
                <br />
                <em>{t.possibilitiesHeading2}</em>
              </h3>
              <p>
                <TextLines text={t.possibilitiesText} />
              </p>
            </div>
          </div>
          <div className="possibility-side">
            <span className="possibility-note">{t.possibilitiesSideNote}</span>
            <div className="possibility-side-content">
              <p>
                <TextLines text={t.possibilitiesSideText} />
              </p>
              <a href={t.possibilitiesLink} className="text-link">
                {t.possibilitiesButton} <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Catalog() {
  const { texts: t, whatsapp } = useSiteContent();
  const products = usePublicProducts();
  const settings = useSiteSettings();
  const access = useAccess();
  const partner = access.data?.role === "partner" || access.data?.role === "admin";
  const prices = usePartnerPrices(partner);
  const logout = useLogout();
  const [active, setActive] = useState("Todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);
  const categories = [
    "Todos",
    ...new Set((products.data ?? []).map((p) => p.category)),
  ];
  const filtered = (products.data ?? []).filter(
    (p) => active === "Todos" || p.category === active,
  );
  const number = whatsapp;
  const conditions = (item: Product) => {
    const protectedPrice = partner && !prices.isError ? prices.data?.find(row => row.id === item.id) : undefined;
    return <ProductConditions name={item.name} priceCents={item.priceCents} resalePriceCents={protectedPrice?.resalePriceCents} consignmentPriceCents={protectedPrice?.consignmentPriceCents} partner={partner} loading={prices.isLoading} error={prices.isError} whatsapp={number} quantity={settings.data?.negotiationQuantity ?? 5} />;
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLDialogElement>(".product-modal");
    dialog?.querySelector<HTMLButtonElement>(".modal-close")?.focus();
    const onDialogKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && selected.imageUrls.length > 1) setPhoto(value => (value + 1) % selected.imageUrls.length);
      if (event.key === "ArrowLeft" && selected.imageUrls.length > 1) setPhoto(value => (value + selected.imageUrls.length - 1) % selected.imageUrls.length);
      if (event.key !== "Tab" || !dialog) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>("button, a[href]")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onDialogKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onDialogKey); previousFocus?.focus(); };
  }, [selected]);
  return (
    <section className="catalog-section section-shell" id="catalogo">
      <div className="section-topline">
        <span>{t.catalogLabel}</span>
        <span>{t.catalogNote}</span>
      </div>
      <Reveal className="catalog-heading">
        <div>
          <h2>
            {t.catalogTitle1}<br />
            <em>{t.catalogTitle2}</em>
          </h2>
        </div>
        <p>
          <TextLines text={t.catalogDescription} />
        </p>
      </Reveal>
      <div className="catalog-access">
        {partner ? <><span>{fillText(t.partnerGreeting, { nome: access.data?.name ?? "" })}</span><button onClick={() => logout.mutate()} disabled={logout.isPending}>{logout.isPending ? "Saindo…" : "Sair"}</button></> : <a href="/entrar">{t.partnerInvitation} <ArrowUpRight size={14} /></a>}
        {logout.isError && <span>Não foi possível sair. Tente novamente.</span>}
      </div>
      {products.isLoading ? (
        <div className="catalog-state">
          CARREGANDO O CATÁLOGO<span className="blink">_</span>
        </div>
      ) : products.isError ? (
        <div className="catalog-state">
          Não foi possível carregar o catálogo agora.
        </div>
      ) : products.data?.length ? (
        <>
          <div className="catalog-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={active === cat ? "active" : ""}
                onClick={() => setActive(cat)}
              >
                {cat === "Todos" ? t.catalogAll.toUpperCase() : cat.toUpperCase()}
              </button>
            ))}
            <span>{String(filtered.length).padStart(2, "0")} {t.catalogCount}</span>
          </div>
          <div className="product-grid">
            {filtered.map((item, i) => (
              <article
                key={item.id}
                className="product-card"
              >
                <button className="product-image product-photo-button" onClick={() => { setSelected(item); setPhoto(0); }} aria-label={`Ver fotos de ${item.name}`}>
                  {item.imageUrls[0] ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <Box size={44} />
                      <span>{t.brandName}{t.brandSuffix}</span>
                    </div>
                  )}
                  <span className="product-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </button>
                <div className="product-data">
                  <span>
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {item.category.toUpperCase()}
                  </span>
                  <h3>{item.name}</h3>
                  <p>{item.priceCents === null ? t.catalogConsult : money(item.priceCents)}</p>
                </div>
                <button className="conditions-toggle" onClick={() => setExpanded(expanded === item.id ? null : item.id)} aria-expanded={expanded === item.id} aria-controls={`conditions-${item.id}`}>{expanded === item.id ? t.catalogCollapse : t.catalogExpand} <span aria-hidden="true">{expanded === item.id ? "−" : "+"}</span></button>
                {expanded === item.id && <div id={`conditions-${item.id}`} className="inline-product-details"><p>{item.description}</p>{item.material && <p><strong>{t.catalogMaterial}</strong> {item.material}</p>}{item.dimensions && <p><strong>{t.catalogDimensions}</strong> {item.dimensions}</p>}{conditions(item)}</div>}
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="catalog-empty">
          <div className="empty-cross" aria-hidden="true"><Box strokeWidth={0.7} /><span><TextLines text={t.emptyImageText} /></span></div>
          <div>
            <span className="overline blue">{t.emptyNote}</span>
            <h3>
              <TextLines text={t.emptyTitle} />
            </h3>
            <p>
              <TextLines text={t.emptyText} />
            </p>
            <a
              href={waLink(
                number,
                t.emptyMessage,
              )}
              className="button-orange"
              target={number ? "_blank" : undefined}
              rel="noreferrer"
            >
              {t.emptyButton} <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      )}
      <p className="catalog-closing">{t.catalogClosing}</p>
      {selected && (
        <div className="modal-backdrop">
          <button
            className="modal-overlay-close"
            onClick={() => setSelected(null)}
            aria-label="Fechar detalhes do produto"
          />
          <dialog
            open
            className="product-modal"
            aria-modal="true"
            aria-label={selected.name}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Fechar detalhes"
            >
              <X />
            </button>
            <div className="modal-photo">
              {selected.imageUrls[0] ? (
                <img src={selected.imageUrls[photo]} alt={`${selected.name} — foto ${photo + 1}`} />
              ) : (
                <Box size={64} />
              )}
              {selected.imageUrls.length > 1 && <div className="gallery-controls"><button onClick={() => setPhoto((photo + selected.imageUrls.length - 1) % selected.imageUrls.length)} aria-label="Foto anterior"><ChevronLeft size={18} /></button><span>{photo + 1} / {selected.imageUrls.length}</span><button onClick={() => setPhoto((photo + 1) % selected.imageUrls.length)} aria-label="Próxima foto"><ChevronRight size={18} /></button></div>}
            </div>
            <div className="modal-info">
              <span className="overline blue">
                {selected.category.toUpperCase()} / {t.brandName}{t.brandSuffix}
              </span>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
              {selected.material && (
                <div className="spec">
                  <span>{t.catalogMaterial}</span>
                  <strong>{selected.material}</strong>
                </div>
              )}
              {selected.dimensions && (
                <div className="spec">
                  <span>{t.catalogDimensions}</span>
                  <strong>{selected.dimensions}</strong>
                </div>
              )}
              <div className="spec">
                <span>{t.catalogValue}</span>
                <strong>{selected.priceCents === null ? t.catalogConsult : money(selected.priceCents)}</strong>
              </div>
              {conditions(selected)}
              <a
                className="button-orange"
                href={waLink(
                  number,
                  fillText(t.productMessage, { produto: selected.name, acao: selected.available ? t.productAvailableAction : t.productUnavailableAction }),
                )}
                target={number ? "_blank" : undefined}
                rel="noreferrer"
              >
                {selected.available
                  ? t.catalogBuy
                  : t.catalogAvailability}{" "}
                <ArrowUpRight size={18} />
              </a>
            </div>
          </dialog>
        </div>
      )}
    </section>
  );
}

function Contact() {
  const { texts: t, whatsapp: number } = useSiteContent();
  return (
    <footer className="contact-section" id="contato">
      <div className="section-shell">
        <div className="section-topline">
          <span>{t.contactLabel}</span>
          <span>{t.contactNote}</span>
        </div>
        <Reveal className="contact-content">
          <h2>
            {t.contactTitle1}
            <br />
            <em>{t.contactTitle2}</em>
            <br />
            {t.contactTitle3}<span>{t.contactPunctuation}</span>
          </h2>
          <div className="contact-aside">
            <p className="contact-story">{t.contactStory}</p>
            <p>
              <TextLines text={t.contactText} />
            </p>
            <a
              href={waLink(
                number,
                t.contactMessage,
              )}
              target={number ? "_blank" : undefined}
              rel="noreferrer"
              className="button-orange"
            >
              {t.contactButton} <MoveUpRight size={20} />
            </a>
          </div>
        </Reveal>
        <div className="footer-bottom">
          <div className="brand footer-brand">
            <img src={t.brandImage} alt={t.brandAlt} />
            <span>
              {t.brandName}<span>{t.brandSuffix}</span>
              <small>{t.brandTagline}</small>
            </span>
          </div>
          <span>{t.footerStory}</span>
          <div>
            <a href="#inicio">{t.footerTop}</a>
            <a href="/admin">{t.footerAdmin}</a>
          </div>
          <span>{t.footerCopyright}</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicSite({ document }: { document: SiteDocument }) {
  const { palette, toggle } = usePublicPalette();
  const sections = { intro: <div className="intro-band" id="intro"><span>{document.texts.intro1}</span><Layers3 size={26} /><span>{document.texts.intro2}</span><Layers3 size={26} /><span>{document.texts.intro3}</span></div>, processo: <Process />, possibilidades: <Possibilities />, catalogo: <Catalog /> };
  return (
    <SiteContentProvider document={document}>
    <div className="public-site" data-palette={palette}>
      <Header palette={palette} onTogglePalette={toggle} />
      <main>
        <ScrollHero />
        {document.sections.filter(section => section.enabled).map(section => <div className="cms-public-section" key={section.id}>{sections[section.id]}</div>)}
      </main>
      <Contact />
    </div>
    </SiteContentProvider>
  );
}

export default function Index() {
  const content = usePublishedContent();
  const [cached] = useState(readPublishedCache);
  useEffect(() => { if (content.data) cachePublishedContent(content.data); }, [content.data]);
  const document = content.data ?? cached;
  if (content.isPending && !document) return <div className="cms-preview-notice">Carregando Anjos3D…</div>;
  if (!document) return <div className="cms-preview-notice" role="alert">Não foi possível carregar o site. <button onClick={() => content.refetch()}>Tentar novamente</button></div>;
  return <>{content.isError && <div className="cms-public-warning" role="alert">Não foi possível atualizar o conteúdo. Exibindo a última versão pública carregada. <button onClick={() => content.refetch()}>Tentar novamente</button></div>}<PublicSite document={document} /></>;
}
