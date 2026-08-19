import { NextResponse } from "next/server";
import { z } from "zod";
import { orderItemSchema } from "@/lib/schema";
import { createShopifyCart, shopifyIsConfigured } from "@/lib/shopify";
import { saveDesignDraft, updateDesignDraft } from "@/lib/store";

const checkoutSchema=z.object({items:z.array(orderItemSchema).min(1).max(10)});

export async function POST(req:Request){
  if(!shopifyIsConfigured())return NextResponse.json({error:"Shopify checkout is not configured yet."},{status:503});
  let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:"Your order could not be read."},{status:400})}
  const parsed=checkoutSchema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Check your designs and try again."},{status:400});
  const createdAt=new Date();
  const items=parsed.data.items.map(item=>({...item,id:crypto.randomUUID(),designId:crypto.randomUUID()}));
  try{
    await Promise.all(items.map(item=>saveDesignDraft({id:item.designId,createdAt:createdAt.toISOString(),expiresAt:new Date(createdAt.getTime()+7*86400_000).toISOString(),status:"Checkout Pending",design:item.design})));
    const cart=await createShopifyCart(items);
    await Promise.all(items.map(item=>updateDesignDraft(item.designId,{cartId:cart.id})));
    return NextResponse.json({checkoutUrl:cart.checkoutUrl,cartId:cart.id,designIds:items.map(item=>item.designId),subtotal:cart.cost.subtotalAmount,total:cart.cost.totalAmount});
  }catch(error){
    console.error("Shopify checkout creation failed",error);
    return NextResponse.json({error:error instanceof Error?error.message:"Shopify checkout is temporarily unavailable."},{status:502});
  }
}
