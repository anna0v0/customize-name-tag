import { notFound, redirect } from "next/navigation";
import StandardProductBuy from "@/components/StandardProductBuy";
import { getShopifyProduct } from "@/lib/shopify";

export const dynamic="force-dynamic";
export default async function StandardProductPage({params}:{params:Promise<{handle:string}>}){
  const {handle}=await params;const product=await getShopifyProduct(handle);if(!product)notFound();if(product.kind==="name-tag")redirect("/name-tag");if(product.kind==="beyblade-organizer")redirect("/beyblade-organizer");
  return <main className="shared-checkout"><nav><a className="brand" href="/">THE <span className="brand-accent">ODDMENT</span> CLUB</a><div className="navlinks"><a href="/#products">PRODUCTS</a><a href="/about">ABOUT</a><a href="/order-status">ORDER STATUS</a></div></nav><StandardProductBuy product={product}/><footer><span>THE <span className="brand-accent">ODDMENT</span> CLUB</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer></main>;
}
