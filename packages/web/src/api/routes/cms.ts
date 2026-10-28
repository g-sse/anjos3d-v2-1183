import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { adminOnly } from "../middleware/admin";
import { db } from "../database";
import { cmsState, cmsVersions } from "../database/schema";
import { getCmsState, getPublishedDocument } from "../lib/cms-store";
import { siteDocumentSchema, publishDocumentSchema } from "../../shared/site-content";

const revision = z.number().int().nonnegative();
const conflict = () => new ORPCError("CONFLICT", { message: "O rascunho mudou em outra aba. Recarregue o editor antes de continuar; suas alterações locais não foram publicadas." });

export const cms = {
  published: base.handler(getPublishedDocument),
  editor: adminOnly.handler(async () => {
    const state = await getCmsState();
    const versions = await db.select({ id: cmsVersions.id, label: cmsVersions.label, createdAt: cmsVersions.createdAt }).from(cmsVersions).orderBy(desc(cmsVersions.id)).limit(20);
    return { draft: siteDocumentSchema.parse(JSON.parse(state.draft)), draftRevision: state.draftRevision, publishedRevision: state.publishedRevision, hasChanges: state.draft !== state.published, updatedAt: state.updatedAt, publishedAt: state.publishedAt, versions };
  }),
  preview: adminOnly.handler(async () => siteDocumentSchema.parse(JSON.parse((await getCmsState()).draft))),
  saveDraft: adminOnly.input(z.object({ document: siteDocumentSchema, expectedRevision: revision }).strict()).handler(async ({ input }) => {
    await getCmsState();
    const [saved] = await db.update(cmsState).set({ draft: JSON.stringify(input.document), draftRevision: input.expectedRevision + 1, updatedAt: new Date() }).where(and(eq(cmsState.id, 1), eq(cmsState.draftRevision, input.expectedRevision))).returning({ revision: cmsState.draftRevision });
    if (!saved) throw conflict();
    return saved;
  }),
  publish: adminOnly.input(z.object({ expectedRevision: revision, expectedPublishedRevision: revision }).strict()).handler(async ({ input }) => {
    await getCmsState();
    return db.transaction(async tx => {
      const [state] = await tx.select().from(cmsState).where(eq(cmsState.id, 1));
      if (!state || state.draftRevision !== input.expectedRevision || state.publishedRevision !== input.expectedPublishedRevision) throw conflict();
      const validation = publishDocumentSchema.safeParse(JSON.parse(state.draft));
      if (!validation.success) throw new ORPCError("BAD_REQUEST", { message: validation.error.issues.map(issue => issue.message).join(" ") });
      if (state.draft === state.published) throw new ORPCError("BAD_REQUEST", { message: "Não há alterações para publicar." });
      const [saved] = await tx.update(cmsState).set({ published: state.draft, publishedRevision: state.publishedRevision + 1, publishedAt: new Date() }).where(and(eq(cmsState.id, 1), eq(cmsState.draftRevision, input.expectedRevision), eq(cmsState.publishedRevision, input.expectedPublishedRevision))).returning();
      if (!saved) throw conflict();
      await tx.insert(cmsVersions).values({ document: state.draft, label: `Publicação ${saved.publishedRevision}` });
      return { publishedRevision: saved.publishedRevision };
    });
  }),
  restore: adminOnly.input(z.object({ id: z.number().int().positive(), expectedRevision: revision }).strict()).handler(async ({ input }) => {
    const [version] = await db.select().from(cmsVersions).where(eq(cmsVersions.id, input.id));
    if (!version) throw new ORPCError("NOT_FOUND");
    siteDocumentSchema.parse(JSON.parse(version.document));
    const [saved] = await db.update(cmsState).set({ draft: version.document, draftRevision: input.expectedRevision + 1, updatedAt: new Date() }).where(and(eq(cmsState.id, 1), eq(cmsState.draftRevision, input.expectedRevision))).returning({ revision: cmsState.draftRevision });
    if (!saved) throw conflict();
    return saved;
  }),
};