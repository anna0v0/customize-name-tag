import { describe,expect,it } from "vitest";
import { layoutFor } from "./config";
describe("name tag layout",()=>{
 it("keeps short names at the target height and shrinks the base",()=>{const a=layoutFor("MAX"),b=layoutFor("ALEXANDER1");expect(a.scale).toBe(1);expect(a.textHeight).toBe(16);expect(a.width).toBeLessThan(b.width)});
 it("never exceeds the production envelope",()=>{for(const n of ["A","MAX","ALEXANDER1"]){const l=layoutFor(n);expect(l.width).toBeLessThanOrEqual(80);expect(l.height).toBeLessThanOrEqual(30)}});
 it("normalises unsafe names for layout",()=>expect(layoutFor("A! B@").safe).toBe("AB"));
});
