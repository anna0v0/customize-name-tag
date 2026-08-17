"use client";
import { Canvas } from "@react-three/fiber";
import { ContactShadows,OrbitControls,RoundedBox } from "@react-three/drei";
import { MOUSE } from "three";
import type { OrganizerDesignConfig } from "@/lib/organizer";

function Part({position,args,color,radius=.08}:{position:[number,number,number];args:[number,number,number];color:string;radius?:number}){return <RoundedBox position={position} args={args} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.72}/></RoundedBox>}

function Organizer({design}:{design:OrganizerDesignConfig}){
 const s=.035,w=design.width*s,d=design.depth*s,h=design.height*s,wall=3*s,floor=3*s;const frontZone=58*s;const gridLength=w-frontZone-wall;
 return <group rotation={[-.28,0,.04]}>
  <Part position={[0,floor/2,0]} args={[w,floor,d]} color={design.color} radius={.16}/>
  <Part position={[0,h/2,-d/2+wall/2]} args={[w,h,wall]} color={design.color}/><Part position={[0,h/2,d/2-wall/2]} args={[w,h,wall]} color={design.color}/>
  <Part position={[-w/2+wall/2,h/2,0]} args={[wall,h,d]} color={design.color}/><Part position={[w/2-wall/2,h/2,0]} args={[wall,h,d]} color={design.color}/>
  <Part position={[-w/2+frontZone,h/2,0]} args={[wall,h,d-wall*2]} color={design.color}/><Part position={[-w/2+frontZone+gridLength/2,h/2,0]} args={[gridLength,h,wall]} color={design.color}/>
  {[1,2,3,4,5].map(row=><Part key={row} position={[-w/2+frontZone+row*gridLength/6,h/2,0]} args={[wall,h,d-wall*2]} color={design.color}/>)}
  <Part position={[-w/2+frontZone/2,h/2,0]} args={[frontZone-wall,h,wall]} color={design.color}/><Part position={[-w/2+frontZone*.54,h/2,-d/4]} args={[wall,h,d/2-wall]} color={design.color}/>
  <Part position={[-w/2+frontZone*.27,h/2,-d/4]} args={[wall,h,d/2-wall]} color={design.color}/>
  {Array.from({length:8},(_,index)=><mesh key={index} position={[-w/2+(12+(index%2)*14)*s,floor+.012,(8+Math.floor(index/2)*11)*s]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[4.1*s,4.1*s,.025,24]}/><meshStandardMaterial color="#090b0c" roughness={1}/></mesh>)}
 </group>
}

export default function OrganizerPreview3D({design,compact=false}:{design:OrganizerDesignConfig;compact?:boolean}){return <div className={`canvas organizer-canvas ${compact?"compact":""}`} onContextMenu={event=>event.preventDefault()}><Canvas camera={{position:[6.8,7.2,8.6],fov:compact?43:38}} shadows><color attach="background" args={[compact?"#222729":"#282c2f"]}/><ambientLight intensity={2.2}/><directionalLight position={[4,8,7]} intensity={3.2} castShadow/><Organizer design={design}/><ContactShadows position={[0,-.1,0]} opacity={.5} color="#050607" scale={14} blur={2.5}/>{!compact&&<OrbitControls target={[0,.4,0]} enablePan mouseButtons={{LEFT:MOUSE.ROTATE,MIDDLE:MOUSE.DOLLY,RIGHT:MOUSE.PAN}} minDistance={6} maxDistance={18}/>}</Canvas></div>}
