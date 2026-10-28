import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database";
import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { partners, user } from "./database/schema";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, disableSignUp: true },
  session: { cookieCache: { enabled: false } },
  databaseHooks: {
    session: { create: { before: async (session) => {
      const [owner] = await db.select({ email: user.email }).from(user).where(eq(user.id, session.userId));
      if (owner?.email.toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase()) return { data: session };
      const [partner] = await db.select({ active: partners.active }).from(partners).where(eq(partners.userId, session.userId));
      if (!partner?.active) throw new APIError("FORBIDDEN", { message: "Acesso de parceiro indisponível. Fale com a Anjos3D." });
      return { data: session };
    } } },
  },
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : [];
  },
});