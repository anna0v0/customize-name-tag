import { z } from "zod";
import type { CartDesign, PlatformCartItem } from "./cart";

const moneySchema=z.object({amount:z.string(),currencyCode:z.string()});
const cartSchema=z.object({id:z.string(),checkoutUrl:z.string().url(),cost:z.object({subtotalAmount:moneySchema,totalAmount:moneySchema})});

export type ShopifyCatalogProduct={
  key:"name-tag"|"beyblade-organizer";
  title:string;
  handle:string;
  description:string;
  available:boolean;
  priceMin:{amount:string;currencyCode:string};
  seo:{title:string|null;description:string|null};
};

export function shopifyIsConfigured(){return Boolean(process.env.SHOPIFY_STORE_DOMAIN&&process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN&&process.env.SHOPIFY_NAME_TAG_VARIANT_ID&&process.env.SHOPIFY_ORGANIZER_VARIANT_ID)}

function domain(){return String(process.env.SHOPIFY_STORE_DOMAIN||"").replace(/^https?:\/\//,"").replace(/\/$/,"")}
function apiVersion(){return process.env.SHOPIFY_API_VERSION||"2026-07"}

let adminTokenCache:{token:string;expiresAt:number}|null=null;

export function shopifyAdminIsConfigured(){
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN&&(
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN||
    (process.env.SHOPIFY_CLIENT_ID&&process.env.SHOPIFY_CLIENT_SECRET)
  ));
}

export async function getShopifyAdminAccessToken(){
  const legacyToken=process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if(legacyToken)return legacyToken;
  if(adminTokenCache&&adminTokenCache.expiresAt>Date.now()+60_000)return adminTokenCache.token;
  const clientId=process.env.SHOPIFY_CLIENT_ID;
  const clientSecret=process.env.SHOPIFY_CLIENT_SECRET;
  if(!domain()||!clientId||!clientSecret)throw new Error("Shopify Admin API is not configured yet.");
  const body=new URLSearchParams({grant_type:"client_credentials",client_id:clientId,client_secret:clientSecret});
  const response=await fetch(`https://${domain()}/admin/oauth/access_token`,{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body,
    signal:AbortSignal.timeout(12_000),
    cache:"no-store",
  });
  const payload=await response.json() as {access_token?:string;expires_in?:number;error?:string;error_description?:string};
  if(!response.ok||!payload.access_token)throw new Error(payload.error_description||payload.error||`Shopify authentication returned ${response.status}.`);
  adminTokenCache={token:payload.access_token,expiresAt:Date.now()+Math.max(60,Number(payload.expires_in||86_399))*1_000};
  return adminTokenCache.token;
}

export async function shopifyAdmin<T>(query:string,variables:Record<string,unknown>={}):Promise<T>{
  if(!shopifyAdminIsConfigured())throw new Error("Shopify Admin API is not configured yet.");
  const request=async()=>{
    const token=await getShopifyAdminAccessToken();
    return fetch(`https://${domain()}/admin/api/${apiVersion()}/graphql.json`,{
      method:"POST",
      headers:{"content-type":"application/json","X-Shopify-Access-Token":token},
      body:JSON.stringify({query,variables}),
      signal:AbortSignal.timeout(12_000),
      cache:"no-store",
    });
  };
  let response=await request();
  if(response.status===401&&!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN){adminTokenCache=null;response=await request()}
  const payload=await response.json() as {data?:T;errors?:Array<{message:string}>};
  if(!response.ok||payload.errors?.length||!payload.data)throw new Error(payload.errors?.[0]?.message||`Shopify Admin API returned ${response.status}.`);
  return payload.data;
}

async function storefront<T>(query:string,variables:Record<string,unknown>={}):Promise<T>{
  if(!shopifyIsConfigured())throw new Error("Shopify is not configured yet.");
  const response=await fetch(`https://${domain()}/api/${apiVersion()}/graphql.json`,{method:"POST",headers:{"content-type":"application/json","X-Shopify-Storefront-Access-Token":String(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN)},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(12_000),next:{revalidate:300}});
  const payload=await response.json() as {data?:T;errors?:Array<{message:string}>};
  if(!response.ok||payload.errors?.length||!payload.data)throw new Error(payload.errors?.[0]?.message||`Shopify returned ${response.status}.`);
  return payload.data;
}

export function variantIdForDesign(design:CartDesign){return "productType" in design?String(process.env.SHOPIFY_ORGANIZER_VARIANT_ID||""):String(process.env.SHOPIFY_NAME_TAG_VARIANT_ID||"")}

export function designSummary(design:CartDesign,designId:string){
  const common=[{key:"Design ID",value:designId},{key:"Template",value:design.templateVersion}];
  if("productType" in design)return [...common,{key:"Product",value:"Beyblade X Organizer"},{key:"Specification",value:design.name},{key:"Colour",value:design.color}];
  return [...common,{key:"Product",value:"Custom Name Tag"},{key:"Name",value:design.name},{key:"Typeface",value:design.font},{key:"Base colour",value:design.baseColor},{key:"Face colour",value:design.topColor}];
}

export async function createShopifyCart(items:Array<PlatformCartItem&{designId:string}>){
  const lines=items.map(item=>({merchandiseId:variantIdForDesign(item.design),quantity:item.quantity,attributes:designSummary(item.design,item.designId)}));
  if(lines.some(line=>!line.merchandiseId))throw new Error("A Shopify product variant is not configured.");
  const data=await storefront<{cartCreate:{cart:unknown;userErrors:Array<{message:string}>}}>(`mutation CreateCart($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl cost{subtotalAmount{amount currencyCode} totalAmount{amount currencyCode}}} userErrors{message}}}`,{input:{lines}});
  if(data.cartCreate.userErrors.length)throw new Error(data.cartCreate.userErrors[0].message);
  return cartSchema.parse(data.cartCreate.cart);
}

export async function getShopifyCatalog():Promise<ShopifyCatalogProduct[]>{
  const ids=[{key:"name-tag" as const,id:process.env.SHOPIFY_NAME_TAG_PRODUCT_ID},{key:"beyblade-organizer" as const,id:process.env.SHOPIFY_ORGANIZER_PRODUCT_ID}].filter(item=>item.id);
  if(!ids.length||!shopifyIsConfigured())return [];
  const results=await Promise.all(ids.map(async item=>{
    const data=await storefront<{product:{title:string;handle:string;description:string;availableForSale:boolean;priceRange:{minVariantPrice:{amount:string;currencyCode:string}};seo:{title:string|null;description:string|null}}|null}>(`query Product($id:ID!){product(id:$id){title handle description availableForSale priceRange{minVariantPrice{amount currencyCode}} seo{title description}}}`,{id:item.id});
    return data.product?{key:item.key,title:data.product.title,handle:data.product.handle,description:data.product.description,available:data.product.availableForSale,priceMin:data.product.priceRange.minVariantPrice,seo:data.product.seo}:null;
  }));
  return results.filter((item):item is ShopifyCatalogProduct=>Boolean(item));
}
