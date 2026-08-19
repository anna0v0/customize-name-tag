import { NextResponse } from "next/server";
import { z } from "zod";
import { getDesignDraft } from "@/lib/store";

const schema=z.object({designIds:z.array(z.string().uuid()).min(1).max(10)});
export async function POST(req:Request){
  let body:unknown;try{body=await req.json()}catch{return NextResponse.json({paid:false})}
  const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({paid:false},{status:400});
  const drafts=await Promise.all(parsed.data.designIds.map(getDesignDraft));
  return NextResponse.json({paid:drafts.every(draft=>draft?.status==="Paid")});
}
