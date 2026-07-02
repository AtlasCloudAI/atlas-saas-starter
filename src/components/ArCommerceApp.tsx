'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Clipboard, Cuboid, FileJson, Ruler, ShieldCheck } from 'lucide-react';

type Platform = 'shopify' | 'web' | 'ios';

const platforms: Record<Platform, { label: string; note: string }> = {
  shopify: { label: 'Shopify', note: '产品详情页嵌入 model-viewer' },
  web: { label: '独立站', note: '任意 HTML 页面嵌入 AR 预览' },
  ios: { label: 'Apple Quick Look', note: 'iOS Safari 使用 USDZ 打开 AR' },
};

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ArCommerceApp() {
  const [platform, setPlatform] = useState<Platform>('shopify');
  const [productName, setProductName] = useState('Nordic Ceramic Table Lamp');
  const [glbUrl, setGlbUrl] = useState('https://example.com/models/nordic-lamp.glb');
  const [usdzUrl, setUsdzUrl] = useState('https://example.com/models/nordic-lamp.usdz');
  const [widthCm, setWidthCm] = useState(24);
  const [heightCm, setHeightCm] = useState(38);
  const [depthCm, setDepthCm] = useState(24);
  const [fileSizeMb, setFileSizeMb] = useState(8);
  const [posterUrl, setPosterUrl] = useState('https://example.com/models/nordic-lamp-poster.jpg');
  const [autoRotate, setAutoRotate] = useState(true);
  const [arPlacement, setArPlacement] = useState<'floor' | 'wall'>('floor');

  const scaleNote = useMemo(() => {
    const largest = Math.max(widthCm, heightCm, depthCm);
    if (largest <= 0) return '尺寸未填写。';
    return `真实尺寸：${widthCm} x ${heightCm} x ${depthCm} cm；导入引擎时 1 unit = 1 meter，最大边约 ${(largest / 100).toFixed(2)}m。`;
  }, [depthCm, heightCm, widthCm]);

  const embedCode = `<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
<model-viewer
  src="${glbUrl}"
  ios-src="${usdzUrl}"
  poster="${posterUrl}"
  alt="${productName} 3D AR preview"
  ar
  ar-modes="webxr scene-viewer quick-look"
  ar-placement="${arPlacement}"
  camera-controls
  ${autoRotate ? 'auto-rotate' : ''}
  shadow-intensity="0.8"
  style="width:100%;height:520px;background:#f7f7f7;border-radius:12px;"
></model-viewer>`;

  const checks = [
    scaleNote,
    fileSizeMb <= 12 ? 'GLB 体积适合移动端首屏加载。' : 'GLB 超过 12MB，建议压缩纹理、降面或 Draco 压缩。',
    usdzUrl.endsWith('.usdz') ? 'iOS USDZ 链接格式正确。' : 'iOS Quick Look 需要 .usdz 文件。',
    glbUrl.endsWith('.glb') || glbUrl.endsWith('.gltf') ? 'Web 3D 链接格式正确。' : 'Web 预览建议使用 .glb/.gltf。',
    '质检：真实比例、重心/落地面、材质粗糙度、透明材质、阴影、加载失败 fallback。',
    '上线追踪：AR 按钮点击率、停留时长、加入购物车率、移动端加载时间。',
  ];

  const manifest = {
    app: 'ar-commerce',
    platform,
    productName,
    glbUrl,
    usdzUrl,
    posterUrl,
    dimensionsCm: { width: widthCm, height: heightCm, depth: depthCm },
    fileSizeMb,
    autoRotate,
    arPlacement,
    embedCode,
    checks,
    generatedAt: new Date().toISOString(),
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Cuboid className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AR 商品嵌入方案</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              为 GLB/USDZ 商品资产生成 model-viewer 嵌入代码、真实尺寸校准、移动端兼容和转化追踪清单。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-medium">平台</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(platforms).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlatform(key as Platform)}
                  className={`rounded-lg border p-3 text-left transition ${
                    platform === key ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">商品名称</span>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">GLB/GLTF URL</span>
              <input value={glbUrl} onChange={(e) => setGlbUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">USDZ URL</span>
              <input value={usdzUrl} onChange={(e) => setUsdzUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Poster 图片 URL</span>
            <input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['宽 cm', widthCm, setWidthCm],
              ['高 cm', heightCm, setHeightCm],
              ['深 cm', depthCm, setDepthCm],
              ['GLB MB', fileSizeMb, setFileSizeMb],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="block">
                <span className="mb-1.5 block text-sm font-medium">{String(label)}</span>
                <input type="number" min={1} value={Number(value)} onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              自动旋转
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">AR 放置</span>
              <select value={arPlacement} onChange={(e) => setArPlacement(e.target.value as 'floor' | 'wall')} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                <option value="floor">地面/桌面</option>
                <option value="wall">墙面</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
            <div className="mb-2 flex items-center gap-2 font-semibold text-neutral-900">
              <Ruler className="h-4 w-4 text-brand-500" /> 尺寸校准
            </div>
            {scaleNote}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">嵌入代码</span>
            <textarea value={embedCode} readOnly rows={10} className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/40 p-4 font-mono text-xs leading-5 text-neutral-700 outline-none" />
          </label>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">上线清单</h2>
            <button onClick={() => downloadFile('ar-commerce-manifest.json', JSON.stringify(manifest, null, 2))} className="btn-ghost px-3 py-2 text-xs">
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
          <button onClick={() => navigator.clipboard.writeText(embedCode)} className="btn-ghost mt-4 w-full text-xs">
            <Clipboard className="h-3.5 w-3.5" /> 复制嵌入代码
          </button>
          <Link href="/image-to-3d" className="btn-ghost mt-3 w-full text-xs">
            先生成商品 3D
          </Link>
        </div>
      </aside>
    </div>
  );
}
