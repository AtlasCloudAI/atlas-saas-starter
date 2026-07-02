'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { BadgeCheck, ClipboardList, Copy, Download, ImagePlus, Link2, PlaySquare, ShieldCheck } from 'lucide-react';

type Platform = 'tiktok' | 'reels' | 'douyin' | 'xiaohongshu';

const platforms: Record<Platform, { label: string; length: string; cta: string }> = {
  tiktok: { label: 'TikTok', length: '25-35 秒', cta: 'Shop now' },
  reels: { label: 'Instagram Reels', length: '20-30 秒', cta: 'Tap to learn more' },
  douyin: { label: '抖音', length: '20-40 秒', cta: '点小黄车看看' },
  xiaohongshu: { label: '小红书', length: '18-30 秒', cta: '评论区领清单' },
};

export function UgcAdFactoryApp() {
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [productUrl, setProductUrl] = useState('https://example.com/products/portable-humidifier');
  const [product, setProduct] = useState('桌面便携加湿器');
  const [audience, setAudience] = useState('办公室久坐、卧室干燥、需要低噪氛围灯的小空间用户');
  const [facts, setFacts] = useState('低噪运行；可调雾量；暖色氛围灯；USB-C 供电；适合办公桌和床头柜');
  const [variants, setVariants] = useState(8);
  const [noMedical, setNoMedical] = useState(true);
  const [truthful, setTruthful] = useState(true);
  const [assets, setAssets] = useState<string[]>([]);

  function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 6);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    ).then((items) => setAssets((prev) => [...prev, ...items].slice(0, 6)));
    event.target.value = '';
  }

  const matrix = useMemo(() => {
    const hooks = [
      '别再把干燥空气当小问题',
      '我把办公桌改造成了小型舒适区',
      '睡前 30 秒打开它，卧室氛围直接变了',
      '租房党不想买大电器，可以看这个',
      '桌面太干、皮肤紧绷的人先看完',
      '一个小东西解决我冬天开空调的不适',
      '送同事不踩雷的小家电',
      '床头柜只留一个位置，我会放它',
    ];
    const personas = ['上班族实测', '租房女生', '新手妈妈', '桌搭博主', '礼物推荐官'];
    return Array.from({ length: variants }, (_, index) => ({
      id: `UGC-${String(index + 1).padStart(2, '0')}`,
      platform: platforms[platform].label,
      persona: personas[index % personas.length],
      hook: hooks[index % hooks.length],
      length: platforms[platform].length,
      script: `${hooks[index % hooks.length]}。这款${product}主打${facts.split(/[；;]/)[index % facts.split(/[；;]/).length]?.trim() || '小空间舒适体验'}，适合${audience}。镜头先给使用场景，再切产品细节，最后用真实体验收束：${platforms[platform].cta}。`,
      assetPrompt: `Vertical UGC ad, ${product}, real home/office scene, close-up product details, natural handheld camera, creator testimonial, platform ${platforms[platform].label}`,
    }));
  }, [audience, facts, platform, product, variants]);

  const manifest = useMemo(() => ({
    app: 'ugc-ad-factory',
    product,
    productUrl,
    platform: platforms[platform].label,
    sourceAssets: assets.length,
    compliance: {
      noMedicalClaims: noMedical,
      truthfulClaimsOnly: truthful,
    },
    routes: ['/product-photo', '/sales-video', '/social-publisher'],
    variants: matrix,
  }), [assets.length, matrix, noMedical, platform, product, productUrl, truthful]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <PlaySquare className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI UGC 带货视频工厂</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">从商品链接、卖点和素材生成口播脚本、镜头提示词、A/B 矩阵和发布包。</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {(Object.keys(platforms) as Platform[]).map((key) => (
            <button
              key={key}
              onClick={() => setPlatform(key)}
              className={`rounded-lg border p-4 text-left transition ${platform === key ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <p className="text-sm font-semibold">{platforms[key].label}</p>
              <p className="mt-1 text-xs text-neutral-500">{platforms[key].length}</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Link2 className="h-4 w-4" />商品链接</span>
            <input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">商品名</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">变体数量</span>
              <input type="number" min={3} max={20} value={variants} onChange={(e) => setVariants(Math.max(3, Math.min(20, Number(e.target.value) || 3)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">目标人群</span>
            <textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">可证明卖点</span>
            <textarea value={facts} onChange={(e) => setFacts(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-600 hover:border-brand-300 hover:text-brand-600">
              <ImagePlus className="h-4 w-4" />
              上传商品图/场景图
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={noMedical} onChange={(e) => setNoMedical(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              禁止医疗功效
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={truthful} onChange={(e) => setTruthful(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              只用可证明卖点
            </label>
          </div>

          {assets.length > 0 && (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {assets.map((src, index) => (
                <div key={`${src.slice(0, 20)}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`素材 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {matrix.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.id} · {item.persona}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{item.length}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-brand-700">{item.hook}</p>
              <p className="mt-2 line-clamp-4 text-xs leading-5 text-neutral-600">{item.script}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">投放前检查</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            {[
              '商品图已生成可用于 product-photo 的主图/场景图',
              '口播脚本可复制到 sales-video 生成数字人口播',
              '每条变体都有首秒 hook、人物视角、CTA 和素材提示词',
              '发布包可接 social-publisher 生成图音视频社媒展示',
            ].map((item) => (
              <li key={item} className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">矩阵 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="ugc-ad-matrix.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[460px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
