'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Download, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type Example = { title: string; note: string; prompt: string; size?: string };

export function TextImageGenerationApp({
  kind,
  title,
  subtitle,
  icon,
  defaultPrompt,
  defaultSize = '1024x1024',
  examples,
}: {
  kind: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultPrompt: string;
  defaultSize?: string;
  examples: Example[];
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [size, setSize] = useState(defaultSize);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  async function generate() {
    if (!session) return signIn('google');
    if (prompt.trim().length < 12) return setErr('请先填写图片描述。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交生图任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/text-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, prompt, size }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成图片...');
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setResultUrl((Array.isArray(c.outputs) ? c.outputs : [])[0] || null);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setErr('图片生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">{subtitle}</p>
          </div>
        </div>

        <div className="card p-5">
          <label className="mb-2 block text-sm font-medium">图片描述</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={7} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">尺寸</span>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option value="1024x1024">1:1</option>
              <option value="768x1024">3:4</option>
              <option value="1024x768">4:3</option>
              <option value="1152x2048">9:16</option>
              <option value="2048x1152">16:9</option>
            </select>
          </label>
          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}</> : <><Sparkles className="h-4 w-4" /> 生成图片 · 4 {t('podcast.credits')}</>}
          </button>
          {err && <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <button key={example.title} onClick={() => { setPrompt(example.prompt); if (example.size) setSize(example.size); }} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.note}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">套用案例</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">图片结果</h2>
          <div className="mt-4 flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="result" referrerPolicy="no-referrer" className="max-h-[520px] w-full object-contain" />
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /><span className="text-sm">{status}</span></div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300"><ImageIcon className="h-8 w-8" /><span className="text-sm">图片会显示在这里</span></div>
            )}
          </div>
          {resultUrl && <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full"><Download className="h-4 w-4" /> 下载图片</a>}
        </div>
      </aside>
    </div>
  );
}
