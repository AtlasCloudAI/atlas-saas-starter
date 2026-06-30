'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { TEMPLATES, getTemplate } from '@/config/templates';

function StudioInner() {
  const { data: session } = useSession();
  const sp = useSearchParams();
  const [selected, setSelected] = useState(sp.get('t') || TEMPLATES[0].id);
  const t = getTemplate(selected) || TEMPLATES[0];

  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
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

  async function generate() {
    reset();
    if (!session) return signIn('google');
    if (!image) return setErr('Please upload an image first.');

    setBusy(true);
    setStatus('Submitting…');
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: t.id, prompt, image }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(
        j.error === 'insufficient_credits'
          ? 'Not enough credits — top up on the Pricing page.'
          : `Error: ${j.error || 'failed'}`,
      );
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setStatus(t.output === 'video' ? 'Generating video… (~30–60s)' : 'Generating… (~10s)');
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          const out = Array.isArray(c.outputs) ? c.outputs : [];
          setResultUrl(out[0] || null);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setErr('Generation failed — your credits were refunded.');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, t.output === 'video' ? 4000 : 3000);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Apps</h2>
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => { setSelected(tpl.id); reset(); setImage(null); setPrompt(''); }}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
              tpl.id === selected ? 'border-brand bg-brand/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <span className="text-xl">{tpl.emoji}</span>
            <span>
              <span className="block text-sm font-medium">{tpl.title}</span>
              <span className="block text-xs text-neutral-500">
                {tpl.output === 'video' ? 'photo → video' : 'photo → image'} · {tpl.cost} cr
              </span>
            </span>
          </button>
        ))}
      </aside>

      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">{t.emoji} {t.title}</h1>
          <p className="text-neutral-600">{t.description}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Upload your photo</label>
          <input type="file" accept="image/*" onChange={onFile} />
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="input" className="mt-3 max-h-48 rounded-lg border" />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Prompt <span className="text-neutral-400">(optional — leave blank for the preset)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-3 text-sm"
          />
        </div>

        <button
          onClick={generate}
          disabled={busy}
          className="rounded-lg bg-brand px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Working…' : `Generate · ${t.cost} credits`}
        </button>

        {status && <p className="text-sm text-neutral-600">{status}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {resultUrl && (
          <div className="space-y-2">
            {t.output === 'video' ? (
              <video src={resultUrl} controls autoPlay loop className="w-full max-w-xl rounded-xl border" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="result" referrerPolicy="no-referrer" className="w-full max-w-xl rounded-xl border" />
            )}
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="inline-block rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5">⬇ Download</a>
          </div>
        )}
      </section>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <StudioInner />
    </Suspense>
  );
}
