import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrder,saveOrder,type StoredOrderItem } from "@/lib/store";
import { generate3mf } from "@/lib/three-mf";
import { designSchema } from "@/lib/schema";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  if(!await requireAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const order=await getOrder(id);if(!order)return NextResponse.json({error:"Not found"},{status:404});
  const items:StoredOrderItem[]=(order.items||[{design:order.design,quantity:order.quantity}]).map(item=>({...item,modelStatus:"Generating"}));await saveOrder({...order,items,status:"Generating"});
  const results=await Promise.allSettled(items.map((item,index)=>generate3mf(index===0?id:`${id}-${index+1}`,designSchema.parse(item.design))));results.forEach((result,index)=>{items[index].modelStatus=result.status==="fulfilled"?"Ready":"Failed"});const failed=results.some(result=>result.status==="rejected");const updated={...order,items,status:failed?"Manual Review Required" as const:"Pending Review" as const};await saveOrder(updated);return NextResponse.json(updated);
}
