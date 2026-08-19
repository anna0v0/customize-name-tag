# The Oddment Club — Headless Shopify 3D Customiser

Next.js storefront for designing personalised 3D products. Three.js renders the previews, Firebase stores immutable design snapshots and production records, Shopify owns products, prices, checkout, payment, shipping and customer order status.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The Firebase-authenticated Production Desk is at `/admin`.

Without Shopify environment variables, the storefront and customisers still render, but secure checkout returns a setup error. It never falls back to the retired PayMe flow.

## Shopify setup

1. Create a Hong Kong Shopify store with HKD as the store currency and enable guest checkout.
2. Create `Custom Name Tag` with a standard HK$50 variant.
3. Create `Beyblade X Organizer`; use variants for every specification that changes price or dimensions. The initial Sample Organizer is HK$80.
4. Add both products to the Headless sales channel and copy the product and variant GIDs into Vercel.
5. Create a Storefront API token and set `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
6. Configure Hong Kong-only delivery with `Local Mail` at HK$10. Add SF Express later through a pickup-point-capable Shopify app.
7. Create a Dev Dashboard app, install it on the store, and set `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`. The server exchanges them for a short-lived Admin API token and refreshes it automatically.
8. Create webhook subscriptions pointing to `https://YOUR_DOMAIN/api/webhooks/shopify` for:
   - `orders/paid`
   - `orders/cancelled`
   - `refunds/create`
9. Webhook HMAC uses `SHOPIFY_CLIENT_SECRET` by default. `SHOPIFY_WEBHOOK_SECRET` is only an optional override. Use the exact `*.myshopify.com` domain in `SHOPIFY_STORE_DOMAIN`.
10. Complete Shopify Payments business verification, use test payments first, then run one low-value live smoke test.

All Shopify and Firebase secrets belong in Vercel Production/Preview environment variables. Never prefix the Client secret or webhook secret with `NEXT_PUBLIC_`.

## Commerce and production flow

`Your Order` posts validated designs to `/api/shopify/checkout`. The server stores seven-day `designDrafts`, maps product types to trusted Shopify variant GIDs and returns Shopify's `checkoutUrl`. Full SVG/avatar/mesh data never enters Shopify line attributes.

An authenticated `orders/paid` webhook creates a `productionOrders` record and schedules one 3MF per unique design. Quantity remains on the production item. Model results are recorded per item and the overall order becomes `Pending Review` or `Manual Review Required`.

Shopify order numbers are customer-facing. Internal `FF-...` references remain available in Production Desk. Staff fulfil and add tracking in Shopify; customers use the secure order-status link in their Shopify email.

Vercel calls `/api/cron/cleanup-drafts` daily to remove expired, unpaid drafts. Set `CRON_SECRET` in Vercel.

## Validation

```bash
npm test
npm run build
```

Import and inspect every generated 3MF in Bambu Studio before production. The website does not generate G-code or print automatically.

## Cutover checklist

- Complete test-payment checkout on iOS Safari and Android Chrome.
- Confirm Shopify line attributes contain a Design ID but no private asset data.
- Confirm duplicate webhooks do not duplicate production orders or models.
- Confirm Local Mail is HK$10 at checkout. Test SF Express separately after its pickup-point app is installed.
- Export current Firebase test data before deletion. Deleting existing `orders` documents and model files is intentionally not automated by this repository.
- Deploy checkout and webhook changes together, then disable the old public order creation path.
