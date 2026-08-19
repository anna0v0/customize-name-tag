"use client";
import dynamic from "next/dynamic";
import type { CartDesign } from "@/lib/cart";

const NameTagPreview=dynamic(()=>import("./Preview3D"),{ssr:false,loading:()=> <div className="loading">Building preview…</div>});
const OrganizerPreview=dynamic(()=>import("./OrganizerPreview3D"),{ssr:false,loading:()=> <div className="loading">Building preview…</div>});
export default function OrderItemPreview({design}:{design:CartDesign}){
  if("productType" in design&&design.productType==="shopify-standard")return <div className="standard-product-preview">{design.imageUrl?<img src={design.imageUrl} alt={design.name}/>:<span>PRODUCT</span>}</div>;
  return "productType" in design?<OrganizerPreview design={design}/>:<NameTagPreview design={design}/>;
}
