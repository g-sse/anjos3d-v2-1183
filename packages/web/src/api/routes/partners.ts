import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { hashPassword } from "better-auth/crypto";
import { base } from "../__core/app";
import { adminOnly } from "../middleware/admin";
import { resolveAccess } from "../middleware/partner";
import { db } from "../database";
import { account, partners as partnerTable, session, user } from "../database/schema";

const password = z.string().min(8, "Use pelo menos 8 caracteres.").max(128);
export const partners = {
  access: base.handler(async ({ context }) => {
    const access = await resolveAccess(context.headers);
    return { role: access.role, name: access.user?.name ?? null };
  }),
  list: adminOnly.handler(() => db.select({ userId: partnerTable.userId, name: user.name, email: user.email, active: partnerTable.active, createdAt: partnerTable.createdAt }).from(partnerTable).innerJoin(user, eq(user.id, partnerTable.userId)).orderBy(desc(partnerTable.createdAt))),
  create: adminOnly.input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password, active: z.boolean().default(true) })).handler(async ({ input }) => {
    const email = input.email.toLowerCase();
    if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) throw new ORPCError("CONFLICT", { message: "O administrador não pode ser cadastrado como parceiro." });
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
    if (existing) throw new ORPCError("CONFLICT", { message: "Este e-mail já possui um acesso." });
    const id = crypto.randomUUID();
    const encoded = await hashPassword(input.password);
    await db.transaction(async tx => {
      await tx.insert(user).values({ id, name: input.name, email, emailVerified: false, createdAt: new Date(), updatedAt: new Date() });
      await tx.insert(account).values({ id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password: encoded, createdAt: new Date(), updatedAt: new Date() });
      await tx.insert(partnerTable).values({ userId: id, active: input.active });
    });
    return { userId: id };
  }),
  setActive: adminOnly.input(z.object({ userId: z.string(), active: z.boolean() })).handler(async ({ input }) => {
    await db.transaction(async tx => {
      const changed = await tx.update(partnerTable).set({ active: input.active }).where(eq(partnerTable.userId, input.userId)).returning({ id: partnerTable.userId });
      if (!changed.length) throw new ORPCError("NOT_FOUND");
      // Revoke existing sessions on both block and reactivation: a fresh login is required.
      await tx.delete(session).where(eq(session.userId, input.userId));
    });
    return true;
  }),
  resetPassword: adminOnly.input(z.object({ userId: z.string(), password })).handler(async ({ input }) => {
    const encoded = await hashPassword(input.password);
    await db.transaction(async tx => {
      const [partner] = await tx.select({ id: partnerTable.userId }).from(partnerTable).where(eq(partnerTable.userId, input.userId));
      if (!partner) throw new ORPCError("NOT_FOUND");
      const changed = await tx.update(account).set({ password: encoded, updatedAt: new Date() }).where(and(eq(account.userId, input.userId), eq(account.providerId, "credential"))).returning({ id: account.id });
      if (!changed.length) throw new ORPCError("NOT_FOUND");
      await tx.delete(session).where(eq(session.userId, input.userId));
    });
    return true;
  }),
};