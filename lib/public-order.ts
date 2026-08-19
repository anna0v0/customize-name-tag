import type { StoredOrder } from "./store";
import { NAME_TAG_UNIT_PRICE, ORDER_CURRENCY } from "./pricing";
import type { DesignConfig } from "./config";
import { designSchema } from "./schema";
import type { OrganizerDesignConfig } from "./organizer";
import type { StandardProductDesign } from "./cart";

export type PublicDesign=DesignConfig|OrganizerDesignConfig|StandardProductDesign;

export type PublicOrderSummary = {
  orderId:string;
  createdAt:string;
  status:StoredOrder["status"];
  quantity:number;
  totalAmount:number;
  currency:string;
  shippingLabel?:string;
  shippingFee?:number;
  designs:Array<{name:string;quantity:number;design:PublicDesign}>;
};

function publicDesign(source:Record<string,unknown>):PublicDesign {
  const parsed=designSchema.safeParse(source);
  if(parsed.success){
    if("productType" in parsed.data)return parsed.data;
    const {iconDataUrl:_,iconAssetId:__,avatarSelection:___,...design}=parsed.data;
    return design;
  }
  return {name:String(source.name??"Name").replace(/[^A-Za-z0-9]/g,"").slice(0,10)||"Name",font:"Sour Gummy Bold",baseColor:"#f4f0e7",topColor:"#1e1f22",icon:"flower",iconScale:1,templateVersion:"1"};
}

export function toPublicOrderSummary(order:StoredOrder):PublicOrderSummary {
  const items=order.items??[{design:order.design,quantity:order.quantity}];
  return {
    orderId:order.id,
    createdAt:order.createdAt,
    status:order.status,
    quantity:order.quantity,
    totalAmount:order.totalAmount??order.quantity*(order.unitPrice??NAME_TAG_UNIT_PRICE),
    currency:order.currency??ORDER_CURRENCY,
    shippingLabel:order.shippingLabel,
    shippingFee:order.shippingFee,
    designs:items.map(item=>({name:String(item.design.name??"Custom name tag"),quantity:item.quantity,design:publicDesign(item.design)})),
  };
}
