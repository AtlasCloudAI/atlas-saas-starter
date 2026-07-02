'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Box, Download, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

const COST = 8;
type Text3DExample = {
  title: string;
  prompt: string;
};

const DEFAULT_EXAMPLES: Text3DExample[] = [
  {
    title: 'Roblox 风格道具',
    prompt:
      'A stylized low-poly fantasy sword for a Roblox adventure game, clean silhouette, blue crystal blade, gold handle, game-ready asset, PBR metal and crystal materials, centered object, no background.',
  },
  {
    title: '电商 AR 商品',
    prompt:
      'A modern minimalist table lamp, matte white ceramic base, warm fabric lampshade, accurate product proportions, clean PBR material, suitable for AR ecommerce display, centered object.',
  },
  {
    title: '3D 打印摆件',
    prompt:
      'A cute chibi astronaut figurine standing on a round moon base, friendly face, simplified shapes, printable collectible toy, stable pose, detailed but manufacturable geometry.',
  },
];

export function TextTo3DGenerationApp({
  title = 'AI 文字生 3D',
  subtitle = '从一句描述生成 3D 模型，适合游戏道具、AR 商品、3D 打印公仔和资产市集。',
  examples = DEFAULT_EXAMPLES,
  defaultPrompt = DEFAULT_EXAMPLES[0].prompt,
  defaultPbr = true,
  defaultGenerateType = 'Normal',
  defaultFaceCount = 300000,
}: {
  title?: string;
  subtitle?: string;
  examples?: Text3DExample[];
  defaultPrompt?: string;
  defaultPbr?: boolean;
  defaultGenerateType?: 'Normal' | 'Geometry';
  defaultFaceCount?: number;
}) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [pbr, setPbr] = useState(defaultPbr);
  const [generateType, setGenerateType] = useState<'Normal' | 'Geometry'>(defaultGenerateType);
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

  async function generate() {
    if (!session) return signIn('google');
    if (prompt.trim().length < 12) return setErr('请写清楚要生成的 3D 资产。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交 3D 任务...');
    setErr(null);
    setOutputs([]);
    const res = await fetch('/api/text-to-3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, pbr, faceCount, generateType }),
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
          <label className="mb-2 block text-sm font-medium">3D 资产描述</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={7}
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold">PBR 材质</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">游戏/AR 更实用</span>
                </span>
                <input type="checkbox" checked={pbr} onChange={(e) => setPbr(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">生成模式</span>
              <select
                value={generateType}
                onChange={(e) => setGenerateType(e.target.value as 'Normal' | 'Geometry')}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="Normal">Normal</option>
                <option value="Geometry">Geometry</option>
              </select>
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

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <button key={example.title} onClick={() => setPrompt(example.prompt)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-500">{example.prompt}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  套用案例
                </span>
              </button>
            ))}
          </div>
        </section>
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
