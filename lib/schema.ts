import { z } from "zod";
const avatarSelectionSchema=z.object({head:z.string(),eyes:z.string(),nose:z.string(),mouth:z.string(),blush:z.string(),hairFront:z.string(),hairBack:z.string(),accessoryhand:z.string(),accessoryFace:z.string()});
export const designSchema = z.object({
  name: z.string().regex(/^[A-Za-z0-9]{1,10}$/), font: z.enum(["Block","Soft","Classic","Permanent Marker","Gochi Hand","Jua","Jaro","Poppins ExtraBold","Darumadrop One","Caveat Brush","Cherry Bomb One","East Sea Dokdo","Sour Gummy Bold","Bungee"]),
  baseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), topColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum(["star","heart","flower","cat","paw","cloud","file","thunder","upload"]), iconScale: z.number().min(.7).max(1.5).optional(), avatarSelection: avatarSelectionSchema.optional(), iconDataUrl: z.string().optional(), iconAssetId: z.string().regex(/^[a-f0-9-]{36}$/).optional(),
  iconContours: z.array(z.object({group:z.number().int().min(0).max(31),hole:z.boolean(),points:z.array(z.object({x:z.number().min(-1.1).max(1.1),y:z.number().min(-1.1).max(1.1)})).min(3).max(2000)})).max(96).optional(), templateVersion: z.literal("1")
});
export const orderSchema = z.object({
  customerName: z.string().min(2).max(80), email: z.string().email(), phone: z.string().min(6).max(30),
  quantity: z.number().int().min(1).max(100), notes: z.string().max(500), consent: z.literal(true), design: designSchema
});
