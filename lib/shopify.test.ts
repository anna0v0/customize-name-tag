import { afterEach,describe,expect,it } from "vitest";
import { designSummary,variantIdForDesign } from "./shopify";
import { createHmac } from "node:crypto";
import { verifyShopifyHmac } from "./shopify-webhook";

const original={...process.env};
afterEach(()=>{process.env={...original}});
describe("Shopify product mapping",()=>{
  it("maps name tags to the trusted server variant",()=>{process.env.SHOPIFY_NAME_TAG_VARIANT_ID="gid://shopify/ProductVariant/1";expect(variantIdForDesign({name:"Milo",font:"Gochi Hand",baseColor:"#ffffff",topColor:"#000000",icon:"flower",templateVersion:"1"})).toBe("gid://shopify/ProductVariant/1")});
  it("only puts a compact design reference and summary in cart attributes",()=>{const attributes=designSummary({name:"Milo",font:"Gochi Hand",baseColor:"#ffffff",topColor:"#000000",icon:"flower",iconDataUrl:"data:image/svg+xml,secret",templateVersion:"1"},"draft-id");expect(attributes).toContainEqual({key:"Design ID",value:"draft-id"});expect(JSON.stringify(attributes)).not.toContain("iconDataUrl");expect(JSON.stringify(attributes)).not.toContain("secret")});
});
describe("Shopify webhook authentication",()=>{it("accepts only an HMAC created with the webhook secret",()=>{process.env.SHOPIFY_WEBHOOK_SECRET="test-secret";const body=JSON.stringify({id:123});const hmac=createHmac("sha256","test-secret").update(body).digest("base64");expect(verifyShopifyHmac(body,hmac)).toBe(true);expect(verifyShopifyHmac(body,"invalid")).toBe(false);delete process.env.SHOPIFY_WEBHOOK_SECRET});it("uses the Dev Dashboard client secret when no override exists",()=>{process.env.SHOPIFY_CLIENT_SECRET="client-secret";const body=JSON.stringify({id:456});const hmac=createHmac("sha256","client-secret").update(body).digest("base64");expect(verifyShopifyHmac(body,hmac)).toBe(true);delete process.env.SHOPIFY_CLIENT_SECRET})});
