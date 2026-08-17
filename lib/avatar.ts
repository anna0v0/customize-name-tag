import { CategoryKey, DEFAULT_SELECTION, LAYER_ORDER, VARIANTS } from "./avatar-schema";

export type AvatarSelection = Record<CategoryKey, string>;

export const AVATAR_CATEGORIES: Array<{key:CategoryKey;label:string}> = [
  {key:"head",label:"Face"},
  {key:"hairFront",label:"Front hair"},
  {key:"hairBack",label:"Back hair"},
  {key:"eyes",label:"Eyes"},
  {key:"mouth",label:"Mouth"},
  {key:"blush",label:"Cheeks"},
  {key:"accessoryFace",label:"Face extras"},
];

export function defaultAvatarSelection():AvatarSelection {
  return {...DEFAULT_SELECTION};
}

export function avatarLayers(selection:AvatarSelection) {
  return LAYER_ORDER.filter(layer=>layer!=="bg").map(layer=>VARIANTS[layer as CategoryKey]?.[selection[layer as CategoryKey]]||"");
}

export function avatarSvg(selection:AvatarSelection) {
  const content=avatarLayers(selection).join("\n")
    .replaceAll("var(--line)","#111111")
    .replaceAll("var(--hair)","#222222")
    .replaceAll("var(--skin-dot)","#111111")
    .replaceAll("var(--skin)","#ffffff")
    .replaceAll("currentColor","#111111");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${content}</svg>`;
}
