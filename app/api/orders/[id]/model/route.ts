import { NextResponse } from "next/server";
import { getModel } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^FF-\d{4}-[A-Z0-9]{6}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const data = await getModel(id);
  if (!data) return new NextResponse("Model is not ready", { status: 404 });
  return new NextResponse(new Uint8Array(data), { headers: { "content-type": "model/3mf", "content-disposition": `attachment; filename="${id}.3mf"` } });
}
