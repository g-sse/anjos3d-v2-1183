import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";
import { db } from "../database";
import { partners } from "../database/schema";

export async function resolveAccess(headers: Headers) {
  const result = await auth.api.getSession({ headers });
  if (!result) return { role: "anonymous" as const, user: null };
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && result.user.email.toLowerCase() === adminEmail) return { role: "admin" as const, user: result.user };
  const [partner] = await db.select({ active: partners.active }).from(partners).where(eq(partners.userId, result.user.id));
  return partner?.active ? { role: "partner" as const, user: result.user } : { role: "anonymous" as const, user: null };
}

export const partnerOnly = base.use(async ({ context, next }) => {
  const access = await resolveAccess(context.headers);
  if (access.role === "anonymous") throw new ORPCError("UNAUTHORIZED", { message: "Entre com um acesso de parceiro ativo." });
  return next({ context: { user: access.user!, role: access.role } });
});