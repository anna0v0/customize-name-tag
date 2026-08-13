import { describe,expect,it } from "vitest";
import { iconPlacement, layoutFor } from "./config";
describe("name tag layout",()=>{
 it("keeps short names at the target height and shrinks the base",()=>{const a=layoutFor("MAX"),b=layoutFor("ALEXANDER1");expect(a.scale).toBe(1);expect(a.textHeight).toBe(16);expect(a.width).toBeLessThan(b.width)});
 it("never exceeds the production envelope",()=>{for(const n of ["A","MAX","ALEXANDER1"]){const l=layoutFor(n);expect(l.width).toBeLessThanOrEqual(80);expect(l.height).toBeLessThanOrEqual(30)}});
 it("normalises unsafe names for layout",()=>expect(layoutFor("A! B@").safe).toBe("AB"));
 it("adjusts the tag width with the icon size",()=>{expect(layoutFor("Milo",.7).width).toBeLessThan(layoutFor("Milo",1).width);expect(layoutFor("Milo",1.5).width).toBeGreaterThan(layoutFor("Milo",1).width)});
 it("moves both the icon and name away from the ring as the icon grows",()=>{const small=iconPlacement(.7),large=iconPlacement(1.5);expect(large.centerX).toBeGreaterThan(small.centerX);expect(large.textX).toBeGreaterThan(small.textX)});
 it("keeps the requested ring, icon and text gaps",()=>{const placement=iconPlacement(1);const ringRight=2.1+2.5+1.6;const iconLeft=placement.centerX-6.24;const iconRight=placement.centerX+6.24;expect(iconLeft-ringRight).toBeCloseTo(1.2);expect(placement.textX-iconRight).toBeCloseTo(2.2)});
});
