# 🎬 Atlas Media Studio — open-source AI photo/video SaaS starter

Launch your own AI photo/video SaaS in an afternoon. **You bring the brand,
[Atlas Cloud](https://atlascloud.ai) powers the AI, you keep the revenue.**
Fork it, add your keys, deploy to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AtlasCloudAI/atlas-saas-starter&env=ATLASCLOUD_API_KEY,DATABASE_URL,DIRECT_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET,PAYMENT_PROVIDER&envDescription=Atlas%20API%20key%2C%20Postgres%2C%20Google%20OAuth%20%26%20Stripe%20keys%20%E2%80%94%20fill%20your%20own&envLink=https://github.com/AtlasCloudAI/atlas-saas-starter/blob/main/.env.example)

> ⚠️ One-click deploys via CLI may need a Git connection first — see [Deploy](#-deploy-to-vercel).

---

## 🎨 The 5 apps

Each takes **one uploaded photo** and returns a result. Defined in
[`src/config/templates.ts`](src/config/templates.ts) — swap models / add apps freely.

| App | What it does | In → Out | Atlas model |
|---|---|---|---|
| 👔 **AI Professional Headshot** | selfie → corporate headshot | photo → image | `seedream-v4.5/edit` |
| 📦 **AI Product Photo** | product → premium studio scene | photo → image | `seedream-v4.5/edit` |
| 🛋️ **AI Virtual Staging** | empty room → furnished listing | photo → image | `seedream-v4.5/edit` |
| 💍 **AI Wedding Photoshoot** | photo → dreamy wedding shoot | photo → image | `seedream-v4.5/edit` |
| 🪄 **Photo to Life** | photo → short animated video | photo → video | `seedance-v1-pro-fast/i2v` |

Browse all 395 models at `https://api.atlascloud.ai/api/v1/models`.

## 💸 The economics (real Atlas prices, 2026-06)

| | Atlas cost / run | You charge | Gross margin |
|---|---|---|---|
| Image apps (headshot / product / staging / wedding) | **$0.036** | $0.50–1+ | ~95% |
| Photo-to-Life (image→video) | **$0.009** | $0.50+ | ~98% |

Credits are *your* in-app currency — set packs & prices in
[`src/config/pricing.ts`](src/config/pricing.ts). End-user payments go straight
to **your** Stripe account.

> Costs move with model prices — always check `/api/v1/models` for the live number.

## 🧱 Stack

Next.js 14 (App Router) · Prisma + Postgres (Supabase/Neon) · NextAuth (Google) ·
Stripe · Tailwind · Vercel — and one [Atlas Cloud](https://atlascloud.ai) API for
everything.

## 🚀 Quick start

```bash
git clone https://github.com/AtlasCloudAI/atlas-saas-starter
cd atlas-saas-starter
npm install
cp .env.example .env        # fill in the values
npm run db:push             # create tables
npm run dev                 # http://localhost:3000
```

Verify the AI engine alone (no DB/auth needed):

```bash
ATLASCLOUD_API_KEY=apikey-xxx node scripts/smoke-atlas.mjs                                    # text→video
ATLASCLOUD_API_KEY=apikey-xxx node scripts/smoke-image.mjs image bytedance/seedream-v4.5/edit <imageUrl> "make it a headshot"
```

### Required env

- `ATLASCLOUD_API_KEY` — get one (with free credits) at https://atlascloud.ai
- `DATABASE_URL` / `DIRECT_URL` — Postgres (Supabase / Neon / Vercel Postgres)
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials

## 💳 Two ways to charge (pick one)

Set `PAYMENT_PROVIDER`:

- **`stripe`** *(default)* — bring your own Stripe. Hosted checkout + webhooks
  pre-wired, money lands in your account.
- **`atlas`** — no Stripe; users top up with redeem codes (Atlas/KubeDL admin API).

Adapters live in [`src/lib/payments`](src/lib/payments) — swap with one env var.

## ▲ Deploy to Vercel

1. Push your fork to GitHub.
2. Import the repo in Vercel **and connect the Git repository** (Project →
   Settings → Git). New projects deploy from Git, not raw CLI uploads.
3. Add the env vars; attach a Postgres database (Neon/Supabase: use the **pooled**
   URL for `DATABASE_URL` and the **direct** URL for `DIRECT_URL`).
4. After it has a domain, set your Google OAuth redirect URI to
   `https://<your-domain>/api/auth/callback/google`, set `NEXTAUTH_URL` to the
   domain, and point a Stripe webhook at `https://<your-domain>/api/webhook/stripe`
   (event `checkout.session.completed`).

`prisma db push` runs in the build, so tables are created automatically.

## License

MIT — clone it, rebrand it, sell it, keep 100% of the revenue.
