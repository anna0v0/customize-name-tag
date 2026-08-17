export const NAME_TAG_UNIT_PRICE = 50;
export const ORGANIZER_UNIT_PRICE = 80;
export const ORDER_CURRENCY = "HKD" as const;

export function nameTagOrderTotal(quantity: number) {
  return quantity * NAME_TAG_UNIT_PRICE;
}

export function nameTagItemsTotal(items: Array<{ quantity: number }>) {
  return nameTagOrderTotal(items.reduce((total, item) => total + item.quantity, 0));
}

export function orderItemsTotal(items:Array<{quantity:number;design:Record<string,unknown>}>){return items.reduce((total,item)=>total+item.quantity*(item.design.productType==="beyblade-organizer"?ORGANIZER_UNIT_PRICE:NAME_TAG_UNIT_PRICE),0)}
