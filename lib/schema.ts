import { z } from "zod";
export const designSchema = z.object({
  name: z.string().regex(/^[A-Za-z0-9]{1,10}$/), font: z.enum(["Block","Soft","Classic","Permanent Marker","Gochi Hand","Jua","Jaro","Poppins ExtraBold"]),
  baseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), topColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum(["star","heart","flower","upload"]), iconDataUrl: z.string().optional(), iconAssetId: z.string().regex(/^[a-f0-9-]{36}$/).optional(), templateVersion: z.literal("1")
});
export const orderSchema = z.object({
  customerName: z.string().min(2).max(80), email: z.string().email(), phone: z.string().min(6).max(30),
  quantity: z.number().int().min(1).max(100), notes: z.string().max(500), consent: z.literal(true), design: designSchema
});
