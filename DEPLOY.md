# 🚀 Deploy your own AI media SaaS

Step-by-step, from forking this repo to a **live site you own** — about 20 minutes.
You bring your own keys; the money goes to your Stripe, the AI usage runs on your
Atlas Cloud account.

---

## Prerequisites — all free to start

| Service | Used for | Cost |
|---|---|---|
| [GitHub](https://github.com) | your code | free |
| [Atlas Cloud](https://atlascloud.ai) | the AI (image/video) | free credits to start |
| [Neon](https://neon.tech) *(or Supabase / Vercel Postgres)* | database | free tier |
| [Google Cloud](https://console.cloud.google.com) | user login (Google OAuth) | free |
| [Stripe](https://stripe.com) | payments | free (test mode needs no bank) |
| [Vercel](https://vercel.com) | hosting | free (Hobby) |

---

## 1. Fork the repo

Click **Fork** at the top of this repo (or `gh repo fork AtlasCloudAI/atlas-saas-starter`).
You'll deploy **your fork**.

---

## 2. Collect your keys

Grab these first — you'll paste them into Vercel in step 3.

### 2.1 Atlas Cloud API key (the AI engine)
1. Sign up at https://atlascloud.ai and open the dashboard.
2. Create an API key → copy it (`apikey-…`).
> This is the only key that's truly required — everything else has a fallback or is optional.

### 2.2 Postgres database (Neon)
1. Sign up at https://neon.tech → **Create project**.
2. Copy the connection string. Neon gives you two:
   - **Pooled** (`...-pooler...`) → use for `DATABASE_URL`
   - **Direct** (no `-pooler`) → use for `DIRECT_URL`
   > ⚠️ Prisma needs the **direct** URL for `DIRECT_URL` (migrations/`db push`). If Neon only shows the pooled one, just delete `-pooler` from the host to get the direct one. Drop any `&channel_binding=require` param.

### 2.3 Google OAuth (user login)
1. https://console.cloud.google.com → new project.
2. **APIs & Services → OAuth consent screen** → External → fill app name + your email → add your email under **Test users**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → **Web application**.
4. Leave redirect URIs for now (you'll add the real domain in step 4) — or add `http://localhost:3000/api/auth/callback/google` if testing locally.
5. Copy **Client ID** and **Client secret**.

### 2.4 Stripe (payments — test mode, no bank needed)
1. https://dashboard.stripe.com → make sure **Test mode** is ON (top-right).
2. **Developers → API keys** → copy the **Secret key** (`sk_test_…`).
   > Test mode needs no bank account and no activation. You'll add a webhook in step 4.
   > Prefer no Stripe at all? Set `PAYMENT_PROVIDER=atlas` and use redeem codes instead.

### 2.5 NextAuth secret
Run `openssl rand -base64 32` and copy the output — that's your `NEXTAUTH_SECRET`.

---

## 3. Deploy to Vercel

### 3.1 Import your fork — **connect Git** (important)
1. https://vercel.com → **Add New → Project → Import** your forked repo.
2. Authorize Vercel's GitHub App for your account/org so it can see the repo.
> ⚠️ **Deploy from Git, not a raw CLI upload.** Brand-new Vercel accounts get their
> first CLI (`vercel deploy`) uploads **blocked**. Importing the Git repo (so pushes
> auto-deploy) is the reliable path.

### 3.2 Add environment variables
In the import screen (or Project → Settings → Environment Variables), add:

| Variable | Value |
|---|---|
| `ATLASCLOUD_API_KEY` | your Atlas key |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `NEXTAUTH_SECRET` | the `openssl` output |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` *(guess it now, fix in 4.2)* |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PAYMENT_PROVIDER` | `stripe` |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | leave blank for now (add in 4.3) |
| `SIGNUP_BONUS_CREDITS` | `20` |

### 3.3 Deploy
Hit **Deploy**. The build runs `prisma db push` automatically, so your database
tables are created for you. First build ≈ 2–3 min.

> If the project shows **"No Production Deployment"** and a deployment is marked
> *Blocked · Configure one-click deploy*, it just means Git isn't connected yet —
> finish 3.1 and push once (or click **Redeploy**).

---

## 4. Wire up your live domain

After the first deploy you have a domain like `https://your-app.vercel.app`. Now:

### 4.1 Google redirect URI
Back in Google Cloud → your OAuth client → **Authorized redirect URIs**, add:
```
https://your-app.vercel.app/api/auth/callback/google
```
and under **Authorized JavaScript origins**: `https://your-app.vercel.app`.

### 4.2 NEXTAUTH_URL
Set `NEXTAUTH_URL` (Vercel env) to your real `https://your-app.vercel.app` and redeploy.

### 4.3 Stripe webhook (so paid credits actually land)
Stripe → **Developers → Webhooks → Add endpoint**:
- URL: `https://your-app.vercel.app/api/webhook/stripe`
- Event: `checkout.session.completed`
- Copy the **Signing secret** (`whsec_…`) → set it as `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy.

---

## 5. Test it

1. Open your site, click **Sign in**, log in with the Google account you added as a test user.
2. New users get 20 free credits — pick an app, upload a photo, **Generate**.
3. Buy credits on **Pricing** with Stripe's test card:
   `4242 4242 4242 4242`, any future expiry (`12/34`), any CVC. Credits land via the webhook.

Done — that's a live, paying AI SaaS you own. 🎉

---

## 6. Going live for real money (optional)

Test mode uses fake money. To charge real customers:
1. **Activate your Stripe account** (business details, identity, and a **bank account** to receive payouts).
2. Swap `STRIPE_SECRET_KEY` / webhook secret for the **live** (`sk_live_…`) versions and redeploy.
> Region note: Stripe isn't available in mainland China. You'll need a supported
> entity (US/SG/HK…), [Stripe Atlas](https://stripe.com/atlas), or a Merchant-of-Record
> like [Paddle](https://paddle.com) / [LemonSqueezy](https://lemonsqueezy.com).

---

## Troubleshooting (real gotchas)

| Symptom | Fix |
|---|---|
| Every deploy is **BLOCKED / "No Production Deployment"** | Connect the **Git repository** (step 3.1). New accounts can't deploy via raw CLI upload. |
| First page load 302s to `vercel.com/sso-api` | Vercel **Deployment Protection** is on. Project → Settings → Deployment Protection → turn off Vercel Authentication (or use a bypass). |
| `prisma` / DB connection errors on build | Check `DIRECT_URL` is the **direct** (non-pooler) Neon URL; keep `?sslmode=require`, drop `channel_binding`. |
| Google login → `redirect_uri_mismatch` | The redirect URI must match **exactly**: `https://your-app.vercel.app/api/auth/callback/google`. |
| Paid but credits didn't arrive | The Stripe **webhook** (4.3) isn't set or `STRIPE_WEBHOOK_SECRET` is wrong. |
| Generated images download instead of showing | Already handled — the app sets `referrer: no-referrer` so Atlas OSS serves them inline. |

---

## Customize (make it yours)

- **Brand / copy**: `src/app/layout.tsx` (title), `src/i18n/messages.ts` (all text + languages).
- **Apps**: `src/config/templates.ts` — swap the Atlas model, prompt, price. Browse 300+ models at `https://api.atlascloud.ai/api/v1/models`.
- **Pricing**: `src/config/pricing.ts` — set your own credit packs and prices.
- **Add a language**: add a locale block in `src/i18n/messages.ts` (+ `appMessages`); the switcher picks it up automatically.

MIT licensed — rebrand it, sell it, keep 100% of the revenue.
