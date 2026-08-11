# Form & Fable — Custom Name Tags

An English-language MVP for configuring, previewing and requesting custom two-colour 3D printed name tags.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The production desk is at `/admin`.

Set `ADMIN_PASSWORD` to protect the production desk and order/model APIs with HTTP Basic authentication. The username is `admin`. With no password set, authentication is intentionally disabled for local development.

## Validation

```bash
npm test
npm run build
```

Orders and generated models are stored under the ignored `.data/` directory by the local adapter. Each accepted request generates a millimetre-based 3MF with separately coloured base and face objects. Import and inspect every model in Bambu Studio before production.

## Production integration points

The local filesystem adapter in `lib/store.ts` should be replaced with PostgreSQL and private object storage before a public deployment. Connect an email provider to the successful and failed generation branches in `app/api/orders/route.ts`. The current uploaded-icon validation is intentionally conservative; final silhouette tracing and every generated model still require production review.
