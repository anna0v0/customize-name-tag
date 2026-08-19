import { NextResponse } from "next/server";
export async function POST(){return NextResponse.json({error:"Customer order tracking has moved to Shopify. Use the secure link in your confirmation email."},{status:410})}
