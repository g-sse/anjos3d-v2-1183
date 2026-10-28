import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { base } from "../__core/app";
import { adminOnly } from "../middleware/admin";
import { partnerOnly } from "../middleware/partner";
import { db } from "../database";
import { products, siteSettings } from "../database/schema";
import { getPublishedDocument } from "../lib/cms-store";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});
const bucket = process.env.S3_BUCKET!;
const productInput = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(4000).default(""),
  category: z.string().trim().min(1).max(80),
  priceCents: z.number().int().positive().nullable(),
  resalePriceCents: z.number().int().positive().nullable(),
  consignmentPriceCents: z.number().int().positive().nullable(),
  material: z.string().max(100).default(""),
  dimensions: z.string().max(100).default(""),
  images: z.array(z.string().regex(/^products\/[\w.-]+$/)).max(6),
  available: z.boolean(),
  published: z.boolean(),
});

async function decorate<T extends { images: string }>(rows: T[]) {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      imageUrls: await Promise.all(
        (JSON.parse(row.images) as string[]).map((key) =>
          getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), {
            expiresIn: 3600,
          }),
        ),
      ),
    })),
  );
}

export const catalog = {
  publicList: base.handler(async () => {
    const rows = await db
      .select({ id: products.id, name: products.name, description: products.description, category: products.category, priceCents: products.priceCents, material: products.material, dimensions: products.dimensions, images: products.images, available: products.available })
      .from(products)
      .where(eq(products.published, true))
      .orderBy(desc(products.createdAt));
    return decorate(rows);
  }),
  partnerPrices: partnerOnly.handler(() => db.select({ id: products.id, resalePriceCents: products.resalePriceCents, consignmentPriceCents: products.consignmentPriceCents }).from(products).where(eq(products.published, true))),
  settings: base.handler(async () => {
    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1));
    return { whatsapp: (await getPublishedDocument()).whatsapp, negotiationQuantity: settings?.negotiationQuantity ?? 5 };
  }),
  adminList: adminOnly.handler(async () => {
    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
    return decorate(rows);
  }),
  save: adminOnly
    .input(productInput.extend({ id: z.number().int().optional() }))
    .handler(async ({ input }) => {
      const { id, images, ...data } = input;
      if (id) {
        const [saved] = await db
          .update(products)
          .set({ ...data, images: JSON.stringify(images) })
          .where(eq(products.id, id))
          .returning();
        if (!saved) throw new ORPCError("NOT_FOUND");
        return saved.id;
      }
      const [saved] = await db
        .insert(products)
        .values({ ...data, images: JSON.stringify(images) })
        .returning();
      return saved.id;
    }),
  remove: adminOnly
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      await db.delete(products).where(eq(products.id, input.id));
      return true;
    }),
  saveSettings: adminOnly
    .input(
      z.object({
        whatsapp: z
          .string()
          .regex(/^\d{12,15}$|^$/, "Use país e DDD, só números.").optional(),
        negotiationQuantity: z.number().int().min(1).max(10000).optional(),
      }),
    )
    .handler(async ({ input }) => {
      if (input.whatsapp !== undefined) throw new ORPCError("BAD_REQUEST", { message: "Altere o WhatsApp no editor do site e publique a versão." });
      await db
        .insert(siteSettings)
        .values({ id: 1, ...input })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: input,
        });
      return true;
    }),
  upload: adminOnly
    .input(
      z.object({
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        filename: z.string().max(120),
      }),
    )
    .handler(async ({ input }) => {
      const ext =
        input.contentType === "image/png"
          ? "png"
          : input.contentType === "image/webp"
            ? "webp"
            : "jpg";
      const key = `products/${crypto.randomUUID()}.${ext}`;
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: input.contentType,
        }),
        { expiresIn: 600 },
      );
      return { key, url };
    }),
};
