import { NextResponse } from "next/server";
import { saveIconAsset } from "@/lib/store";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was received." }, { status: 400 });
  if (file.size > 1024 * 1024) return NextResponse.json({ error: "The file must be smaller than 1 MB." }, { status: 400 });
  if (!["image/png", "image/svg+xml"].includes(file.type)) return NextResponse.json({ error: "Only PNG and SVG files are supported." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/svg+xml") {
    const svg = bytes.toString("utf8");
    if (/<script|javascript:|<foreignObject/i.test(svg)) return NextResponse.json({ error: "This SVG contains unsupported content." }, { status: 400 });
    if (!/<(path|circle|rect|polygon|ellipse)\b/i.test(svg)) return NextResponse.json({ error: "We could not find a solid shape in this SVG." }, { status: 400 });
  }
  const assetId = crypto.randomUUID();
  await saveIconAsset(assetId, bytes, file.type);
  return NextResponse.json({ assetId, dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`, message: "Icon accepted for production review." });
}
