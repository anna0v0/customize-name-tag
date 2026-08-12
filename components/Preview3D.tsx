"use client";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect,useMemo } from "react";
import { MOUSE } from "three";
import { DesignConfig } from "@/lib/config";
import { createTagGeometry } from "@/lib/geometry";

function Model({design}:{design:DesignConfig}){const model=useMemo(()=>createTagGeometry(design),[design]);useEffect(()=>()=>{model.base.dispose();model.face.dispose();model.ring.dispose()},[model]);const center=model.layout.width/2;return <group scale={.1} position={[-center*.1,0,0]} rotation={[-.18,0,.02]}><mesh geometry={model.base} castShadow receiveShadow><meshStandardMaterial color={design.baseColor} roughness={.7}/></mesh><mesh geometry={model.ring} castShadow><meshStandardMaterial color={design.baseColor} roughness={.7}/></mesh><mesh geometry={model.face} castShadow><meshStandardMaterial color={design.topColor} roughness={.62}/></mesh></group>}
export default function Preview3D({design}:{design:DesignConfig}){return <div className="canvas" onContextMenu={event=>event.preventDefault()}><Canvas camera={{position:[0,5.5,8.5],fov:35}} shadows gl={{antialias:true,alpha:false}}><color attach="background" args={["#d9d5cb"]}/><ambientLight intensity={2}/><directionalLight position={[4,7,6]} intensity={3} castShadow/><Model design={design}/><ContactShadows position={[0,-2.15,0]} opacity={.3} scale={13} blur={2.3}/><OrbitControls enablePan mouseButtons={{LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} minDistance={6} maxDistance={14}/></Canvas></div>}
