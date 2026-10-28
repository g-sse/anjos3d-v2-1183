import { eq } from "drizzle-orm";
import { db } from "../database";
import { cmsState, cmsVersions, siteSettings } from "../database/schema";
import { defaultDocument, siteDocumentSchema } from "../../shared/site-content";

export async function getCmsState() {
  const [existing] = await db.select().from(cmsState).where(eq(cmsState.id, 1));
  if (existing) return existing;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  const document = JSON.stringify({ ...defaultDocument, whatsapp: settings?.whatsapp || "" });
  await db.transaction(async tx => {
    const inserted = await tx.insert(cmsState).values({ id: 1, draft: document, published: document }).onConflictDoNothing().returning();
    if (inserted.length) await tx.insert(cmsVersions).values({ document, label: "Conteúdo original — ponto de partida" });
  });
  const [state] = await db.select().from(cmsState).where(eq(cmsState.id, 1));
  if (!state) throw new Error("Não foi possível inicializar o editor.");
  return state;
}

export async function getPublishedDocument() {
  return siteDocumentSchema.parse(JSON.parse((await getCmsState()).published));
}