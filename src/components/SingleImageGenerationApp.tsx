'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AlertCircle, Download, ImagePlus, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { getTemplate } from '@/config/templates';
import { useI18n } from '@/i18n/provider';

type Example = {
  title: string;
  prompt: string;
  note: string;
};

export function SingleImageGenerationApp({
  templateId,
  title,
  subtitle,
  icon,
  examples,
}: {
  templateId: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  examples: Example[];
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const tmpl = getTemplate(templateId);
  const [prompt, setPrompt] = useState(tmpl?.promptPlaceholder || '');
  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
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

  function handleFiles(files?: FileList | File[]) {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    if (list.some((file) => !file.type.startsWith('image/'))) {
      setErr('请上传图片文件。');
      return;
    }
    const maxImages = tmpl?.maxImages || 1;
    const nextFiles = list.slice(0, maxImages);
    Promise.all(
      nextFiles.map(
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

  function handleFile(file?: File) {
    if (!file) return;
    handleFiles([file]);
  }

  function loadExample(example: Example) {
    setPrompt(example.prompt);
    setResultUrl(null);
    setErr(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function generate() {
    if (!tmpl) return setErr('应用配置不存在。');
    if (!session) return signIn('google');
    if (images.length === 0) return setErr('请先上传图片。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, prompt, images }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus(tmpl.output === 'video' ? '正在生成视频...' : '正在生成图片...');
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
          setErr('生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, tmpl.output === 'video' ? 4000 : 3000);
  }

  if (!tmpl) return null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
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
            <input
              type="file"
              accept="image/*"
              multiple={(tmpl.maxImages || 1) > 1}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files || undefined)}
            />
            {images.length > 0 ? (
              <span className={`grid w-full gap-3 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {images.map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${src.slice(0, 40)}-${index}`} src={src} alt={`input ${index + 1}`} className="max-h-72 rounded-lg object-contain" />
                ))}
              </span>
            ) : (
              <span className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud className="h-8 w-8" />
                <span className="text-sm">
                  {(tmpl.maxImages || 1) > 1 ? `拖入 ${tmpl.maxImages} 张图片或点击上传` : '拖入图片或点击上传'}
                </span>
                <span className="text-xs">JPG · PNG · WEBP</span>
              </span>
            )}
          </label>

          <label className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium">
            <ImagePlus className="h-4 w-4 text-brand-500" />
            生成要求
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder={tmpl.promptPlaceholder}
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成 · {tmpl.cost} {t('podcast.credits')}
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
              <button key={example.title} onClick={() => loadExample(example)} className="card p-5 text-left transition hover:shadow-card">
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
          <h2 className="text-sm font-semibold">生成结果</h2>
          <div className="mt-4 flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              tmpl.output === 'video' ? (
                <video src={resultUrl} controls autoPlay loop className="max-h-[420px] w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resultUrl} alt="result" referrerPolicy="no-referrer" className="max-h-[420px] w-full object-contain" />
              )
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Sparkles className="h-8 w-8" />
                <span className="text-sm">结果会显示在这里</span>
              </div>
            )}
          </div>
          {resultUrl && (
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
              <Download className="h-4 w-4" /> 下载
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
