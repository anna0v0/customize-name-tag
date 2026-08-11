import ClipperLib from "clipper-lib";
import { ExtrudeGeometry, Shape } from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import helvetiker from "three/examples/fonts/helvetiker_bold.typeface.json";
import optimerBold from "three/examples/fonts/optimer_bold.typeface.json";
import droidSerif from "three/examples/fonts/droid/droid_serif_bold.typeface.json";
import permanentMarker from "./fonts/permanent-marker.typeface.json";
import gochiHand from "./fonts/gochi-hand.typeface.json";
import jua from "./fonts/jua.typeface.json";
import jaro from "./fonts/jaro.typeface.json";
import poppinsExtraBold from "./fonts/poppins-extrabold.typeface.json";
import { DesignConfig, layoutFor, SPECS } from "./config";

const SCALE=1000;
type Point={x:number;y:number};
const fontLoader=new FontLoader();
const vectorFonts:Record<DesignConfig["font"],Parameters<FontLoader["parse"]>[0]>={
  Block:helvetiker,
  Soft:optimerBold,
  Classic:droidSerif,
  "Permanent Marker":permanentMarker,
  "Gochi Hand":gochiHand,
  Jua:jua,
  Jaro:jaro,
  "Poppins ExtraBold":poppinsExtraBold,
};
function selectedFont(font:DesignConfig["font"]):Font{return fontLoader.parse(vectorFonts[font]||helvetiker)}
function polygon(points:Point[]){const s=new Shape();points.forEach((p,i)=>i?s.lineTo(p.x,p.y):s.moveTo(p.x,p.y));s.closePath();return s}
function sampled(shape:Shape){const p=shape.extractPoints(10);return {outer:p.shape.map(v=>({x:v.x,y:v.y})),holes:p.holes.map(h=>h.map(v=>({x:v.x,y:v.y})))}}
function circle(cx:number,cy:number,r:number){const s=new Shape();s.absarc(cx,cy,r,0,Math.PI*2,false);return s}
function uploadedShapes(design:DesignConfig,cx:number,cy:number,size:number){const contours=design.iconContours||[];const groups=new Map<number,Shape>();for(const contour of contours){const points=contour.points.map(p=>({x:cx+p.x*size,y:cy+p.y*size}));if(contour.hole){groups.get(contour.group)?.holes.push(polygon(points))}else groups.set(contour.group,polygon(points))}return[...groups.values()]}
function iconShapes(design:DesignConfig,cx:number,cy:number,size:number):Shape[]{const icon=design.icon;if(icon==="star"){const p:Point[]=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?size*.45:size;p.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r})}return[polygon(p)]}if(icon==="heart"){const s=new Shape();s.moveTo(cx,cy-size*.75);s.bezierCurveTo(cx-size*1.2,cy-size*.05,cx-size*.85,cy+size*.85,cx,cy+size*.35);s.bezierCurveTo(cx+size*.85,cy+size*.85,cx+size*1.2,cy-size*.05,cx,cy-size*.75);return[s]}if(icon==="flower"){return Array.from({length:6},(_,i)=>circle(cx+Math.cos(i*Math.PI/3)*size*.55,cy+Math.sin(i*Math.PI/3)*size*.55,size*.46))}const uploaded=uploadedShapes(design,cx,cy,size);return uploaded.length?uploaded:[circle(cx,cy,size*.82)]}
function transformedText(design:DesignConfig,width:number){const size=SPECS.targetTextHeight;const font=selectedFont(design.font);const name=design.name||"NAME";const raw=font.generateShapes(name,size);const samples=raw.flatMap(s=>sampled(s).outer);const minX=Math.min(...samples.map(p=>p.x)),maxX=Math.max(...samples.map(p=>p.x));const x0=23;const available=width-x0-2;const factor=Math.min(1,available/(maxX-minX));const alignmentName=name.replace(/[gjpqy]/g,"")||name.replace(/[gjpqy]/g,"x");const alignmentSamples=font.generateShapes(alignmentName,size).flatMap(s=>sampled(s).outer);const alignmentMinY=Math.min(...alignmentSamples.map(p=>p.y)),alignmentMaxY=Math.max(...alignmentSamples.map(p=>p.y));const baseline=(23-(alignmentMaxY-alignmentMinY)*factor)/2-alignmentMinY*factor;return raw.map(s=>{const p=sampled(s);const outer=p.outer.map(v=>({x:x0+(v.x-minX)*factor,y:baseline+v.y*factor}));const out=polygon(outer);out.holes=p.holes.map(h=>polygon(h.map(v=>({x:x0+(v.x-minX)*factor,y:baseline+v.y*factor}))));return out})}
function offsetSilhouette(shapes:Shape[],amount:number){const paths=shapes.map(s=>sampled(s).outer.map(p=>({X:Math.round(p.x*SCALE),Y:Math.round(p.y*SCALE)})));const union:ClipperLib.Paths=[];const clipper=new ClipperLib.Clipper();clipper.AddPaths(paths,ClipperLib.PolyType.ptSubject,true);clipper.Execute(ClipperLib.ClipType.ctUnion,union,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);const expanded:ClipperLib.Paths=[];const offset=new ClipperLib.ClipperOffset(2,0.1*SCALE);offset.AddPaths(union,ClipperLib.JoinType.jtRound,ClipperLib.EndType.etClosedPolygon);offset.Execute(expanded,amount*SCALE);const joined:ClipperLib.Paths=[];const finalUnion=new ClipperLib.Clipper();finalUnion.AddPaths(expanded,ClipperLib.PolyType.ptSubject,true);finalUnion.Execute(ClipperLib.ClipType.ctUnion,joined,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero);return joined.map(path=>polygon(path.map(p=>({x:p.X/SCALE,y:p.Y/SCALE}))))}
export function createTagGeometry(design:DesignConfig){const layout=layoutFor(design.name);const text=transformedText(design,layout.width);const icons=iconShapes(design,14,11.5,5.2*(design.iconScale??1));const faces=[...icons,...text];const baseShapes=offsetSilhouette(faces,SPECS.outline);const base=new ExtrudeGeometry(baseShapes,{depth:SPECS.baseDepth,bevelEnabled:false,curveSegments:8});const overlap=.05;const face=new ExtrudeGeometry(faces,{depth:SPECS.faceDepth+overlap,bevelEnabled:false,curveSegments:8});face.translate(0,0,SPECS.baseDepth-overlap);const ringShape=circle(2.1,11.5,SPECS.holeDiameter/2+1.6);ringShape.holes.push(circle(2.1,11.5,SPECS.holeDiameter/2));const ring=new ExtrudeGeometry(ringShape,{depth:SPECS.baseDepth,bevelEnabled:false,curveSegments:24});return{base,face,ring,layout}}
