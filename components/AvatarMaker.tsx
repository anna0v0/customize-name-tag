"use client";
import {useState} from "react";
import {AVATAR_CATEGORIES, AvatarSelection, avatarLayers, avatarSvg, defaultAvatarSelection} from "@/lib/avatar";
import {CategoryKey, VARIANTS} from "@/lib/avatar-schema";

export default function AvatarMaker({initial,onCancel,onApply}:{initial?:AvatarSelection;onCancel:()=>void;onApply:(selection:AvatarSelection,svg:string)=>Promise<void>}){
  const [selection,setSelection]=useState<AvatarSelection>({...initial||defaultAvatarSelection()});
  const [active,setActive]=useState<CategoryKey>("head");
  const [busy,setBusy]=useState(false);
  const layers=avatarLayers(selection);
  async function apply(){setBusy(true);try{await onApply(selection,avatarSvg(selection))}finally{setBusy(false)}}
  return <div className="avatar-backdrop" role="dialog" aria-modal="true" aria-label="Avatar maker">
    <div className="avatar-modal">
      <header><div><small>CREATE YOUR ICON</small><h2>Avatar maker</h2></div><button aria-label="Close avatar maker" onClick={onCancel}>×</button></header>
      <div className="avatar-workspace">
        <aside className="avatar-preview-panel"><div className="avatar-preview"><svg viewBox="0 0 1024 1024" aria-label="Avatar preview">{layers.map((svg,i)=><g key={i} dangerouslySetInnerHTML={{__html:svg}}/>)}</svg></div><p>Your avatar will be converted into a single-colour printable icon.</p></aside>
        <section className="avatar-options">
          <div className="avatar-tabs">{AVATAR_CATEGORIES.map(category=><button key={category.key} className={active===category.key?"active":""} onClick={()=>setActive(category.key)}>{category.label}</button>)}</div>
          <div className="avatar-parts">{Object.entries(VARIANTS[active]).map(([id,svg])=><button key={id} className={selection[active]===id?"active":""} aria-label={id} onClick={()=>setSelection(current=>({...current,[active]:id}))}><svg viewBox="0 0 1024 1024"><g dangerouslySetInnerHTML={{__html:svg}}/></svg></button>)}</div>
        </section>
      </div>
      <footer><button className="avatar-cancel" onClick={onCancel}>CANCEL</button><button className="avatar-apply" disabled={busy} onClick={apply}>{busy?"PREPARING ICON…":"USE THIS AVATAR →"}</button></footer>
    </div>
  </div>
}
