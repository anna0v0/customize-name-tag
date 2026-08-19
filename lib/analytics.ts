export const ANALYTICS_CONSENT_KEY="oddment-analytics-consent-v1";
export type CommerceEvent="product_viewed"|"customizer_started"|"design_added_to_cart"|"cart_viewed"|"checkout_started";
export function trackCommerce(event:CommerceEvent,data:Record<string,unknown>={}){
  if(typeof window==="undefined"||localStorage.getItem(ANALYTICS_CONSENT_KEY)!=="granted")return;
  const target=window as Window&{dataLayer?:Array<Record<string,unknown>>};target.dataLayer=target.dataLayer||[];target.dataLayer.push({event,...data});
}
