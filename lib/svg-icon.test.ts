import { describe,expect,it } from "vitest";
import { parseSvgIcon } from "./svg-icon";

describe("SVG production icons",()=>{
  it("preserves filled vector shapes and their holes",()=>{const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" fill-rule="evenodd" d="M10 10h80v80H10z M35 35v30h30V35z"/></svg>';const contours=parseSvgIcon(svg);expect(contours.filter(c=>!c.hole)).toHaveLength(1);expect(contours.filter(c=>c.hole)).toHaveLength(1)});
  it("rejects embedded images",()=>{expect(()=>parseSvgIcon('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><image href="x.png"/></svg>')).toThrow(/simple SVG/)});
  it("uses light shapes as cut-outs before restoring later dark facial details",()=>{const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="#222"/><circle cx="50" cy="50" r="35" fill="white"/><circle cx="50" cy="50" r="6" fill="#222"/></svg>';const contours=parseSvgIcon(svg);expect(new Set(contours.map(c=>c.group)).size).toBe(2);expect(contours.some(c=>c.hole)).toBe(true)});
});
