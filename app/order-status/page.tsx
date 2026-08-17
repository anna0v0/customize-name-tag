"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { PublicOrderSummary } from "@/lib/public-order";

const Preview3D=dynamic(()=>import("@/components/Preview3D"),{ssr:false,loading:()=> <div className="loading">Building preview…</div>});

const FLOW=["Submitted","Generating","Pending Review","Awaiting Customer Approval","Confirmed","In Production","Completed"] as const;

function StatusCard({order}:{order:PublicOrderSummary}){
  const [expanded,setExpanded]=useState(false);
  const special=order.status==="Manual Review Required"||order.status==="Cancelled";
  const activeIndex=FLOW.indexOf(order.status as typeof FLOW[number]);
  return <article className="lookup-card">
    <button className="lookup-card-toggle" type="button" aria-expanded={expanded} aria-controls={`order-${order.orderId}`} onClick={()=>setExpanded(value=>!value)}><div><small>ORDER REFERENCE</small><h2>{order.orderId}</h2></div><span className={`lookup-status ${order.status.toLowerCase().replaceAll(" ","-")}`}>{order.status}</span><i aria-hidden="true">{expanded?"−":"＋"}</i></button>
    {expanded&&<div className="lookup-card-content" id={`order-${order.orderId}`}>
      <div className="lookup-meta"><div><small>ORDERED</small><b>{new Intl.DateTimeFormat("en-HK",{dateStyle:"medium"}).format(new Date(order.createdAt))}</b></div><div><small>QUANTITY</small><b>{order.quantity} {order.quantity===1?"TAG":"TAGS"}</b></div><div><small>TOTAL</small><b>{order.currency} ${order.totalAmount}</b></div></div>
      <div className="lookup-designs"><small>DESIGNS</small>{order.designs.map((design,index)=><div key={`${design.name}-${index}`}><span>{String(index+1).padStart(2,"0")}</span><div className="lookup-design-preview"><Preview3D design={design.design}/></div><b>{design.name}</b><small>QTY {design.quantity}</small></div>)}</div>
      {special?<p className="lookup-special">{order.status==="Cancelled"?"This order has been cancelled.":"Your design needs a manual production check. We will contact you if any changes are needed."}</p>:<ol className="status-track">{FLOW.map((status,index)=><li className={index<activeIndex?"complete":index===activeIndex?"current":""} key={status}><i>{index<activeIndex?"✓":index+1}</i><span>{status}</span></li>)}</ol>}
    </div>}
  </article>;
}

export default function OrderStatusPage(){
  const [query,setQuery]=useState("");
  const [orders,setOrders]=useState<PublicOrderSummary[]>([]);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function lookup(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setOrders([]);try{const res=await fetch("/api/orders/lookup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query})});const data=await res.json();if(!res.ok)throw new Error(data.error);setOrders(data.orders)}catch(error){setError(error instanceof Error?error.message:"We could not check your order right now.")}finally{setBusy(false)}}
  return <main className="order-lookup-page">
    <nav><a className="brand" href="/">FORM <i>&</i> FABLE</a><div className="navlinks"><a href="/#products">PRODUCTS</a><a className="active" href="/order-status">ORDER STATUS</a></div></nav>
    <section className="lookup-hero"><p className="eyebrow">TRACK YOUR ORDER</p><h1>Where is my order?</h1><p>Enter your full order reference or the email address used at checkout.</p>
      <form onSubmit={lookup}><label htmlFor="lookup-query">EMAIL OR ORDER REFERENCE</label><div><input id="lookup-query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="you@example.com or FF-2026-ABC123" autoComplete="email"/><button disabled={busy||query.trim().length<3}>{busy?"CHECKING…":"CHECK STATUS →"}</button></div></form>
      {error&&<p className="lookup-error" role="alert">{error}</p>}
    </section>
    {orders.length>0&&<section className="lookup-results"><div className="lookup-results-head"><h2>{orders.length===1?"Your order":"Your orders"}</h2><span>{orders.length} {orders.length===1?"RESULT":"RESULTS"}</span></div>{orders.map(order=><StatusCard key={order.orderId} order={order}/>)}</section>}
    <footer><span>FORM & FABLE</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
  </main>;
}
