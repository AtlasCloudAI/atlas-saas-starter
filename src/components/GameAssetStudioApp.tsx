'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Box, Clipboard, Download, FileJson, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type Engine = 'roblox' | 'unity' | 'unreal';
type AssetType = 'prop' | 'accessory' | 'character' | 'environment';
type RigTarget = 'none' | 'simple' | 'humanoid';

const COST = 8;

const engines: Record<Engine, { label: string; faceCount: number; format: string; note: string }> = {
  roblox: { label: 'Roblox UGC', faceCount: 120000, format: 'FBX/OBJ + texture set', note: '低面数、清晰轮廓、配件锚点明确' },
  unity: { label: 'Unity', faceCount: 180000, format: 'GLB/FBX + PBR maps', note: '中低面、PBR、碰撞体和 LOD 计划' },
  unreal: { label: 'Unreal', faceCount: 300000, format: 'FBX/GLB + 2K PBR maps', note: '高质量 PBR、Nanite/LOD 取舍' },
};

const examples = [
  {
    title: 'Roblox 魔法帽',
    engine: 'roblox' as Engine,
    assetType: 'accessory' as AssetType,
    rigTarget: 'none' as RigTarget,
    brief: 'stylized wizard hat accessory, purple fabric, gold stars, readable silhouette, centered object, no character, no background',
  },
  {
    title: 'Unity 科幻能量箱',
    engine: 'unity' as Engine,
    assetType: 'prop' as AssetType,
    rigTarget: 'none' as RigTarget,
    brief: 'sci-fi energy crate prop, hard-surface clean topology, blue glowing panels, worn metal PBR material, medium-poly asset',
  },
  {
    title: 'Unreal 奇幻拱门',
    engine: 'unreal' as Engine,
    assetType: 'environment' as AssetType,
    rigTarget: 'none' as RigTarget,
    brief: 'modular fantasy stone archway environment asset, mossy stones, reusable silhouette, standalone centered object',
  },
  {
    title: '低多边形宠物伙伴',
    engine: 'unity' as Engine,
    assetType: 'character' as AssetType,
    rigTarget: 'simple' as RigTarget,
    brief: 'cute low-poly robot dog companion character, simple joints, friendly expression, game-ready proportions, clean body parts for rigging',
  },
];

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function GameAssetStudioApp() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [engine, setEngine] = useState<Engine>('roblox');
  const [assetType, setAssetType] = useState<AssetType>('accessory');
  const [rigTarget, setRigTarget] = useState<RigTarget>('none');
  const [brief, setBrief] = useState(examples[0].brief);
  const [pbr, setPbr] = useState(true);
  const [faceCount, setFaceCount] = useState(engines.roblox.faceCount);
  const [generateType, setGenerateType] = useState<'Normal' | 'Geometry'>('Normal');
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

  const enginePreset = engines[engine];

  const prompt = useMemo(() => {
    const rigLine =
      rigTarget === 'none'
        ? 'No animation rig required; keep the object as a clean static mesh.'
        : rigTarget === 'simple'
          ? 'Separate moving parts clearly so a simple hinge/bone rig can be added later.'
          : 'Design a humanoid-friendly character with clear limbs, neutral pose and separable body parts for rigging.';
    return [
      `Game-ready ${assetType} asset for ${enginePreset.label}.`,
      brief,
      `Target delivery: ${enginePreset.format}.`,
      `Topology target: clean game mesh, about ${faceCount.toLocaleString()} faces, readable silhouette, centered object, no background.`,
      pbr ? 'Use game-ready PBR material description: albedo, roughness, normal, metallic where relevant.' : 'Use simple geometry-focused material description.',
      rigLine,
      'Avoid tiny floating parts, fragile geometry, unreadable silhouettes, baked text, logos, trademarks or copyrighted characters.',
    ].join('\n');
  }, [assetType, brief, enginePreset.format, enginePreset.label, faceCount, pbr, rigTarget]);

  const checks = [
    `${enginePreset.label} 预设：${enginePreset.note}`,
    `目标格式：${enginePreset.format}`,
    `面数目标：${faceCount.toLocaleString()}，PBR：${pbr ? '开启' : '关闭'}，生成模式：${generateType}`,
    rigTarget === 'none' ? '静态网格，无 rig 需求。' : rigTarget === 'simple' ? '简单 Rig：需要分离可动部件和旋转轴。' : 'Humanoid Rig：需要中立姿势、四肢清晰、左右命名一致。',
    '交付前检查：比例、法线、UV、贴图命名、碰撞体、LOD0/LOD1、引擎导入缩放。',
    '如模型不满足 rig/engine 规范，先下载原始资产，再进入 DCC 工具人工修 topology。',
  ];

  const manifest = {
    app: 'game-asset-3d',
    engine,
    assetType,
    rigTarget,
    brief,
    pbr,
    faceCount,
    generateType,
    prompt,
    checks,
    companion2DRoute: '/game-sprite',
    generatedAt: new Date().toISOString(),
  };

  function applyExample(example: (typeof examples)[number]) {
    setEngine(example.engine);
    setAssetType(example.assetType);
    setRigTarget(example.rigTarget);
    setBrief(example.brief);
    setFaceCount(engines[example.engine].faceCount);
    setPbr(true);
    setGenerateType('Normal');
    setOutputs([]);
    setErr(null);
  }

  async function generate() {
    if (!session) return signIn('google');
    if (brief.trim().length < 12) return setErr('请写清楚要生成的游戏资产。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交 3D 游戏资产任务...');
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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Box className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 游戏 3D 资产</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              为 Roblox、Unity、Unreal 生成游戏 3D 资产，并同步整理 PBR、Rig、LOD、碰撞和导出检查清单。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-medium">引擎预设</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(engines).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setEngine(key as Engine);
                    setFaceCount(item.faceCount);
                  }}
                  className={`rounded-lg border p-3 text-left transition ${
                    engine === key ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">资产类型</span>
              <select value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                <option value="prop">道具 Prop</option>
                <option value="accessory">配件 Accessory</option>
                <option value="character">角色 Character</option>
                <option value="environment">场景件 Environment</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Rig 目标</span>
              <select value={rigTarget} onChange={(e) => setRigTarget(e.target.value as RigTarget)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                <option value="none">静态网格</option>
                <option value="simple">简单 Rig</option>
                <option value="humanoid">Humanoid 准备</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">生成模式</span>
              <select value={generateType} onChange={(e) => setGenerateType(e.target.value as 'Normal' | 'Geometry')} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                <option value="Normal">Normal</option>
                <option value="Geometry">Geometry</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">资产描述</span>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold">PBR 材质</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">输出 albedo/roughness/normal 等贴图要求</span>
                </span>
                <input type="checkbox" checked={pbr} onChange={(e) => setPbr(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">面数目标</span>
              <input type="number" min={40000} max={1500000} step={10000} value={faceCount} onChange={(e) => setFaceCount(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">生成指令预览</span>
            <textarea value={prompt} readOnly rows={8} className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-sm leading-6 text-neutral-700 outline-none" />
          </label>

          <button onClick={generate} disabled={busy} className="btn-brand w-full">
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
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {err}
            </p>
          )}
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <button key={example.title} onClick={() => applyExample(example)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.brief}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">套用案例</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">引擎交付清单</h2>
            <button onClick={() => downloadFile('game-asset-manifest.json', JSON.stringify(manifest, null, 2))} className="btn-ghost px-3 py-2 text-xs">
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {checks.map((check) => (
              <div key={check} className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {check}
              </div>
            ))}
          </div>
          <button onClick={() => navigator.clipboard.writeText(prompt)} className="btn-ghost mt-4 w-full text-xs">
            <Clipboard className="h-3.5 w-3.5" /> 复制生成指令
          </button>
          <Link href="/game-sprite" className="btn-ghost mt-3 w-full text-xs">
            打开 2D 精灵图配套生成
          </Link>
        </div>

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
