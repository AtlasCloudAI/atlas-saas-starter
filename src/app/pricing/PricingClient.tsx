'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { CreditPack } from '@/config/pricing';
import { useI18n } from '@/i18n/provider';
import { Check, Coins, Loader2, Gift } from 'lucide-react';

export default function PricingClient({
  packs,
  mode,
}: {
  packs: CreditPack[];
  mode: 'checkout' | 'redeem';
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function buy(packId: string) {
    if (!session) return signIn('google');
    setBusy(packId);
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    });
    const j = await r.json();
    setBusy(null);
    if (j.url) window.location.href = j.url;
    else setMsg(`Error: ${j.error || 'checkout failed'}`);
  }

  async function redeem() {
    if (!session) return signIn('google');
    setMsg(null);
    setBusy('redeem');
    const r = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const j = await r.json();
    setBusy(null);
    if (r.ok) {
      setMsg(t('pricing.added', { n: j.amount }));
      setCode('');
      window.dispatchEvent(new Event('atlas:credits'));
    } else {
      setMsg(`Error: ${j.error || 'invalid code'}`);
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('pricing.title')}</h1>
        <p className="mt-3 text-neutral-500">{t('pricing.subtitle')}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {packs.map((p) => (
          <div
            key={p.id}
            className={`card relative flex flex-col p-7 ${p.highlight ? 'ring-2 ring-brand-400' : ''}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-glow">
                {t('pricing.popular')}
              </span>
            )}
            <div className="text-sm font-medium text-neutral-500">{p.name}</div>
            <div className="mt-2 text-4xl font-bold">${p.priceUsd}</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-600">
              <Coins className="h-4 w-4" />
              {p.credits.toLocaleString()} {t('pricing.credits')}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-neutral-600">
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-500" />~{Math.floor(p.credits / 5).toLocaleString()}{t('pricing.featGen')}</li>
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-500" />{t('pricing.featApps')}</li>
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-500" />{t('pricing.featExpire')}</li>
            </ul>
            {mode === 'checkout' && (
              <button
                onClick={() => buy(p.id)}
                disabled={busy === p.id}
                className={`mt-6 w-full ${p.highlight ? 'btn-brand' : 'btn-ghost'}`}
              >
                {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t('pricing.buy')}
              </button>
            )}
          </div>
        ))}
      </div>

      {mode === 'redeem' && (
        <div className="card mx-auto max-w-md p-7 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
            <Gift className="h-5 w-5 text-brand-500" />
          </span>
          <h2 className="mt-3 font-semibold">{t('pricing.redeemTitle')}</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-500">{t('pricing.redeemDesc')}</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ATLAS-XXXX-XXXX"
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button onClick={redeem} disabled={busy === 'redeem' || !code} className="btn-brand">
              {busy === 'redeem' ? <Loader2 className="h-4 w-4 animate-spin" /> : t('pricing.redeem')}
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-center text-sm">{msg}</p>}
    </div>
  );
}
