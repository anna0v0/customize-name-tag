import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrder,saveOrder,type StoredOrderItem } from "@/lib/store";
import { generate3mf } from "@/lib/three-mf";
import { productionDesignSchema } from "@/lib/schema";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  if(!await requireAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const order=await getOrder(id);if(!order)return NextResponse.json({error:"Not found"},{status:404});
  const items:StoredOrderItem[]=(order.items||[{design:order.design,quantity:order.quantity}]).map(item=>item.modelStatus==="Not Required"?item:{...item,modelStatus:"Generating"});await saveOrder({...order,items,status:"Generating"});
  const customIndexes=items.flatMap((item,index)=>item.modelStatus==="Not Required"?[]:[index]);const results=await Promise.allSettled(customIndexes.map(index=>generate3mf(index===0?id:`${id}-${index+1}`,productionDesignSchema.parse(items[index].design))));results.forEach((result,resultIndex)=>{items[customIndexes[resultIndex]].modelStatus=result.status==="fulfilled"?"Ready":"Failed"});const failed=results.some(result=>result.status==="rejected");const updated={...order,items,status:failed?"Manual Review Required" as const:"Pending Review" as const};await saveOrder(updated);return NextResponse.json(updated);
}
