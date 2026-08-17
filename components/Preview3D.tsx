"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback,useEffect,useMemo,useState } from "react";
import { Box3, MOUSE, Vector3 } from "three";
import { DesignConfig } from "@/lib/config";
import { createTagGeometry } from "@/lib/geometry";

function Model({design,onReady}:{design:DesignConfig;onReady:()=>void}){
 const model=useMemo(()=>createTagGeometry(design),[design]);
 const center=useMemo(()=>{
  const bounds=new Box3();
  for(const geometry of [model.base,model.face,model.ring]){geometry.computeBoundingBox();if(geometry.boundingBox)bounds.union(geometry.boundingBox)}
  return bounds.getCenter(new Vector3());
 },[model]);
 useEffect(()=>{onReady();return()=>{model.base.dispose();model.face.dispose();model.ring.dispose()}},[model,onReady]);
 return <group scale={.1} rotation={[-.18,0,.02]}><group position={[-center.x,-center.y,-center.z]}><mesh geometry={model.base} castShadow receiveShadow><meshStandardMaterial color={design.baseColor} roughness={.7}/></mesh><mesh geometry={model.ring} castShadow><meshStandardMaterial color={design.baseColor} roughness={.7}/></mesh><mesh geometry={model.face} castShadow><meshStandardMaterial color={design.topColor} roughness={.62}/></mesh></group></group>
}
export default function Preview3D({design}:{design:DesignConfig}){const [renderedDesign,setRenderedDesign]=useState(design);const [building,setBuilding]=useState(false);useEffect(()=>{setBuilding(true);const frame=requestAnimationFrame(()=>setRenderedDesign(design));return()=>cancelAnimationFrame(frame)},[design]);const ready=useCallback(()=>requestAnimationFrame(()=>setBuilding(false)),[]);return <div className="canvas" aria-busy={building} onContextMenu={event=>event.preventDefault()}><Canvas camera={{position:[0,5.5,8.5],fov:35}} shadows gl={{antialias:true,alpha:false}}><color attach="background" args={["#282c2f"]}/><ambientLight intensity={2}/><directionalLight position={[4,7,6]} intensity={3} castShadow/><Model design={renderedDesign} onReady={ready}/><OrbitControls makeDefault target={[0,0,0]} enablePan mouseButtons={{LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} minDistance={6} maxDistance={14}/></Canvas>{building&&<div className="preview-loading"><span aria-hidden="true"/><strong>BUILDING 3D PREVIEW</strong></div>}</div>}
