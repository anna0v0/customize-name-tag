"use client";
import { useEffect,useMemo,useState } from "react";
import OrderItemPreview from "@/components/OrderItemPreview";
import { CART_STORAGE_KEY,SHOPIFY_PENDING_CHECKOUT_KEY,cartQuantity,designPrice,readCart,writeCart,type PlatformCartItem } from "@/lib/cart";
import { trackCommerce } from "@/lib/analytics";

type PriceMap={nameTag:number;organizer:number};
function productKey(item:PlatformCartItem){return "productType" in item.design?"organizer":"nameTag"}

export default function YourOrderPage(){
 const [items,setItems]=useState<PlatformCartItem[]>([]);const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [prices,setPrices]=useState<PriceMap|null>(null);
 useEffect(()=>{
  setItems(readCart());setReady(true);trackCommerce("cart_viewed");
  fetch("/api/shopify/products").then(response=>response.json()).then(data=>{if(!Array.isArray(data.products))return;const name=data.products.find((item:{key:string})=>item.key==="name-tag");const organizer=data.products.find((item:{key:string})=>item.key==="beyblade-organizer");if(name&&organizer)setPrices({nameTag:Number(name.priceMin.amount),organizer:Number(organizer.priceMin.amount)})}).catch(()=>{});
  try{const pending=JSON.parse(localStorage.getItem(SHOPIFY_PENDING_CHECKOUT_KEY)||"null") as {designIds?:string[]}|null;if(pending?.designIds?.length)fetch("/api/shopify/checkout/status",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({designIds:pending.designIds})}).then(response=>response.json()).then(data=>{if(data.paid){localStorage.removeItem(CART_STORAGE_KEY);localStorage.removeItem(SHOPIFY_PENDING_CHECKOUT_KEY);setItems([])}})}catch{}
 },[]);
 function price(item:PlatformCartItem){return prices?.[productKey(item)]??designPrice(item.design)}
 function update(next:PlatformCartItem[]){setItems(next);writeCart(next)}
 function quantity(id:string,value:number){update(items.map(item=>item.id===id?{...item,quantity:Math.max(1,Math.min(100,value||1))}:item))}
 function remove(id:string){update(items.filter(item=>item.id!==id))}
 async function checkout(){
  setBusy(true);setError("");trackCommerce("checkout_started",{quantity:cartQuantity(items)});
  try{const response=await fetch("/api/shopify/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({items:items.map(({design,quantity})=>({design,quantity}))})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Checkout is temporarily unavailable.");localStorage.setItem(SHOPIFY_PENDING_CHECKOUT_KEY,JSON.stringify({cartId:data.cartId,designIds:data.designIds}));window.location.assign(data.checkoutUrl)}
  catch(value){setError(value instanceof Error?value.message:"Checkout is temporarily unavailable.");setBusy(false)}
 }
 const count=cartQuantity(items);const total=useMemo(()=>items.reduce((sum,item)=>sum+item.quantity*price(item),0),[items,prices]);const latest=items[items.length-1];const repeatHref=latest&&"productType" in latest.design?"/beyblade-organizer":"/name-tag";
 return <main className="shared-checkout"><nav><a className="brand" href="/">THE <span className="brand-accent">ODDMENT</span> CLUB</a><a className="bag" href="/">PRODUCTS</a></nav><section className="shared-order"><div className="shared-title"><div><h1>YOUR ORDER</h1></div>{ready&&<b>{count} {count===1?"ITEM":"ITEMS"} · HK${total}</b>}</div>{!ready?<div className="loading">Loading your order…</div>:!items.length?<div className="cart-empty"><h2>Your order is empty.</h2><p>Choose a product and start customising.</p><a href="/">SELECT A PRODUCT →</a></div>:<><div className="platform-cart">{items.map((item,index)=>{const organizer="productType" in item.design;return <article key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div className="platform-cart-preview"><OrderItemPreview design={item.design}/></div><div className="platform-cart-copy"><small>{organizer?"BEYBLADE X ORGANIZER":"CUSTOM NAME TAG"}</small><h2>{item.design.name}</h2><b>HK${price(item)} each</b></div><label>QTY<input type="number" min="1" max="100" value={item.quantity} onChange={event=>quantity(item.id,Number(event.target.value))}/></label><button onClick={()=>remove(item.id)}>REMOVE</button></article>})}</div><div className="cart-actions"><a className="add-product" href={repeatHref}>＋ ADD ANOTHER DESIGN</a><a className="add-product" href="/#products">＋ ADD ANOTHER PRODUCT</a></div><div className="shared-total"><span>{prices?"ITEMS TOTAL":"ESTIMATED ITEMS TOTAL"}</span><b>{count} {count===1?"ITEM":"ITEMS"} · HK${total}</b></div>{error&&<p className="error">{error}</p>}<button className="continue shared-continue" disabled={busy} onClick={checkout}>{busy?"OPENING SECURE CHECKOUT…":"CONTINUE TO SECURE CHECKOUT"} <span>→</span></button><p className="checkout-note">Final product prices, delivery options, discounts and payment are confirmed securely by Shopify.</p></>}</section><footer><span>THE <span className="brand-accent">ODDMENT</span> CLUB</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer></main>
}
