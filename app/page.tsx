"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { COLORS, FONTS, DesignConfig, layoutFor } from "@/lib/config";
import type {AvatarSelection} from "@/lib/avatar";

const Preview3D = dynamic(() => import("@/components/Preview3D"), { ssr:false, loading:()=> <div className="loading">Building your preview…</div> });
const AvatarMaker = dynamic(() => import("@/components/AvatarMaker"), { ssr:false });
type Step = "design"|"details"|"done";

export default function Home(){
 const [step,setStep]=useState<Step>("design");
 const [design,setDesign]=useState<DesignConfig>({name:"Milo",font:"Gochi Hand",baseColor:"#f4f0e7",topColor:"#1e1f22",icon:"flower",iconScale:1,templateVersion:"1"});
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [orderId,setOrderId]=useState("");
 const [avatarOpen,setAvatarOpen]=useState(false);
 const layout=useMemo(()=>layoutFor(design.name),[design.name]);
 function patch<K extends keyof DesignConfig>(key:K,value:DesignConfig[K]){setDesign(d=>({...d,[key]:value}));}
 function selectDefaultIcon(icon:Exclude<DesignConfig["icon"],"upload">){setDesign(d=>({...d,icon,iconDataUrl:undefined,iconAssetId:undefined,iconContours:undefined,avatarSelection:undefined}))}
 async function uploadAvatar(file:File,avatarSelection:AvatarSelection){setError("");const fd=new FormData();fd.append("file",file);const res=await fetch("/api/uploads/icon",{method:"POST",body:fd});const data=await res.json();if(!res.ok){setError(data.error);return false;}setDesign(d=>({...d,icon:"upload",iconDataUrl:data.dataUrl,iconAssetId:data.assetId,iconContours:data.contours,avatarSelection}));return true;}
 async function applyAvatar(selection:AvatarSelection,svg:string){const accepted=await uploadAvatar(new File([svg],"custom-avatar.svg",{type:"image/svg+xml"}),selection);if(accepted)setAvatarOpen(false)}
 function removeAvatar(){setDesign(d=>({...d,icon:"flower",iconDataUrl:undefined,iconAssetId:undefined,iconContours:undefined,avatarSelection:undefined}))}
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);const payload={customerName:f.get("customerName"),email:f.get("email"),phone:f.get("phone"),quantity:Number(f.get("quantity")),notes:f.get("notes"),consent:f.get("consent")=== "on",design};const res=await fetch("/api/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();setBusy(false);if(!res.ok){setError(data.error||"We could not submit your request.");return;}setOrderId(data.orderId);setStep("done");}
 return <main>
  <nav><a className="brand" href="#">FORM <i>&</i> FABLE</a><div className="navlinks"><a href="#maker">DESIGN</a><a href="#how">HOW IT WORKS</a></div><button className="bag">BESPOKE 3D PRINTS</button></nav>
  <header className="hero"><div><p className="eyebrow">MADE BY YOU · PRINTED BY US</p><h1>Your name,<br/><em>made tangible.</em></h1><p className="intro">Design a one-of-a-kind name tag in minutes.</p></div><img className="hero-art" src="/images/roro-magic.png" alt="Roro Magic"/></header>
  <section id="maker" className="maker">
   <div className="section-head"><span>01</span><h2>Make it yours</h2></div>
   {step==="done" ? <div className="success"><div className="success-mark">✓</div><p className="eyebrow">REQUEST RECEIVED</p><h2>We’ll take it from here.</h2><p>Your order reference is <strong>{orderId}</strong>. We’ll review the production model and contact you with a quote before anything is printed.</p><button onClick={()=>setStep("design")}>DESIGN ANOTHER</button></div> : <div className="studio">
    <aside className="controls">
     <label className="field"><span><b>1</b> YOUR NAME</span><div className="textinput"><input value={design.name} maxLength={10} onChange={e=>patch("name",e.target.value.replace(/[^A-Za-z0-9]/g,""))}/><small>{design.name.length}/10</small></div><small>Letters and numbers only</small></label>
     <div className="field"><span><b>2</b> TYPEFACE</span><div className="fontgrid">{FONTS.map(f=><button key={f} className={design.font===f?"selected":""} onClick={()=>patch("font",f)}><strong className={`font-${f.toLowerCase().replaceAll(" ","-")}`}>Aa</strong><small>{f}</small></button>)}</div></div>
     <div className="field"><span><b>3</b> BASE COLOUR</span><div className="swatches">{COLORS.map(c=><button key={c.value} aria-label={c.name} title={c.name} className={design.baseColor===c.value?"selected":""} style={{background:c.value}} onClick={()=>patch("baseColor",c.value)}/>)}</div></div>
     <div className="field"><span><b>4</b> FACE COLOUR</span><div className="swatches">{COLORS.map(c=><button key={c.value} aria-label={c.name} title={c.name} className={design.topColor===c.value?"selected":""} style={{background:c.value}} onClick={()=>patch("topColor",c.value)}/>)}</div></div>
     <div className="field"><span><b>5</b> ICON</span><small>Choose a preset icon or create your own avatar.</small><div className="icon-choices">{(["flower","cat","paw","cloud","file","heart","star","thunder"] as const).map(icon=><button key={icon} aria-label={`${icon} icon`} className={`icon-choice ${design.icon===icon?"selected":""}`} onClick={()=>selectDefaultIcon(icon)}><img src={`/icon/presets/${icon}.svg`} alt=""/><small>{icon.toUpperCase()}</small></button>)}<button className={`icon-choice avatar-choice ${design.avatarSelection?"selected":""}`} onClick={()=>setAvatarOpen(true)}><strong>{design.avatarSelection?"✎":"＋"}</strong><small>{design.avatarSelection?"EDIT YOUR AVATAR":"CREATE YOUR AVATAR"}</small></button></div>{design.avatarSelection&&<button className="avatar-remove" onClick={removeAvatar}>REMOVE AVATAR</button>}<div className="icon-size"><label htmlFor="icon-size"><span>ICON SIZE</span><strong>{Math.round((design.iconScale??1)*100)}%</strong></label><input id="icon-size" type="range" min="0.7" max="1.5" step="0.05" value={design.iconScale??1} onChange={e=>patch("iconScale",Number(e.target.value))}/></div></div>
    </aside>
    <div className="preview-wrap">
      <div className="preview-top"><span>LIVE 3D PREVIEW</span><span className="measure">{layout.width.toFixed(0)} × {layout.height} × 5 mm</span></div>
      <Preview3D design={design}/>
      <div className="preview-note"><span>↻ Drag to rotate · Right-drag to pan · Scroll to zoom</span></div>
      {error&&<p className="error">{error}</p>}
      {step==="design"?<button className="continue order-continue" disabled={!design.name} onClick={()=>setStep("details")}>CONTINUE TO ORDER REQUEST <span>→</span></button>:
      <form className="orderform" onSubmit={submit}><div className="formtitle"><button type="button" onClick={()=>setStep("design")}>← BACK</button><h3>Your details</h3></div><div className="twocol"><label>FULL NAME<input required name="customerName"/></label><label>EMAIL<input required type="email" name="email"/></label><label>PHONE / WHATSAPP<input required name="phone"/></label><label>QUANTITY<input required type="number" name="quantity" min="1" max="100" defaultValue="1"/></label></div><label>NOTES (OPTIONAL)<textarea name="notes" maxLength={500}/></label><label className="check"><input required name="consent" type="checkbox"/> I agree that my artwork will be stored for order fulfilment.</label><button className="continue" disabled={busy}>{busy?"SUBMITTING…":"SUBMIT ORDER REQUEST"}<span>→</span></button></form>}
    </div>
   </div>}
  </section>
  <section id="how" className="how"><p className="eyebrow">FROM IDEA TO OBJECT</p><h2>Made slowly.<br/><em>Kept for years.</em></h2><div className="steps"><article><b>01</b><h3>Design</h3><p>Choose your name, typeface, colours and a simple icon.</p></article><article><b>02</b><h3>Review</h3><p>We inspect every model and confirm your quote before printing.</p></article><article><b>03</b><h3>Print</h3><p>Your tag is printed in two colours and carefully finished by hand.</p></article></div></section>
  <footer><span>FORM & FABLE</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
  {avatarOpen&&<AvatarMaker initial={design.avatarSelection} onCancel={()=>setAvatarOpen(false)} onApply={applyAvatar}/>}
 </main>
}
