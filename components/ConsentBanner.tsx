"use client";
import { useEffect,useState } from "react";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analytics";
export default function ConsentBanner(){const [visible,setVisible]=useState(false);useEffect(()=>setVisible(!localStorage.getItem(ANALYTICS_CONSENT_KEY)),[]);function choose(value:"granted"|"denied"){localStorage.setItem(ANALYTICS_CONSENT_KEY,value);setVisible(false)}if(!visible)return null;return <aside className="consent-banner" aria-label="Analytics preferences"><p><b>YOUR PRIVACY</b><span>Allow anonymous analytics to help us improve the customiser. Essential checkout storage always stays on.</span></p><div><button onClick={()=>choose("denied")}>ESSENTIAL ONLY</button><button className="accept" onClick={()=>choose("granted")}>ALLOW ANALYTICS</button></div></aside>}
