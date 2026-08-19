import { createHash } from "node:crypto";
import { after, NextResponse } from "next/server";
import { generate3mf } from "@/lib/three-mf";
import { productionDesignSchema } from "@/lib/schema";
import { claimWebhookEvent,getDesignDraft,getOrderByShopifyId,releaseWebhookEvent,saveOrder,updateDesignDraft,updateOrder,type StoredOrder,type StoredOrderItem } from "@/lib/store";
import { verifyShopifyHmac } from "@/lib/shopify-webhook";

type Property={name?:string;key?:string;value?:string};
type ShopifyLine={id:number|string;quantity:number;title?:string;variant_title?:string|null;price?:string;properties?:Property[];custom_attributes?:Property[]};
type ShopifyOrder={id:number|string;admin_graphql_api_id?:string;name?:string;email?:string;phone?:string;currency?:string;subtotal_price?:string;total_price?:string;processed_at?:string;created_at?:string;shipping_address?:{name?:string;phone?:string};shipping_lines?:Array<{title?:string;price?:string}>;line_items?:ShopifyLine[]};

function property(line:ShopifyLine,key:string){return [...(line.properties||[]),...(line.custom_attributes||[])].find(item=>(item.name||item.key)===key)?.value}
function shopifyId(order:ShopifyOrder){return order.admin_graphql_api_id||`gid://shopify/Order/${order.id}`}
function internalId(){return `FF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`}

async function generateModels(order:StoredOrder){
  const items:StoredOrderItem[]=(order.items||[]).map(item=>item.modelStatus==="Not Required"?item:{...item,modelStatus:"Generating"});await saveOrder({...order,items});
  const customIndexes=items.flatMap((item,index)=>item.modelStatus==="Not Required"?[]:[index]);
  const results=await Promise.allSettled(customIndexes.map(index=>generate3mf(index===0?order.id:`${order.id}-${index+1}`,productionDesignSchema.parse(items[index].design))));
  results.forEach((result,resultIndex)=>{items[customIndexes[resultIndex]].modelStatus=result.status==="fulfilled"?"Ready":"Failed"});
  const failed=results.some(result=>result.status==="rejected");if(failed)console.error("One or more Shopify order models failed",order.id);
  await saveOrder({...order,items,status:failed?"Manual Review Required":"Pending Review"});
}

async function paid(payload:ShopifyOrder){
  const externalId=shopifyId(payload);if(await getOrderByShopifyId(externalId))return;
  const items:StoredOrderItem[]=[];
  for(const line of payload.line_items||[]){
    const designId=property(line,"Design ID");
    if(!designId){items.push({design:{productType:"shopify-standard",handle:property(line,"Product handle")||"shopify-product",name:line.title||"Shopify product",variantTitle:line.variant_title||"Default",selectedOptions:[],price:Number(line.price||0),templateVersion:"1"},shopifyLineItemId:String(line.id),quantity:Math.max(1,line.quantity||1),modelStatus:"Not Required"});continue}
    const draft=await getDesignDraft(designId);if(!draft||draft.status==="Expired")throw new Error(`Missing design draft ${designId}`);
    items.push({design:draft.design,designId,shopifyLineItemId:String(line.id),quantity:Math.max(1,line.quantity||1),modelStatus:draft.design.productType==="shopify-standard"?"Not Required":"Queued"});
  }
  if(!items.length)throw new Error("Paid Shopify order has no line items.");
  const first=items[0];const shipping=payload.shipping_lines?.[0];const id=internalId();const quantity=items.reduce((sum,item)=>sum+item.quantity,0);
  const order:StoredOrder={id,shopifyOrderId:externalId,shopifyOrderName:payload.name||String(payload.id),shopifyAdminUrl:`https://${String(process.env.SHOPIFY_STORE_DOMAIN).replace(/^https?:\/\//,"").replace(/\/$/,"")}/admin/orders/${payload.id}`,paidAt:payload.processed_at||new Date().toISOString(),paymentStatus:"Paid",createdAt:payload.created_at||new Date().toISOString(),status:"Generating",customerName:payload.shipping_address?.name||"Shopify customer",email:payload.email||"unknown@example.invalid",phone:payload.shipping_address?.phone||payload.phone||"Not provided",shippingLabel:shipping?.title,shippingFee:Number(shipping?.price||0),quantity,subtotal:Number(payload.subtotal_price||0),totalAmount:Number(payload.total_price||0),currency:payload.currency==="HKD"?"HKD":undefined,notes:"",design:first.design,items};
  await saveOrder(order);await Promise.all(items.map(item=>item.designId?updateDesignDraft(item.designId,{status:"Paid",shopifyOrderId:externalId}):Promise.resolve()));
  if(items.some(item=>item.modelStatus!=="Not Required"))after(()=>generateModels(order));else await saveOrder({...order,status:"Pending Review"});
}

async function cancel(payload:ShopifyOrder){
  const order=await getOrderByShopifyId(shopifyId(payload));if(!order)return;
  await updateOrder(order.id,order.status==="In Production"||order.status==="Completed"?"Manual Review Required":"Cancelled");
}

export async function POST(req:Request){
  const raw=await req.text();
  if(!verifyShopifyHmac(raw,req.headers.get("x-shopify-hmac-sha256")))return NextResponse.json({error:"Invalid webhook signature."},{status:401});
  const topic=req.headers.get("x-shopify-topic")||"";const shop=req.headers.get("x-shopify-shop-domain")||"";
  const expectedShop=String(process.env.SHOPIFY_STORE_DOMAIN||"").replace(/^https?:\/\//,"").replace(/\/$/,"");
  if(!expectedShop||shop!==expectedShop)return NextResponse.json({error:"Unexpected Shopify store."},{status:403});
  let payload:ShopifyOrder;try{payload=JSON.parse(raw) as ShopifyOrder}catch{return NextResponse.json({error:"Invalid JSON."},{status:400})}
  const eventId=req.headers.get("x-shopify-event-id")||createHash("sha256").update(`${topic}:${raw}`).digest("hex");
  if(!await claimWebhookEvent(eventId))return NextResponse.json({ok:true,duplicate:true});
  try{
    if(topic==="orders/paid")await paid(payload);
    else if(topic==="orders/cancelled"||topic==="refunds/create")await cancel(payload);
    return NextResponse.json({ok:true});
  }catch(error){await releaseWebhookEvent(eventId);console.error("Shopify webhook processing failed",topic,error);return NextResponse.json({error:"Webhook processing failed."},{status:500})}
}
