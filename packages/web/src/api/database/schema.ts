import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */
export * from "./auth-schema";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("Objetos"),
  priceCents: integer("price_cents"),
  resalePriceCents: integer("resale_price_cents"),
  consignmentPriceCents: integer("consignment_price_cents"),
  material: text("material").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  images: text("images").notNull().default("[]"),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  whatsapp: text("whatsapp").notNull().default(""),
  negotiationQuantity: integer("negotiation_quantity").notNull().default(5),
});

export const partners = sqliteTable("partners", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const cmsState = sqliteTable("cms_state", {
  id: integer("id").primaryKey(),
  draft: text("draft").notNull(),
  published: text("published").notNull(),
  draftRevision: integer("draft_revision").notNull().default(0),
  publishedRevision: integer("published_revision").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const cmsVersions = sqliteTable("cms_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  document: text("document").notNull(),
  label: text("label").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
