export const ORGANIZER_VARIANTS=[{
  id:"sample-organizer",
  name:"Sample Organizer",
  width:200,
  depth:83.5,
  height:30,
  price:80,
}] as const;

export type OrganizerVariantId=typeof ORGANIZER_VARIANTS[number]["id"];
export type OrganizerDesignConfig={
  productType:"beyblade-organizer";
  variant:OrganizerVariantId;
  name:string;
  color:string;
  width:number;
  depth:number;
  height:number;
  price:number;
  templateVersion:"1";
};

export function organizerVariant(id:string){return ORGANIZER_VARIANTS.find(item=>item.id===id)??ORGANIZER_VARIANTS[0]}
