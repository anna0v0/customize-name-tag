"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart, type StandardProductDesign } from "@/lib/cart";
import type { ShopifyCatalogProduct } from "@/lib/shopify";

export default function StandardProductBuy({product}:{product:ShopifyCatalogProduct}){
  const router=useRouter();const available=product.variants.filter(variant=>variant.available);const [variantId,setVariantId]=useState(available[0]?.id||product.variants[0]?.id||"");const [quantity,setQuantity]=useState(1);
  const variant=useMemo(()=>product.variants.find(item=>item.id===variantId)||product.variants[0],[product.variants,variantId]);
  const image=variant?.image||product.featuredImage;
  function add(){if(!variant||!variant.available)return;const design:StandardProductDesign={productType:"shopify-standard",handle:product.handle,name:product.title,variantTitle:variant.title,selectedOptions:variant.selectedOptions,imageUrl:image?.url,price:Number(variant.price.amount),templateVersion:"1"};addToCart(design,quantity);router.push("/your-order")}
  return <section className="standard-product-buy">
    <div className="standard-product-media">{image?<img src={image.url} alt={image.altText||product.title}/>:<span>PRODUCT IMAGE COMING SOON</span>}</div>
    <div className="standard-product-info"><p className="eyebrow">READY-MADE PRODUCT</p><h1>{product.title}</h1><p>{product.description}</p><strong>HK${Number(variant?.price.amount||product.priceMin.amount)}</strong>
      {product.variants.length>1&&<label>OPTION<select value={variantId} onChange={event=>setVariantId(event.target.value)}>{product.variants.map(item=><option value={item.id} disabled={!item.available} key={item.id}>{item.title}{item.available?"":" — SOLD OUT"}</option>)}</select></label>}
      <label>QUANTITY<input type="number" min="1" max="100" value={quantity} onChange={event=>setQuantity(Math.max(1,Math.min(100,Number(event.target.value)||1)))}/></label>
      <button className="continue" disabled={!variant?.available} onClick={add}>{variant?.available?"ADD TO ORDER →":"SOLD OUT"}</button>
    </div>
  </section>;
}
