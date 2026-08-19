import { z } from "zod";
import type { CartDesign, PlatformCartItem } from "./cart";

const moneySchema=z.object({amount:z.string(),currencyCode:z.string()});
const cartSchema=z.object({id:z.string(),checkoutUrl:z.string().url(),cost:z.object({subtotalAmount:moneySchema,totalAmount:moneySchema})});

export type ShopifyCatalogProduct={
  key:string;
  kind:"name-tag"|"beyblade-organizer"|"standard";
  id:string;
  title:string;
  handle:string;
  description:string;
  available:boolean;
  priceMin:{amount:string;currencyCode:string};
  featuredImage:{url:string;altText:string|null}|null;
  variants:Array<{id:string;title:string;available:boolean;price:{amount:string;currencyCode:string};selectedOptions:Array<{name:string;value:string}>;image:{url:string;altText:string|null}|null}>;
  seo:{title:string|null;description:string|null};
};

export function shopifyIsConfigured(){return Boolean(process.env.SHOPIFY_STORE_DOMAIN&&process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN)}

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

export function isStandardProduct(design:CartDesign):design is Extract<CartDesign,{productType:"shopify-standard"}>{return "productType" in design&&design.productType==="shopify-standard"}
export function isOrganizer(design:CartDesign):design is Extract<CartDesign,{productType:"beyblade-organizer"}>{return "productType" in design&&design.productType==="beyblade-organizer"}
export function variantIdForDesign(design:CartDesign){return isOrganizer(design)?String(process.env.SHOPIFY_ORGANIZER_VARIANT_ID||""):String(process.env.SHOPIFY_NAME_TAG_VARIANT_ID||"")}

export function designSummary(design:Exclude<CartDesign,{productType:"shopify-standard"}>,designId:string){
  const common=[{key:"Design ID",value:designId},{key:"Template",value:design.templateVersion}];
  if(isOrganizer(design))return [...common,{key:"Product",value:"Beyblade X Organizer"},{key:"Specification",value:design.name},{key:"Colour",value:design.color}];
  return [...common,{key:"Product",value:"Custom Name Tag"},{key:"Name",value:design.name},{key:"Typeface",value:design.font},{key:"Base colour",value:design.baseColor},{key:"Face colour",value:design.topColor}];
}

async function resolveStandardVariant(design:Extract<CartDesign,{productType:"shopify-standard"}>){
  const data=await storefront<{product:{variants:{nodes:Array<{id:string;title:string;availableForSale:boolean;selectedOptions:Array<{name:string;value:string}>}>}}|null}>(`query StandardProduct($handle:String!){product(handle:$handle){variants(first:100){nodes{id title availableForSale selectedOptions{name value}}}}}`,{handle:design.handle});
  if(!data.product)throw new Error(`Shopify product “${design.name}” is unavailable.`);
  const wanted=new Map(design.selectedOptions.map(option=>[option.name,option.value]));
  const variant=data.product.variants.nodes.find(item=>item.selectedOptions.length===wanted.size&&item.selectedOptions.every(option=>wanted.get(option.name)===option.value));
  if(!variant||!variant.availableForSale)throw new Error(`The selected “${design.variantTitle}” option is unavailable.`);
  return variant.id;
}

export async function createShopifyCart(items:Array<PlatformCartItem&{designId:string}>){
  const lines=await Promise.all(items.map(async item=>isStandardProduct(item.design)?{merchandiseId:await resolveStandardVariant(item.design),quantity:item.quantity,attributes:[{key:"Design ID",value:item.designId},{key:"Product type",value:"Standard product"},{key:"Product handle",value:item.design.handle}]}:{merchandiseId:variantIdForDesign(item.design),quantity:item.quantity,attributes:designSummary(item.design,item.designId)}));
  if(lines.some(line=>!line.merchandiseId))throw new Error("A Shopify product variant is not configured.");
  const data=await storefront<{cartCreate:{cart:unknown;userErrors:Array<{message:string}>}}>(`mutation CreateCart($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl cost{subtotalAmount{amount currencyCode} totalAmount{amount currencyCode}}} userErrors{message}}}`,{input:{lines}});
  if(data.cartCreate.userErrors.length)throw new Error(data.cartCreate.userErrors[0].message);
  return cartSchema.parse(data.cartCreate.cart);
}

export async function getShopifyCatalog():Promise<ShopifyCatalogProduct[]>{
  if(!shopifyIsConfigured())return [];
  type Node={id:string;title:string;handle:string;description:string;availableForSale:boolean;featuredImage:{url:string;altText:string|null}|null;priceRange:{minVariantPrice:{amount:string;currencyCode:string}};variants:{nodes:Array<{id:string;title:string;availableForSale:boolean;price:{amount:string;currencyCode:string};selectedOptions:Array<{name:string;value:string}>;image:{url:string;altText:string|null}|null}>};seo:{title:string|null;description:string|null}};
  const data=await storefront<{products:{nodes:Node[]}}>(`query Catalog{products(first:50,sortKey:CREATED_AT){nodes{id title handle description availableForSale featuredImage{url altText} priceRange{minVariantPrice{amount currencyCode}} variants(first:100){nodes{id title availableForSale price{amount currencyCode} selectedOptions{name value} image{url altText}}} seo{title description}}}}`);
  return data.products.nodes.map(product=>{const kind=product.id===process.env.SHOPIFY_NAME_TAG_PRODUCT_ID||product.handle==="custom-name-tag"?"name-tag":product.id===process.env.SHOPIFY_ORGANIZER_PRODUCT_ID||product.handle==="beyblade-x-organizer"?"beyblade-organizer":"standard";return {key:kind==="standard"?product.handle:kind,kind,id:product.id,title:product.title,handle:product.handle,description:product.description,available:product.availableForSale,priceMin:product.priceRange.minVariantPrice,featuredImage:product.featuredImage,variants:product.variants.nodes.map(variant=>({...variant,available:variant.availableForSale})),seo:product.seo}});
}

export async function getShopifyProduct(handle:string){return (await getShopifyCatalog()).find(product=>product.handle===handle)??null}
