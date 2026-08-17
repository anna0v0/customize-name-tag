"use client";
import { useEffect,useState } from "react";
import { CART_STORAGE_KEY,RECEIPT_STORAGE_KEY,cartQuantity,cartTotal,readCart,type PlatformCartItem } from "@/lib/cart";
import { SHIPPING_OPTIONS,type ShippingMethod } from "@/lib/pricing";

export default function YourDetailsPage(){
 const [items,setItems]=useState<PlatformCartItem[]>([]);
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [shippingMethod,setShippingMethod]=useState<ShippingMethod|"">("");
 useEffect(()=>{setItems(readCart());setReady(true)},[]);
 const count=cartQuantity(items);
 const subtotal=cartTotal(items);
 const shippingFee=shippingMethod?SHIPPING_OPTIONS[shippingMethod].price:0;
 const total=subtotal+shippingFee;

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!items.length||!shippingMethod)return;
  setBusy(true);setError("");
  const form=new FormData(event.currentTarget);
  const response=await fetch("/api/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({customerName:form.get("customerName"),email:form.get("email"),phone:form.get("phone"),shippingMethod,notes:form.get("notes"),consent:form.get("consent")==="on",items:items.map(item=>({design:item.design,quantity:item.quantity}))})});
  const data=await response.json();setBusy(false);
  if(!response.ok){setError(data.error||"We could not place your order.");return}
  sessionStorage.setItem(RECEIPT_STORAGE_KEY,JSON.stringify({orderId:data.orderId,totalAmount:data.totalAmount,subtotal:data.subtotal,shippingMethod:data.shippingMethod,shippingFee:data.shippingFee,quantity:count}));
  localStorage.removeItem(CART_STORAGE_KEY);window.location.href="/order-confirmed";
 }

 return <main className="shared-checkout"><nav><a className="brand" href="/">THE <span className="brand-accent">ODDMENT</span> CLUB</a><a className="bag" href="/your-order">YOUR ORDER</a></nav><section className="shared-details"><a href="/your-order">← BACK TO YOUR ORDER</a><div className="shared-title"><div><p className="eyebrow">CHECKOUT</p><h1>Your details.</h1></div>{ready&&<b>{count} {count===1?"ITEM":"ITEMS"} · HK${total}</b>}</div>{ready&&!items.length?<div className="cart-empty"><h2>Your order is empty.</h2><a href="/">SELECT A PRODUCT →</a></div>:<form onSubmit={submit}><div><label>FULL NAME<input required name="customerName"/></label><label>EMAIL<input required type="email" name="email"/></label><label>PHONE / WHATSAPP<input required name="phone"/></label></div>
 <fieldset className="shipping-options"><legend>SHIPPING METHOD</legend>{(Object.entries(SHIPPING_OPTIONS) as [ShippingMethod,(typeof SHIPPING_OPTIONS)[ShippingMethod]][]).map(([id,option])=><label className={shippingMethod===id?"selected":""} key={id}><input required type="radio" name="shippingMethod" value={id} checked={shippingMethod===id} onChange={()=>setShippingMethod(id)}/><span><b>{option.label}</b><small>{id==="sf-express"?"Delivery fee is included in this order total.":"Sent by standard local post."}</small></span><strong>+HK${option.price}</strong></label>)}</fieldset>
 <label>NOTES (OPTIONAL)<textarea name="notes" maxLength={500}/></label><label className="check"><input required name="consent" type="checkbox"/> I agree that my order details and artwork will be stored for fulfilment.</label>{error&&<p className="error">{error}</p>}<div className="checkout-breakdown"><div><span>ITEMS</span><b>HK${subtotal}</b></div><div><span>SHIPPING</span><b>{shippingMethod?`HK$${shippingFee}`:"SELECT METHOD"}</b></div></div><div className="shared-total"><span>ORDER TOTAL</span><b>{count} {count===1?"ITEM":"ITEMS"} · HK${total}</b></div><button className="continue" disabled={busy||!items.length||!shippingMethod}>{busy?"PLACING ORDER…":shippingMethod?`PLACE ORDER · HK$${total}`:"SELECT SHIPPING TO CONTINUE"} <span>→</span></button></form>}</section></main>;
}
