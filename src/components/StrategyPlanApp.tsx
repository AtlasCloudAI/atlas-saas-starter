'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Copy, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export function StrategyPlanApp({
  kind,
  title,
  subtitle,
  icon,
  defaultBrief,
  defaultAudience,
  defaultConstraints,
}: {
  kind:
    | 'live-room'
    | 'account-matrix'
    | 'pod-kit'
    | 'ar-commerce'
    | 'photo-studio-suite'
    | 'showrunner'
    | 'real-estate-suite'
    | 'combo-studio'
    | 'ugc-ad-factory'
    | 'avatar-agent'
    | 'ecommerce-suite'
    | 'social-publisher'
    | 'pod-order'
    | 'ar-menu';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultBrief: string;
  defaultAudience: string;
  defaultConstraints: string;
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [brief, setBrief] = useState(defaultBrief);
  const [audience, setAudience] = useState(defaultAudience);
  const [constraints, setConstraints] = useState(defaultConstraints);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    if (!session) return signIn('google');
    if (brief.trim().length < 8) return setErr('请先填写项目说明。');
    setBusy(true);
    setErr(null);
    setPlan('');
    const res = await fetch('/api/strategy-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, brief, audience, constraints }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setPlan(j.plan || '');
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">{subtitle}</p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">项目说明</span>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">目标用户</span>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">渠道/约束/备注</span>
            <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> 生成方案中...</> : <><Sparkles className="h-4 w-4" /> 生成方案 · 2 {t('podcast.credits')}</>}
          </button>
          {err && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
        </div>
      </section>

      <aside>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">运营方案</h2>
            {plan && (
              <button onClick={() => navigator.clipboard.writeText(plan)} className="btn-ghost px-3 py-2 text-xs">
                <Copy className="h-3.5 w-3.5" /> 复制
              </button>
            )}
          </div>
          <div className="mt-4 min-h-[440px] whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-7 text-neutral-700">
            {plan || '方案会显示在这里'}
          </div>
        </div>
      </aside>
    </div>
  );
}
