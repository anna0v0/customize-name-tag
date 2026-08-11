import { describe,expect,it } from "vitest";
import { createTagGeometry } from "./geometry";
import { FONTS } from "./config";

describe("production typefaces",()=>{it("maps every font option to distinct vector geometry",()=>{const signatures=FONTS.map(font=>{const g=createTagGeometry({name:"ANNA",font,baseColor:"#ffffff",topColor:"#000000",icon:"flower",templateVersion:"1"});const pos=g.face.getAttribute("position");let weighted=0;for(let i=0;i<pos.count;i++)weighted+=(i+1)*(pos.getX(i)*1.7+pos.getY(i)*2.3);const signature=`${pos.count}:${weighted.toFixed(2)}`;g.base.dispose();g.face.dispose();g.ring.dispose();return signature});expect(new Set(signatures).size).toBe(FONTS.length)})});

describe("text baseline",()=>{it("does not move existing letters upward when a descender is added",()=>{const top=(name:string)=>{const g=createTagGeometry({name,font:"Jaro",baseColor:"#ffffff",topColor:"#000000",icon:"flower",templateVersion:"1"});const p=g.face.getAttribute("position");let max=-Infinity;for(let i=0;i<p.count;i++)if(p.getX(i)>23)max=Math.max(max,p.getY(i));g.base.dispose();g.face.dispose();g.ring.dispose();return max};expect(top("winny")).toBeCloseTo(top("winn"),5)})});

describe("visual centering",()=>{it("centres Poppins capitals independently of font em-box padding",()=>{const g=createTagGeometry({name:"NAME",font:"Poppins ExtraBold",baseColor:"#ffffff",topColor:"#000000",icon:"flower",templateVersion:"1"});const p=g.face.getAttribute("position");let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++)if(p.getX(i)>23){min=Math.min(min,p.getY(i));max=Math.max(max,p.getY(i))}g.base.dispose();g.face.dispose();g.ring.dispose();expect((min+max)/2).toBeCloseTo(11.5,5)})});
