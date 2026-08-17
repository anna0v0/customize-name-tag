"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { COLORS, FONTS, DesignConfig, layoutFor } from "@/lib/config";
import { NAME_TAG_UNIT_PRICE } from "@/lib/pricing";
import type {AvatarSelection} from "@/lib/avatar";

const Preview3D = dynamic(() => import("@/components/Preview3D"), { ssr:false, loading:()=> <div className="loading">Building your preview…</div> });
const AvatarMaker = dynamic(() => import("@/components/AvatarMaker"), { ssr:false });
type Step = "design"|"cart"|"details"|"done";
type CartItem = {id:string;design:DesignConfig;quantity:number};
const DRAFT_STORAGE_KEY="form-fable-name-tag-draft-v1";

export default function NameTagDesigner(){
 const [step,setStep]=useState<Step>("design");
 const [mobileStage,setMobileStage]=useState(0);
 const [design,setDesign]=useState<DesignConfig>({name:"Milo",font:"Gochi Hand",baseColor:"#f4f0e7",topColor:"#1e1f22",icon:"flower",iconScale:1,templateVersion:"1"});
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [orderId,setOrderId]=useState(""); const [orderQuantity,setOrderQuantity]=useState(1); const [orderTotal,setOrderTotal]=useState(NAME_TAG_UNIT_PRICE);
 const [cart,setCart]=useState<CartItem[]>([]); const [editingId,setEditingId]=useState<string|null>(null);
 const [draftReady,setDraftReady]=useState(false);
 const [avatarOpen,setAvatarOpen]=useState(false);
 const layout=useMemo(()=>layoutFor(design.name,design.iconScale),[design.name,design.iconScale]);
 const cartQuantity=useMemo(()=>cart.reduce((sum,item)=>sum+item.quantity,0),[cart]);
 const cartTotal=cartQuantity*NAME_TAG_UNIT_PRICE;
 useEffect(()=>{try{const saved=localStorage.getItem(DRAFT_STORAGE_KEY);if(saved){const draft=JSON.parse(saved) as {design?:DesignConfig;cart?:CartItem[];step?:Step};if(draft.design&&typeof draft.design.name==="string")setDesign(draft.design);if(Array.isArray(draft.cart))setCart(draft.cart.filter(item=>item&&typeof item.id==="string"&&typeof item.quantity==="number"&&typeof item.design?.name==="string"));if(draft.step==="cart"||draft.step==="design")setStep(draft.step)}}catch{}finally{setDraftReady(true)}},[]);
 useEffect(()=>{if(!draftReady||step==="done")return;try{localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify({design,cart,step:step==="details"?"cart":step}))}catch{}},[design,cart,step,draftReady]);
 function patch<K extends keyof DesignConfig>(key:K,value:DesignConfig[K]){setDesign(d=>({...d,[key]:value}));}
 function selectDefaultIcon(icon:Exclude<DesignConfig["icon"],"upload">){setDesign(d=>({...d,icon,iconDataUrl:undefined,iconAssetId:undefined,iconContours:undefined,avatarSelection:undefined}))}
 async function uploadAvatar(file:File,avatarSelection:AvatarSelection){setError("");const fd=new FormData();fd.append("file",file);const res=await fetch("/api/uploads/icon",{method:"POST",body:fd});const data=await res.json();if(!res.ok){setError(data.error);return false;}setDesign(d=>({...d,icon:"upload",iconScale:d.avatarSelection?d.iconScale:1.1,iconDataUrl:data.dataUrl,iconAssetId:data.assetId,iconContours:data.contours,avatarSelection}));return true;}
 async function applyAvatar(selection:AvatarSelection,svg:string){const accepted=await uploadAvatar(new File([svg],"custom-avatar.svg",{type:"image/svg+xml"}),selection);if(accepted)setAvatarOpen(false)}
 function removeAvatar(){setDesign(d=>({...d,icon:"flower",iconDataUrl:undefined,iconAssetId:undefined,iconContours:undefined,avatarSelection:undefined}))}
 function selectMobileStage(next:number){
  const stage=Math.max(0,Math.min(3,next));
  setMobileStage(stage);
  window.setTimeout(()=>document.querySelector(`[data-mobile-stage="${stage}"]`)?.scrollIntoView({behavior:"smooth",block:"start"}),40);
 }
 function goToMaker(){window.setTimeout(()=>document.getElementById("maker")?.scrollIntoView({behavior:"smooth",block:"start"}),30)}
 function addCurrent(){if(!design.name)return;const item={id:editingId??crypto.randomUUID(),design:{...design},quantity:editingId?cart.find(entry=>entry.id===editingId)?.quantity??1:1};setCart(items=>editingId?items.map(entry=>entry.id===editingId?item:entry):[...items,item]);setEditingId(null);setStep("cart");goToMaker()}
 function editItem(item:CartItem){setDesign({...item.design});setEditingId(item.id);setStep("design");setMobileStage(0);goToMaker()}
 function removeItem(id:string){setCart(items=>items.filter(item=>item.id!==id))}
 function changeItemQuantity(id:string,quantity:number){setCart(items=>items.map(item=>item.id===id?{...item,quantity:Math.max(1,Math.min(100,quantity||1))}:item))}
 function addAnother(){setEditingId(null);setDesign(current=>({...current,name:""}));setStep("design");setMobileStage(0);goToMaker()}
 function continueToDetails(){setStep("details");goToMaker()}
 function mobileNext(){if(mobileStage<3)selectMobileStage(mobileStage+1);else addCurrent()}
 function designAnother(){setCart([]);setEditingId(null);setStep("design");setMobileStage(0);setOrderId("");window.scrollTo({top:0,behavior:"smooth"})}
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!cart.length)return;setBusy(true);setError("");const f=new FormData(e.currentTarget);const quantity=cart.reduce((total,item)=>total+item.quantity,0);const payload={customerName:f.get("customerName"),email:f.get("email"),phone:f.get("phone"),items:cart.map(item=>({design:item.design,quantity:item.quantity})),notes:f.get("notes"),consent:f.get("consent")=== "on"};const res=await fetch("/api/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();setBusy(false);if(!res.ok){setError(data.error||"We could not submit your order.");return;}localStorage.removeItem(DRAFT_STORAGE_KEY);setOrderId(data.orderId);setOrderQuantity(quantity);setOrderTotal(data.totalAmount??quantity*NAME_TAG_UNIT_PRICE);setStep("done");}
 return <main>
  <nav><a className="brand" href="/">FORM <i>&</i> FABLE</a><div className="navlinks"><a href="#maker">DESIGN</a><a href="#how">HOW IT WORKS</a><a href="/order-status">ORDER STATUS</a></div><a className="bag" href="/">VIEW ALL PRODUCTS</a></nav>
  <header className="hero"><div><h1>Your name,<br/><em>made tangible.</em></h1></div><img className="hero-art" src="/images/roro-magic.png" alt="Roro Magic"/></header>
  <section id="maker" className="maker">
   <div className="section-head"><span>01</span><h2>Make it yours</h2></div>
   {step==="done" ? <div className="success success-order-page">
    <header className="success-order-header"><div className="success-mark">✓</div><div><p className="eyebrow">ORDER CONFIRMED</p><h2>Your order is in.</h2><p>Your total is confirmed. Complete the PayMe payment below and we’ll prepare your order for production.</p></div></header>
    <div className="success-order-grid">
     <section className="order-confirmation-card"><small>ORDER REFERENCE</small><strong>{orderId}</strong><p>Keep this reference and include it in your PayMe payment message so we can match your payment to the correct order.</p><div className="order-price-summary"><div><span>Quantity</span><b>{orderQuantity}</b></div><div><span>Unit price</span><b>HK${NAME_TAG_UNIT_PRICE}</b></div><div className="order-total"><span>Total due</span><b>HK${orderTotal}</b></div></div><div className="order-next-steps"><h3>What happens next?</h3><ol><li><b>Pay with PayMe</b><span>Scan the QR and pay the confirmed total.</span></li><li><b>Model review</b><span>We check your design and printable 3MF.</span></li><li><b>Production</b><span>We print and finish your custom tag.</span></li></ol></div></section>
     <section className="payment-card"><div className="payment-card-heading"><div><small>PAYMENT METHOD</small><h3>PayMe</h3></div><span>AVAILABLE</span></div><img className="payme-qr-image" src="/images/payme-qr.png" alt="PayMe payment QR code"/><p>Scan the PayMe QR code and pay <b>HK${orderTotal}</b>. Enter <strong>{orderId}</strong> in the payment message.</p><div className="future-payment-methods"><span>MORE PAYMENT METHODS</span><small>Coming soon</small></div></section>
    </div>
    <div className="success-actions"><a href="/">BACK TO PRODUCTS</a><button onClick={designAnother}>DESIGN ANOTHER</button></div>
   </div> : <div className={`studio ${step!=="design"?"studio-details":""}`}>
    <aside className="controls">
     <section className={`field mobile-config-step ${mobileStage===0?"active":""}`} data-mobile-stage="0"><button type="button" className="mobile-step-summary" onClick={()=>selectMobileStage(0)}><b>1</b><span>YOUR NAME</span><small>{design.name}</small></button><label className="mobile-step-content"><span><b>1</b> YOUR NAME</span><div className="textinput"><input value={design.name} maxLength={10} onChange={e=>patch("name",e.target.value.replace(/[^A-Za-z0-9]/g,""))}/><small>{design.name.length}/10</small></div><small>Letters and numbers only</small></label></section>
     <section className={`field mobile-config-step ${mobileStage===1?"active":""}`} data-mobile-stage="1"><button type="button" className="mobile-step-summary" onClick={()=>selectMobileStage(1)}><b>2</b><span>TYPEFACE</span><small>{design.font}</small></button><div className="mobile-step-content"><span><b>2</b> TYPEFACE</span><div className="fontgrid">{FONTS.map(f=><button key={f} className={design.font===f?"selected":""} onClick={()=>patch("font",f)}><strong className={`font-${f.toLowerCase().replaceAll(" ","-")}`}>Aa</strong><small>{f}</small></button>)}</div></div></section>
     <section className={`field mobile-config-step mobile-colour-step ${mobileStage===2?"active":""}`} data-mobile-stage="2"><button type="button" className="mobile-step-summary" onClick={()=>selectMobileStage(2)}><b>3</b><span>COLOURS</span><small><i style={{background:design.baseColor}}/><i style={{background:design.topColor}}/></small></button><div className="mobile-step-content"><div className="colour-field"><span><b>3</b> BASE COLOUR</span><div className="swatches">{COLORS.map(c=><button key={c.value} aria-label={c.name} title={c.name} className={design.baseColor===c.value?"selected":""} style={{background:c.value}} onClick={()=>patch("baseColor",c.value)}/>)}</div></div><div className="colour-field"><span><b>4</b> FACE COLOUR</span><div className="swatches">{COLORS.map(c=><button key={c.value} aria-label={c.name} title={c.name} className={design.topColor===c.value?"selected":""} style={{background:c.value}} onClick={()=>patch("topColor",c.value)}/>)}</div></div></div></section>
     <section className={`field mobile-config-step ${mobileStage===3?"active":""}`} data-mobile-stage="3"><button type="button" className="mobile-step-summary" onClick={()=>selectMobileStage(3)}><b>4</b><span>ICON</span><small>{design.avatarSelection?"Custom avatar":design.icon}</small></button><div className="mobile-step-content"><span><b>5</b> ICON</span><small>Choose a preset icon or create your own avatar.</small><div className="icon-choices">{(["flower","cat","paw","cloud","file","heart","star","thunder","bow-tie","crown"] as const).map(icon=><button key={icon} aria-label={`${icon} icon`} title={icon} className={`icon-choice ${design.icon===icon?"selected":""}`} onClick={()=>selectDefaultIcon(icon)}><img src={`/icon/presets/${icon}.svg`} alt=""/></button>)}<button className={`icon-choice avatar-choice ${design.avatarSelection?"selected":""}`} onClick={()=>setAvatarOpen(true)}><strong>{design.avatarSelection?"✎":"＋"}</strong><small>{design.avatarSelection?"EDIT YOUR AVATAR":"CREATE YOUR AVATAR"}</small></button></div>{design.avatarSelection&&<button className="avatar-remove" onClick={removeAvatar}>REMOVE AVATAR</button>}<div className="icon-size"><label htmlFor="icon-size"><span>ICON SIZE</span><strong>{Math.round((design.iconScale??1)*100)}%</strong></label><input id="icon-size" type="range" min="0.7" max="1.5" step="0.05" value={design.iconScale??1} onChange={e=>patch("iconScale",Number(e.target.value))}/></div></div></section>
    </aside>
    <div className="preview-wrap">
      <div className="preview-top"><span>LIVE 3D PREVIEW</span><span className="measure">{layout.width.toFixed(0)} × {layout.height} × 5 mm</span></div>
      <Preview3D design={design}/>
      <div className="preview-note"><span>Drag to rotate · Right-drag to pan · Scroll to zoom</span></div>
      {error&&<p className="error">{error}</p>}
      {step==="design"?<button className="continue order-continue desktop-order-continue" disabled={!design.name} onClick={addCurrent}>{editingId?"UPDATE DESIGN":"ADD TO ORDER"} <span>→</span></button>:step==="cart"?<div className="orderform"><div className="formtitle"><h3>Your order</h3></div><div className="order-cart">{cart.map((item,index)=><article key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div className="order-item-preview"><Preview3D design={item.design}/></div><div className="order-item-copy"><strong>{item.design.name}</strong><small>{item.design.font}</small></div><label>QTY<input aria-label={`Quantity for ${item.design.name}`} type="number" min="1" max="100" value={item.quantity} onChange={e=>changeItemQuantity(item.id,Number(e.target.value))}/></label><button type="button" onClick={()=>editItem(item)}>EDIT</button><button type="button" onClick={()=>removeItem(item.id)}>REMOVE</button></article>)}</div><button className="add-another" type="button" onClick={addAnother}>＋ ADD ANOTHER DESIGN</button><div className="checkout-summary"><span>ORDER TOTAL</span><b>{cartQuantity} {cartQuantity===1?"TAG":"TAGS"} · HK${cartTotal}</b></div><button className="continue" type="button" disabled={!cart.length} onClick={continueToDetails}>CONTINUE TO YOUR DETAILS <span>→</span></button></div>:
      <form className="orderform" onSubmit={submit}><div className="formtitle"><button type="button" onClick={()=>setStep("cart")}>← BACK TO YOUR ORDER</button><h3>Your details</h3></div><div className="twocol"><label>FULL NAME<input required name="customerName"/></label><label>EMAIL<input required type="email" name="email"/></label><label>PHONE / WHATSAPP<input required name="phone"/></label></div><label>NOTES (OPTIONAL)<textarea name="notes" maxLength={500}/></label><label className="check"><input required name="consent" type="checkbox"/> I agree that my artwork will be stored for order fulfilment.</label><div className="checkout-summary"><span>ORDER TOTAL</span><b>{cartQuantity} {cartQuantity===1?"TAG":"TAGS"} · HK${cartTotal}</b></div><button className="continue" disabled={busy||!cart.length}>{busy?"PLACING ORDER…":"PLACE ORDER"}<span>→</span></button></form>}
    </div>
    {step==="design"&&<div className="mobile-action-bar"><button type="button" className="mobile-back" disabled={mobileStage===0} onClick={()=>selectMobileStage(mobileStage-1)}>← BACK</button><span>{mobileStage+1} / 4</span><button type="button" className="mobile-next" disabled={!design.name} onClick={mobileNext}>{mobileStage===3?(editingId?"UPDATE":"ADD TO ORDER"):"NEXT"} →</button></div>}
   </div>}
  </section>
  <section id="how" className="how"><p className="eyebrow">FROM IDEA TO OBJECT</p>
  {/* <h2>Made slowly.<br/><em>Kept for years.</em></h2> */}
  <div className="steps"><article><b>01</b><h3>Design</h3><p>Choose your name, typeface, colours and a simple icon.</p></article><article><b>02</b><h3>Order & pay</h3><p>Place your order at HK${NAME_TAG_UNIT_PRICE} each and pay with PayMe.</p></article><article><b>03</b><h3>Print</h3><p>Your tag is reviewed, printed in two colours and carefully finished by hand.</p></article></div></section>
  <footer><span>FORM & FABLE</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
  {avatarOpen&&<AvatarMaker initial={design.avatarSelection} onCancel={()=>setAvatarOpen(false)} onApply={applyAvatar}/>}
 </main>
}
