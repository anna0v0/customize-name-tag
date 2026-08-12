import { DOMParser as XmlDomParser } from "@xmldom/xmldom";
import ClipperLib from "clipper-lib";
import { Color } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export type SvgIconContour = { group: number; hole: boolean; points: Array<{ x: number; y: number }> };
const SCALE = 1000;
const forbidden = /<(?:script|style|image|text|foreignObject|use|filter|mask|clipPath|pattern)\b|\bon\w+\s*=|javascript:|data:/i;

function isDark(value?: string) {
  if (!value || value === "none" || value === "transparent") return false;
  try { const color = new Color(value === "currentColor" ? "#000" : value); return color.r * .2126 + color.g * .7152 + color.b * .0722 < .45; }
  catch { return false; }
}
function hasPaint(value?:string){return Boolean(value&&value!=="none"&&value!=="transparent")}
function clipPath(points: Array<{x:number;y:number}>, outer: boolean): ClipperLib.Path {
  const path = points.map(point => ({ X: Math.round(point.x * SCALE), Y: Math.round(point.y * SCALE) }));
  if (ClipperLib.Clipper.Orientation(path) !== outer) path.reverse();
  return path;
}

export function parseSvgIcon(svg: string): SvgIconContour[] {
  if (forbidden.test(svg)) throw new Error("Use a simple SVG made from vector paths and shapes only.");
  if (!/<svg\b[^>]*\bviewBox\s*=\s*["'][^"']+["']/i.test(svg)) throw new Error("The SVG must include a viewBox.");
  const original = globalThis.DOMParser;Object.assign(globalThis,{DOMParser:XmlDomParser});
  try {
    let regions: ClipperLib.Paths = [];
    const combine=(incoming:ClipperLib.Paths,type:ClipperLib.ClipType)=>{if(!incoming.length)return;if(!regions.length){if(type===ClipperLib.ClipType.ctUnion)regions=incoming;return}const solution:ClipperLib.Paths=[];const operation=new ClipperLib.Clipper();operation.AddPaths(regions,ClipperLib.PolyType.ptSubject,true);operation.AddPaths(incoming,type===ClipperLib.ClipType.ctUnion?ClipperLib.PolyType.ptSubject:ClipperLib.PolyType.ptClip,true);operation.Execute(type,solution,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);regions=solution};
    for (const path of new SVGLoader().parse(svg).paths) {
      const style = path.userData?.style || {};
      if(hasPaint(style.fill)){const fill:ClipperLib.Paths=[];for(const shape of SVGLoader.createShapes(path)){const sampled=shape.extractPoints(24);fill.push(clipPath(sampled.shape,true));for(const hole of sampled.holes)fill.push(clipPath(hole,false))}combine(fill,isDark(style.fill)?ClipperLib.ClipType.ctUnion:ClipperLib.ClipType.ctDifference)}
      if(hasPaint(style.stroke)&&Number(style.strokeWidth)>0){const strokes:ClipperLib.Paths=[];for(const subPath of path.subPaths){const stroke=SVGLoader.pointsToStroke(subPath.getPoints(32),style,12,.001);if(!stroke)continue;const position=stroke.getAttribute("position");for(let i=0;i+2<position.count;i+=3)strokes.push(clipPath([{x:position.getX(i),y:position.getY(i)},{x:position.getX(i+1),y:position.getY(i+1)},{x:position.getX(i+2),y:position.getY(i+2)}],true));stroke.dispose()}combine(strokes,isDark(style.stroke)?ClipperLib.ClipType.ctUnion:ClipperLib.ClipType.ctDifference)}
    }
    if(!regions.length)throw new Error("No dark filled shape or stroke was found in this SVG.");
    const tree=new ClipperLib.PolyTree();const clipper=new ClipperLib.Clipper();clipper.AddPaths(regions,ClipperLib.PolyType.ptSubject,true);clipper.Execute(ClipperLib.ClipType.ctUnion,tree,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);
    const raw:Array<{group:number;hole:boolean;path:ClipperLib.Path}>=[];let groups=0;
    const visit=(node:ClipperLib.PolyNode,parentGroup?:number)=>{const hole=node.IsHole();const group=hole&&parentGroup!==undefined?parentGroup:groups++;if(Math.abs(ClipperLib.Clipper.Area(node.Contour()))>4*SCALE)raw.push({group,hole,path:node.Contour()});for(const child of node.Childs())visit(child,group)};
    for(const node of tree.Childs())visit(node);
    if(!raw.length)throw new Error("No printable vector region was found in this SVG.");
    if(groups>32)throw new Error("This SVG is too complex. Use no more than 32 separate regions.");
    const all=raw.flatMap(item=>item.path);const minX=Math.min(...all.map(p=>p.X)),maxX=Math.max(...all.map(p=>p.X)),minY=Math.min(...all.map(p=>p.Y)),maxY=Math.max(...all.map(p=>p.Y));const span=Math.max(maxX-minX,maxY-minY);
    return raw.map(item=>({group:item.group,hole:item.hole,points:item.path.map(p=>({x:((p.X-(minX+maxX)/2)/span)*2,y:(((minY+maxY)/2-p.Y)/span)*2}))}));
  } catch(error) {
    if(error instanceof Error&&/SVG|vector|shape|stroke|region|complex|viewBox/i.test(error.message))throw error;
    throw new Error("We could not read this SVG. Flatten its vector artwork and try again.");
  } finally {Object.assign(globalThis,{DOMParser:original})}
}
