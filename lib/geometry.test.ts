import { describe,expect,it } from "vitest";
import { createTagGeometry } from "./geometry";
import { FONTS } from "./config";

describe("production typefaces",()=>{it("maps every font option to distinct vector geometry",()=>{const signatures=FONTS.map(font=>{const g=createTagGeometry({name:"ANNA",font,baseColor:"#ffffff",topColor:"#000000",icon:"flower",templateVersion:"1"});const pos=g.face.getAttribute("position");let weighted=0;for(let i=0;i<pos.count;i++)weighted+=(i+1)*(pos.getX(i)*1.7+pos.getY(i)*2.3);const signature=`${pos.count}:${weighted.toFixed(2)}`;g.base.dispose();g.face.dispose();g.ring.dispose();return signature});expect(new Set(signatures).size).toBe(FONTS.length)})});
