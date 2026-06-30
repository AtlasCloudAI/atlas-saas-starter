# 🎬 Atlas Video Studio — open-source AI video SaaS starter

Launch your own AI video generator SaaS in an afternoon. **You bring the
brand, [Atlas Cloud](https://atlascloud.ai) powers the AI, you keep the
revenue.** Fork it, add your keys, deploy to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AtlasCloudAI/atlas-saas-starter&env=ATLASCLOUD_API_KEY,DATABASE_URL,DIRECT_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET,PAYMENT_PROVIDER&envDescription=Atlas%20API%20key%2C%20Postgres%2C%20Google%20OAuth%20%26%20Stripe%20keys%20%E2%80%94%20fill%20your%20own&envLink=https://github.com/AtlasCloudAI/atlas-saas-starter/blob/main/.env.example)

---

## 💸 The economics

| | |
|---|---|
| Atlas cost per video | **~$0.01** (e.g. Seedance fast t2v = $0.009) |
| What you charge | **$0.50 – $1+** per generation (your credits, your price) |
| Gross margin | **~95%** |

Credits are *your* in-app currency. You set the packs and prices in
[`src/config/pricing.ts`](src/config/pricing.ts). End-user payments go
straight to **your** Stripe account.

## 🧱 Stack

Next.js 14 (App Router) · Prisma + Postgres · NextAuth (Google) · Tailwind ·
Stripe — and a unified [Atlas Cloud](https://atlascloud.ai) API for 160+ video
models (Seedance, Kling, Veo, Wan, Pixverse…).

## 🚀 Quick start

```bash
git clone https://github.com/AtlasCloudAI/atlas-saas-starter
cd atlas-saas-starter
npm install
cp .env.example .env        # fill in the values below
npm run db:push             # create the tables
npm run dev                 # http://localhost:3000
```

Verify the AI engine alone (no DB/auth needed):

```bash
ATLASCLOUD_API_KEY=apikey-xxx node scripts/smoke-atlas.mjs
```

### Required env

- `ATLASCLOUD_API_KEY` — get one (with free credits) at https://atlascloud.ai
- `DATABASE_URL` / `DIRECT_URL` — Postgres (Supabase / Neon / Vercel Postgres)
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials

## 💳 Two ways to charge (pick one)

Set `PAYMENT_PROVIDER` in `.env`:

- **`stripe`** *(default)* — bring your own Stripe. Hosted checkout, webhooks
  pre-wired, money lands in your account. Needs `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **`atlas`** — no Stripe. Users top up with **redeem codes** issued from the
  Atlas/KubeDL admin console. Needs `KUBEDL_ADMIN_APIKEY` + `ATLAS_REDEEM_CREDITS`.

The adapter lives in [`src/lib/payments`](src/lib/payments) — both
implement the same `PaymentProvider` interface, so swapping is one env var.

## 🎨 Templates

The 8 starter templates (text→video and image→video) are defined in
[`src/config/templates.ts`](src/config/templates.ts). Each binds a real Atlas
model id to a creative prompt preset. Browse every model at
`https://api.atlascloud.ai/api/v1/models` and add your own.

## ▲ Deploy to Vercel

1. Push your fork to GitHub.
2. Click the **Deploy** button above (or import the repo in Vercel).
3. Add the env vars, attach a Postgres database.
4. After deploy, set your Stripe webhook to
   `https://<your-domain>/api/webhook/stripe` (event
   `checkout.session.completed`) and run `npm run db:push` once against the
   production DB.

## License

MIT — clone it, rebrand it, sell it, keep 100% of the revenue.
