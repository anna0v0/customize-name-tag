import type { DesignConfig } from "./config";
import type { OrganizerDesignConfig } from "./organizer";
import type { z } from "zod";
import type { standardProductDesignSchema } from "./schema";
import { NAME_TAG_UNIT_PRICE } from "./pricing";
import { trackCommerce } from "./analytics";

export const CART_STORAGE_KEY="form-fable-platform-cart-v1";
export const RECEIPT_STORAGE_KEY="form-fable-order-receipt-v1";
export const SHOPIFY_PENDING_CHECKOUT_KEY="oddment-shopify-checkout-v1";
export type StandardProductDesign=z.infer<typeof standardProductDesignSchema>;
export type CartDesign=DesignConfig|OrganizerDesignConfig|StandardProductDesign;
export type PlatformCartItem={id:string;design:CartDesign;quantity:number};

export function designPrice(design:CartDesign){return "productType" in design?design.price:NAME_TAG_UNIT_PRICE}
export function cartQuantity(items:PlatformCartItem[]){return items.reduce((total,item)=>total+item.quantity,0)}
export function cartTotal(items:PlatformCartItem[]){return items.reduce((total,item)=>total+item.quantity*designPrice(item.design),0)}
export function readCart():PlatformCartItem[]{try{const value=JSON.parse(localStorage.getItem(CART_STORAGE_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return[]}}
export function writeCart(items:PlatformCartItem[]){localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(items))}
export function addToCart(design:CartDesign,quantity=1){const items=readCart();items.push({id:crypto.randomUUID(),design,quantity});writeCart(items);trackCommerce("design_added_to_cart",{productType:"productType" in design?design.productType:"name-tag",quantity});return items}
