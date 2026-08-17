import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/schema";
import { saveOrder, getOrders, updateOrder } from "@/lib/store";
import { generate3mf } from "@/lib/three-mf";
import { requireAdmin } from "@/lib/admin-auth";
import { NAME_TAG_UNIT_PRICE, ORGANIZER_UNIT_PRICE, ORDER_CURRENCY, SHIPPING_OPTIONS, orderItemsTotal, shippingPrice } from "@/lib/pricing";

export async function GET(req:Request){if(!await requireAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await getOrders())}

export async function POST(req:Request){
  const parsed=orderSchema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Check your order details."},{status:400});
  const data=parsed.data;
  const items=data.items??[{design:data.design!,quantity:data.quantity??1}];
  const quantity=items.reduce((total,item)=>total+item.quantity,0);
  const subtotal=orderItemsTotal(items);
  const shippingFee=shippingPrice(data.shippingMethod);
  const totalAmount=subtotal+shippingFee;
  const id=`FF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
  const unitPrice=items.length===1&&"productType" in items[0].design&&items[0].design.productType==="beyblade-organizer"?ORGANIZER_UNIT_PRICE:NAME_TAG_UNIT_PRICE;
  const order={...data,id,createdAt:new Date().toISOString(),status:"Generating" as const,design:items[0].design,items,quantity,unitPrice,subtotal,shippingFee,shippingLabel:SHIPPING_OPTIONS[data.shippingMethod].label,totalAmount,currency:ORDER_CURRENCY};
  await saveOrder(order);
  try{
    await Promise.all(items.map((item,index)=>generate3mf(index===0?id:`${id}-${index+1}`,item.design)));
    await updateOrder(id,"Pending Review");
  }catch{
    await updateOrder(id,"Manual Review Required");
  }
  return NextResponse.json({orderId:id,unitPrice,subtotal,shippingMethod:data.shippingMethod,shippingFee,totalAmount,currency:ORDER_CURRENCY},{status:201});
}
