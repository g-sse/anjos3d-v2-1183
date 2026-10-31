import { z } from "zod";
import { httpsUrl, imageSource, optionalImage, safeLink } from "./validators";

/** Paths the app or server already owns. Pages and redirects can never take them. */
export const reservedSlugs = ["admin", "entrar", "api", "images", "fonts", "videos", "assets", "media", "sitemap.xml", "robots.txt", "favicon.ico", "og-image.png", "runable.js", "index", "index.html", "404", "preview", "login", "rascunho"];
export const slugSchema = z.string().max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens (ex.: sobre-nos).").refine(slug => !reservedSlugs.includes(slug), "Este endereço é reservado pelo site. Escolha outro.");
const id = z.string().regex(/^[a-z0-9-]{4,40}$/);
const text = (max: number) => z.string().max(max);

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("heading"), text: text(200) }).strict(),
  z.object({ id, type: z.literal("text"), text: text(8000) }).strict(),
  z.object({ id, type: z.literal("image"), src: imageSource, alt: text(300), caption: text(300) }).strict(),
  z.object({ id, type: z.literal("faq"), items: z.array(z.object({ question: text(300), answer: text(4000) }).strict()).max(30) }).strict(),
  z.object({ id, type: z.literal("cta"), title: text(200), text: text(1000), label: text(60), href: safeLink }).strict(),
]);
export type PageBlock = z.infer<typeof blockSchema>;
export const blockLabels: Record<PageBlock["type"], string> = { heading: "Título", text: "Texto", image: "Imagem", faq: "Perguntas e respostas", cta: "Chamada para ação" };

export const pageSeoSchema = z.object({
  title: text(120).default(""),
  description: text(320).default(""),
  shareImage: optionalImage.default(""),
  index: z.boolean().default(true),
}).strict();

export const pageSchema = z.object({
  id,
  slug: slugSchema,
  title: z.string().trim().min(1, "Toda página precisa de um título.").max(120),
  visible: z.boolean(),
  inMenu: z.boolean(),
  inFooter: z.boolean(),
  menuLabel: text(40),
  blocks: z.array(blockSchema).max(40),
  seo: pageSeoSchema.prefault({}),
}).strict();
export type SitePage = z.infer<typeof pageSchema>;

export const seoSchema = z.object({
  siteUrl: z.string().max(200).refine(value => value === "" || /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(:\d+)?$/i.test(value), "Use o endereço principal sem barra final, ex.: https://anjos3d.com.br").default(""),
  siteName: text(80).default("Anjos3D"),
  homeTitle: text(120).default("Anjos3D — Ideias ganham forma aqui"),
  homeDescription: text(320).default("Anjos3D: ideias ganham forma aqui. Descubra peças impressas em 3D e conte sua ideia para criar algo único."),
  shareImage: optionalImage.default("/images/share-anjos3d.jpg"),
  indexSite: z.boolean().default(true),
  gaId: z.string().max(20).refine(value => value === "" || /^G-[A-Z0-9]{4,15}$/.test(value), "O ID do GA4 tem o formato G-XXXXXXXXXX.").default(""),
  gscToken: z.string().max(120).refine(value => value === "" || /^[A-Za-z0-9_-]{20,100}$/.test(value), "Cole apenas o valor de content da tag do Search Console.").default(""),
}).strict();
export type SiteSeo = z.infer<typeof seoSchema>;

const social = httpsUrl.default("");
export const companySchema = z.object({
  tradeName: text(120).default(""),
  legalName: text(160).default(""),
  taxId: z.string().max(20).refine(value => value === "" || /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(value), "CNPJ no formato 00.000.000/0000-00.").default(""),
  email: z.string().max(160).refine(value => value === "" || /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value), "E-mail inválido.").default(""),
  phone: text(30).default(""),
  address: text(240).default(""),
  city: text(80).default(""),
  region: text(40).default(""),
  instagram: social,
  facebook: social,
  tiktok: social,
  youtube: social,
  linkedin: social,
}).strict();
export type SiteCompany = z.infer<typeof companySchema>;
export const socialLabels = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn" } as const;

export const redirectSchema = z.object({
  from: z.string().max(200).regex(/^\/(?!\/)[\w\-/.%]*$/, "O endereço antigo começa com / (ex.: /produtos-antigos)."),
  to: safeLink,
}).strict();

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const normalizePath = (path: string) => (path.replace(/\/+$/, "") || "/").toLowerCase();
