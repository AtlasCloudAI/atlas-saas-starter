'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Download, Loader2, Sparkles, UploadCloud, Video } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type Kind = 'talking-photo' | 'video-edit' | 'video-upscale';
type Example = { title: string; note: string; prompt: string };

function readFile(file?: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('no file'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MediaVideoToolApp({
  kind,
  title,
  subtitle,
  icon,
  defaultPrompt,
  examples,
}: {
  kind: Kind;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultPrompt: string;
  examples: Example[];
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [image, setImage] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cost = kind === 'talking-photo' ? 12 : kind === 'video-edit' ? 16 : 10;

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  async function generate() {
    if (!session) return signIn('google');
    if (kind === 'talking-photo' && (!image || !audio)) return setErr('请上传一张人物/宠物/名画图片和一段音频。');
    if ((kind === 'video-edit' || kind === 'video-upscale') && !video) return setErr('请先上传视频。');
    if (kind === 'video-edit' && prompt.trim().length < 8) return setErr('请写清楚要怎么改视频。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在上传媒体并提交任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/media-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, image, audio, video, prompt }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成视频，通常需要 1-5 分钟...');
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

        <div className="card space-y-5 p-5">
          {kind === 'talking-photo' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center hover:border-brand-300">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0]).then(setImage).catch(() => setErr('图片读取失败。'))} />
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="input" className="max-h-52 rounded-lg object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-neutral-400">
                    <UploadCloud className="h-7 w-7" />
                    <span className="text-sm">上传人像/宠物/名画</span>
                  </span>
                )}
              </label>
              <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center hover:border-brand-300">
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0]).then(setAudio).catch(() => setErr('音频读取失败。'))} />
                {audio ? (
                  <audio src={audio} controls className="w-full" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-neutral-400">
                    <UploadCloud className="h-7 w-7" />
                    <span className="text-sm">上传 MP3/WAV 音频</span>
                  </span>
                )}
              </label>
            </div>
          ) : (
            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center hover:border-brand-300">
              <input type="file" accept="video/*" className="hidden" onChange={(e) => readFile(e.target.files?.[0]).then(setVideo).catch(() => setErr('视频读取失败。'))} />
              {video ? (
                <video src={video} controls className="max-h-72 w-full object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm">上传视频文件</span>
                  <span className="text-xs">建议先用 5-10 秒短视频测试</span>
                </span>
              )}
            </label>
          )}

          {kind !== 'video-upscale' && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">{kind === 'talking-photo' ? '表演要求' : '编辑指令'}</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          )}

          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成视频 · {cost} {t('podcast.credits')}
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

        {examples.length > 0 && (
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold tracking-tight">案例</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {examples.map((example) => (
                <button key={example.title} onClick={() => setPrompt(example.prompt)} className="card p-5 text-left transition hover:shadow-card">
                  <h3 className="font-semibold">{example.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{example.note}</p>
                  <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    套用案例
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
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
