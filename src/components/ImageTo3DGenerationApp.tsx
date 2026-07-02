'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AlertCircle, Box, Download, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

const COST = 8;
type UseCase = { title: string; note: string };

const DEFAULT_USE_CASES: UseCase[] = [
  { title: '商品 3D', note: '白底商品、摆件、家具小件适合先试这个入口。' },
  { title: '手办预览', note: '主体清楚、四肢不贴身体的全身图更容易生成可用模型。' },
  { title: 'AR 资产', note: '打开 PBR 材质，并输入真实尺寸后更适合后续 AR 试摆。' },
];

export function ImageTo3DGenerationApp({
  title = 'AI 图生 3D',
  subtitle = '上传单张主体清晰图片，生成可下载的 3D 模型资产，适合商品、手办、游戏道具原型。',
  uploadHint = '上传主体占比高、背景简单的图片',
  uploadSubhint = '单边 128-5000px，建议商品/玩具/摆件正面图',
  defaultPbr = true,
  defaultFaceCount = 500000,
  useCases = DEFAULT_USE_CASES,
}: {
  title?: string;
  subtitle?: string;
  uploadHint?: string;
  uploadSubhint?: string;
  defaultPbr?: boolean;
  defaultFaceCount?: number;
  useCases?: UseCase[];
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pbr, setPbr] = useState(defaultPbr);
  const [faceCount, setFaceCount] = useState(defaultFaceCount);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('请上传图片文件。');
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setOutputs([]);
      setErr(null);
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!session) return signIn('google');
    if (!image) return setErr('请先上传一张主体清晰的图片。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交 3D 生成任务...');
    setErr(null);
    setOutputs([]);
    const res = await fetch('/api/image-to-3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, pbr, faceCount }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成 3D 模型，通常需要 2-3 分钟...');
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setOutputs(Array.isArray(c.outputs) ? c.outputs : []);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setErr('3D 生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Box className="h-6 w-6" />
          </span>
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
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
              dragging ? 'border-brand-400 bg-brand-50' : 'border-neutral-300 bg-neutral-50 hover:border-brand-300'
            }`}
          >
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || undefined)} />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="input" className="max-h-80 rounded-lg object-contain" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud className="h-8 w-8" />
                <span className="text-sm">{uploadHint}</span>
                <span className="text-xs">{uploadSubhint}</span>
              </span>
            )}
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold">PBR 材质</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">更适合游戏/AR/商品资产</span>
                </span>
                <input type="checkbox" checked={pbr} onChange={(e) => setPbr(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">面数目标</span>
              <input
                type="number"
                min={40000}
                max={1500000}
                step={10000}
                value={faceCount}
                onChange={(e) => setFaceCount(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成 3D 模型 · {COST} {t('podcast.credits')}
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

        {useCases.length > 0 && (
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold tracking-tight">适用场景</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="card p-5">
                  <h3 className="font-semibold">{useCase.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{useCase.note}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">3D 输出</h2>
          <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {outputs.length > 0 ? (
              <div className="w-full space-y-3">
                {outputs.map((url, index) => (
                  <a key={url} href={`/api/download?url=${encodeURIComponent(url)}`} className="btn-ghost w-full">
                    <Download className="h-4 w-4" /> 下载资产 {index + 1}
                  </a>
                ))}
              </div>
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Box className="h-8 w-8" />
                <span className="text-sm">3D 文件会显示在这里</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
