import { NextResponse } from "next/server";
import { saveIconAsset } from "@/lib/store";
import { parseSvgIcon } from "@/lib/svg-icon";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was received." }, { status: 400 });
  if (file.size > 1024 * 1024) return NextResponse.json({ error: "The file must be smaller than 1 MB." }, { status: 400 });
  if (file.type !== "image/svg+xml") return NextResponse.json({ error: "Custom icons must be SVG files. PNG images require manual production review." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const svg = bytes.toString("utf8");
  let contours;
  try { contours = parseSvgIcon(svg); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "We could not process this SVG." }, { status: 400 }); }
  const assetId = crypto.randomUUID();
  await saveIconAsset(assetId, bytes, file.type);
  return NextResponse.json({ assetId, contours, dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`, message: "SVG accepted for 3D production preview." });
}
