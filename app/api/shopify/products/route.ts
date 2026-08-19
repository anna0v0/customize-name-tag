import { NextResponse } from "next/server";
import { getShopifyCatalog, shopifyIsConfigured } from "@/lib/shopify";

export const revalidate=300;
export async function GET(){
  if(!shopifyIsConfigured())return NextResponse.json({configured:false,products:[]});
  try{return NextResponse.json({configured:true,products:await getShopifyCatalog()})}
  catch(error){console.error("Shopify catalog request failed",error);return NextResponse.json({error:"Product information is temporarily unavailable."},{status:502})}
}
