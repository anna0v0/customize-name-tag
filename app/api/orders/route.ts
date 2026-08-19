import { NextResponse } from "next/server";
import { getOrders } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req:Request){if(!await requireAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await getOrders())}

export async function POST(req:Request){
  return NextResponse.json({error:"Direct order creation has been retired. Continue with Shopify Checkout."},{status:410});
}
