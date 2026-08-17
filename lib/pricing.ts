export const NAME_TAG_UNIT_PRICE = 50;
export const ORGANIZER_UNIT_PRICE = 80;
export const ORDER_CURRENCY = "HKD" as const;
export const SHIPPING_OPTIONS = {
  "sf-express": { label: "SF Express — Pay on delivery", price: 20 },
  "local-mail": { label: "Local mail", price: 10 },
} as const;
export type ShippingMethod = keyof typeof SHIPPING_OPTIONS;

export function shippingPrice(method: ShippingMethod) {
  return SHIPPING_OPTIONS[method].price;
}

export function nameTagOrderTotal(quantity: number) {
  return quantity * NAME_TAG_UNIT_PRICE;
}

export function nameTagItemsTotal(items: Array<{ quantity: number }>) {
  return nameTagOrderTotal(items.reduce((total, item) => total + item.quantity, 0));
}

export function orderItemsTotal(items:Array<{quantity:number;design:Record<string,unknown>}>){return items.reduce((total,item)=>total+item.quantity*(item.design.productType==="beyblade-organizer"?ORGANIZER_UNIT_PRICE:NAME_TAG_UNIT_PRICE),0)}
