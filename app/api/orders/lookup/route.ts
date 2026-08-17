import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrder, getOrdersByEmail } from "@/lib/store";
import { toPublicOrderSummary } from "@/lib/public-order";

const schema=z.object({query:z.string().trim().min(3).max(120)});
const attempts=new Map<string,{count:number;resetAt:number}>();

function isRateLimited(req:Request){
  const key=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"local";
  const now=Date.now();
  const current=attempts.get(key);
  if(!current||current.resetAt<now){attempts.set(key,{count:1,resetAt:now+10*60_000});return false}
  current.count+=1;
  return current.count>20;
}

export async function POST(req:Request){
  if(isRateLimited(req))return NextResponse.json({error:"Too many lookup attempts. Please try again later."},{status:429});
  let body:unknown;
  try{body=await req.json()}catch{return NextResponse.json({error:"Enter a valid email or order reference."},{status:400})}
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Enter a valid email or order reference."},{status:400});
  const query=parsed.data.query;
  const reference=query.toUpperCase();
  let orders;
  if(/^FF-\d{4}-[A-Z0-9]{6}$/.test(reference)){
    const order=await getOrder(reference);
    orders=order?[order]:[];
  }else if(z.string().email().safeParse(query).success){
    orders=await getOrdersByEmail(query);
  }else{
    return NextResponse.json({error:"Enter the full email address or order reference used for your order."},{status:400});
  }
  if(!orders.length)return NextResponse.json({error:"No matching orders found. Check your details and try again."},{status:404});
  return NextResponse.json({orders:orders.map(toPublicOrderSummary)});
}
