import { NextResponse } from "next/server";
import { getModel, getOrder } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";
import { generate3mf } from "@/lib/three-mf";
import { DesignConfig } from "@/lib/config";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^FF-\d{4}-[A-Z0-9]{6}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const order = await getOrder(id);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const requestedIndex = Math.max(0, Number(new URL(request.url).searchParams.get("item") ?? 0));
  const item = order.items?.[requestedIndex] ?? (requestedIndex === 0 ? { design: order.design } : undefined);
  if (!item) return new NextResponse("Not found", { status: 404 });
  const modelId = requestedIndex === 0 ? id : `${id}-${requestedIndex + 1}`;
  await generate3mf(modelId, item.design as unknown as DesignConfig);
  const data = await getModel(modelId);
  if (!data) return new NextResponse("Model is not ready", { status: 404 });
  return new NextResponse(new Uint8Array(data), { headers: { "content-type": "model/3mf", "content-disposition": `attachment; filename="${modelId}.3mf"` } });
}
