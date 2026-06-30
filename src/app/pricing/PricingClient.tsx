'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { CreditPack } from '@/config/pricing';

export default function PricingClient({
  packs,
  mode,
}: {
  packs: CreditPack[];
  mode: 'checkout' | 'redeem';
}) {
  const { data: session } = useSession();
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
      setMsg(`✅ Added ${j.amount} credits!`);
      setCode('');
      window.dispatchEvent(new Event('atlas:credits'));
    } else {
      setMsg(`Error: ${j.error || 'invalid code'}`);
    }
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-2 text-neutral-600">Buy credits, generate videos. Credits never expire.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {packs.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border bg-white p-6 ${
              p.highlight ? 'border-brand ring-1 ring-brand' : 'border-neutral-200'
            }`}
          >
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-2 text-3xl font-bold">${p.priceUsd}</div>
            <div className="mt-1 text-sm text-neutral-500">{p.credits} credits</div>
            {mode === 'checkout' && (
              <button
                onClick={() => buy(p.id)}
                disabled={busy === p.id}
                className="mt-4 w-full rounded-lg bg-brand py-2 font-medium text-white disabled:opacity-50"
              >
                {busy === p.id ? '…' : 'Buy'}
              </button>
            )}
          </div>
        ))}
      </div>

      {mode === 'redeem' && (
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <h2 className="font-semibold">Have a redeem code?</h2>
          <p className="mb-3 text-sm text-neutral-500">Enter an Atlas credit code to top up.</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ATLAS-XXXX-XXXX"
              className="flex-1 rounded-lg border border-neutral-300 p-2 text-sm"
            />
            <button
              onClick={redeem}
              disabled={busy === 'redeem' || !code}
              className="rounded-lg bg-brand px-4 font-medium text-white disabled:opacity-50"
            >
              Redeem
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-center text-sm">{msg}</p>}
    </div>
  );
}
