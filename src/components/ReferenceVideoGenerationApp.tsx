'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Download, Images, Loader2, Sparkles, UploadCloud, Video } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type Example = {
  title: string;
  note: string;
  prompt: string;
};

export function ReferenceVideoGenerationApp({
  kind,
  title,
  subtitle,
  icon,
  defaultPrompt,
  examples,
}: {
  kind: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultPrompt: string;
  examples: Example[];
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [duration, setDuration] = useState(5);
  const [ratio, setRatio] = useState('9:16');
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

  function handleFiles(files?: FileList) {
    const list = Array.from(files || []).slice(0, 9);
    if (list.length === 0) return;
    if (list.some((file) => !file.type.startsWith('image/'))) return setErr('请上传图片文件。');
    Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((nextImages) => {
        setImages(nextImages);
        setResultUrl(null);
        setErr(null);
      })
      .catch(() => setErr('图片读取失败。'));
  }

  async function generate() {
    if (!session) return signIn('google');
    if (images.length === 0) return setErr('请先上传至少一张角色、商品或场景参考图。');
    if (prompt.trim().length < 12) return setErr('请写清楚视频要发生什么。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交视频任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/reference-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, prompt, images, ratio, duration, resolution: '720p' }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成带声视频，通常需要 1-5 分钟...');
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
          setErr('视频生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
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
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
              dragging ? 'border-brand-400 bg-brand-50' : 'border-neutral-300 bg-neutral-50 hover:border-brand-300'
            }`}
          >
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files || undefined)} />
            {images.length > 0 ? (
              <span className="grid w-full grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${src.slice(0, 40)}-${index}`} src={src} alt={`reference ${index + 1}`} className="h-32 w-full rounded-lg object-cover" />
                ))}
              </span>
            ) : (
              <span className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud className="h-8 w-8" />
                <span className="text-sm">上传 1-9 张参考图</span>
                <span className="text-xs">人物、商品、场景、漫画分镜都可以</span>
              </span>
            )}
          </label>

          <label className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium">
            <Images className="h-4 w-4 text-brand-500" />
            视频描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">画幅</span>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="adaptive">adaptive</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">时长</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {[4, 5, 6, 8, 10, 12, 15].map((n) => (
                  <option key={n} value={n}>
                    {n}s
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成视频 · 14 {t('podcast.credits')}
              </>
            )}
          </button>
          {err && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {err}
            </p>
          )}
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例提示词</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <button key={example.title} onClick={() => setPrompt(example.prompt)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.note}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  套用提示词
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">视频结果</h2>
          <div className="mt-4 flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              <video src={resultUrl} controls autoPlay loop className="max-h-[520px] w-full object-contain" />
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Video className="h-8 w-8" />
                <span className="text-sm">视频会显示在这里</span>
              </div>
            )}
          </div>
          {resultUrl && (
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
              <Download className="h-4 w-4" /> 下载视频
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
