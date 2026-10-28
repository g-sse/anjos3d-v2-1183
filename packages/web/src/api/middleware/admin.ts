import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";

export const adminOnly = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!session || !allowedEmail || session.user.email.toLowerCase() !== allowedEmail) {
    throw new ORPCError("UNAUTHORIZED", { message: "Acesso restrito ao administrador." });
  }
  return next({ context: { user: session.user } });
});