'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { TEMPLATES, getTemplate } from '@/config/templates';
import { useI18n } from '@/i18n/provider';
import { UploadCloud, Sparkles, Download, Loader2, AlertCircle } from 'lucide-react';

function StudioInner() {
  const { data: session } = useSession();
  const { t, appText } = useI18n();
  const sp = useSearchParams();
  const [selected, setSelected] = useState(sp.get('t') || TEMPLATES[0].id);
  const tmpl = getTemplate(selected) || TEMPLATES[0];
  const a = appText(tmpl.id);

  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function handleFile(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  }
  function reset() {
    setResultUrl(null);
    setErr(null);
    setStatus(null);
    if (timer.current) clearInterval(timer.current);
  }
  function pick(id: string) {
    setSelected(id);
    reset();
    setImage(null);
    setPrompt('');
  }

  async function generate() {
    reset();
    if (!session) return signIn('google');
    if (!image) return setErr(t('studio.uploadFirst'));
    setBusy(true);
    setStatus(t('studio.submitting'));
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: tmpl.id, prompt, image }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? t('studio.notEnough') : `Error: ${j.error || 'failed'}`);
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setStatus(tmpl.output === 'video' ? t('studio.genVideo') : t('studio.genImage'));
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
          setErr(t('studio.failed'));
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, tmpl.output === 'video' ? 4000 : 3000);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {t('studio.chooseApp')}
        </h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {TEMPLATES.map((x) => (
            <button
              key={x.id}
              onClick={() => pick(x.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                x.id === selected
                  ? 'border-brand-300 bg-brand-50 shadow-soft'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                  x.id === selected ? 'bg-white' : 'bg-neutral-100'
                }`}
              >
                {x.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{appText(x.id).title}</span>
                <span className="block text-xs text-neutral-400">
                  {x.cost} · {x.output === 'video' ? 'video' : 'image'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
            {tmpl.emoji}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{a.title}</h1>
            <p className="text-sm text-neutral-500">{a.description}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
              className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                dragging ? 'border-brand-400 bg-brand-50' : 'border-neutral-300 hover:border-brand-300 hover:bg-neutral-50'
              }`}
            >
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || undefined)} />
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="input" className="max-h-52 rounded-lg" />
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-neutral-400" />
                  <span className="mt-2 text-sm font-medium">{t('studio.dropOrClick')}</span>
                  <span className="mt-0.5 text-xs text-neutral-400">{t('studio.formats')}</span>
                </>
              )}
            </label>
            {image && (
              <button onClick={() => setImage(null)} className="text-xs text-neutral-400 hover:text-neutral-600">
                {t('studio.removePhoto')}
              </button>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('studio.prompt')} <span className="font-normal text-neutral-400">{t('studio.promptOpt')}</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={tmpl.promptPlaceholder}
                rows={3}
                className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <button onClick={generate} disabled={busy} className="btn-brand w-full">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {status || '…'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> {t('studio.generate')} · {tmpl.cost} {t('studio.credits')}
                </>
              )}
            </button>
            {err && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {err}
              </p>
            )}
          </div>

          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              {resultUrl ? (
                tmpl.output === 'video' ? (
                  <video src={resultUrl} controls autoPlay loop className="h-full w-full object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="result" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                )
              ) : busy ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                  <span className="text-sm">{status}</span>
                  <span className="text-xs text-neutral-300">{tmpl.output === 'video' ? '~30–60s' : '~10s'}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-300">
                  <Sparkles className="h-8 w-8" />
                  <span className="text-sm">{t('studio.resultHere')}</span>
                </div>
              )}
            </div>
            {resultUrl && (
              <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
                <Download className="h-4 w-4" /> {t('studio.download')}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>}>
      <StudioInner />
    </Suspense>
  );
}
