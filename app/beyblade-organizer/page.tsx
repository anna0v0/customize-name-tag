"use client";
import { useMemo,useState } from "react";
import dynamic from "next/dynamic";
import { COLORS } from "@/lib/config";
import { ORGANIZER_VARIANTS,organizerVariant,type OrganizerDesignConfig } from "@/lib/organizer";
import { addToCart } from "@/lib/cart";

const Preview=dynamic(()=>import("@/components/OrganizerPreview3D"),{ssr:false,loading:()=> <div className="loading">Building your organizer…</div>});

export default function OrganizerPage(){
 const [variantId,setVariantId]=useState("sample-organizer");const [color,setColor]=useState("#1e1f22");const [quantity,setQuantity]=useState(1);
 const variant=organizerVariant(variantId);const design=useMemo<OrganizerDesignConfig>(()=>({productType:"beyblade-organizer",variant:variant.id,name:variant.name,color,width:variant.width,depth:variant.depth,height:variant.height,price:variant.price,templateVersion:"1"}),[variant,color]);const total=quantity*variant.price;
 function addOrganizer(){addToCart(design,quantity);window.location.href="/your-order"}
 return <main className="organizer-page"><nav><a className="brand" href="/">THE <span className="brand-accent">ODDMENT</span> CLUB</a><div className="navlinks"><a href="/#products">PRODUCTS</a><a href="/about">ABOUT</a><a href="/order-status">ORDER STATUS</a></div></nav>
  <header className="organizer-hero"><p className="eyebrow">BUILT FOR BEYBLADE X</p><h1>Build your loadout.<br/><em>Battle ready.</em></h1><p className="organizer-hero-intro">Keep your Beyblade X collection organised in one dedicated setup.</p></header>
  <section id="designer" className="organizer-designer">
   <div className="organizer-studio">
    <aside className="organizer-controls"><div><span>01</span><label>ORGANIZER SPECIFICATION<select value={variantId} onChange={event=>setVariantId(event.target.value)}>{ORGANIZER_VARIANTS.map(item=><option value={item.id} key={item.id}>{item.name} — HK${item.price}</option>)}</select></label></div><div className="organizer-specs"><span><small>WIDTH</small><b>{variant.width} mm</b></span><span><small>DEPTH</small><b>{variant.depth} mm</b></span><span><small>HEIGHT</small><b>{variant.height} mm</b></span></div><div><span>02</span><label>COLOUR</label><div className="swatches">{COLORS.map(item=><button aria-label={item.name} title={item.name} className={color===item.value?"selected":""} style={{background:item.value}} onClick={()=>setColor(item.value)} key={item.value}/>)}</div></div><div><span>03</span><label>QUANTITY<input type="number" min="1" max="20" value={quantity} onChange={event=>setQuantity(Math.max(1,Math.min(20,Number(event.target.value)||1)))}/></label></div><div className="organizer-price"><small>PRICE</small><b>HK${total}</b><span>{quantity} × HK${variant.price}</span></div></aside>
    <div className="organizer-preview"><div className="preview-top"><span>LIVE 3D PREVIEW</span><span>{variant.width} × {variant.depth} × {variant.height} mm</span></div><Preview design={design}/><p>Drag to rotate · Right-drag to pan · Scroll to zoom</p><button className="continue" onClick={addOrganizer}>ADD TO ORDER · HK${total} <span>→</span></button></div>
   </div>
  </section><footer><span>THE <span className="brand-accent">ODDMENT</span> CLUB</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
 </main>
}
