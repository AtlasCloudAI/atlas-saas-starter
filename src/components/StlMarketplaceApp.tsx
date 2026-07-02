'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Clipboard, Download, FileJson, PackageCheck, ShieldCheck, Store } from 'lucide-react';

type ListingTier = 'preview' | 'paid-stl' | 'print-on-demand';
type License = 'personal' | 'commercial' | 'exclusive';

const tiers: Record<ListingTier, { label: string; note: string }> = {
  preview: { label: '免费低模预览', note: '引流、收藏、打印风险提示' },
  'paid-stl': { label: '付费 STL 下载', note: '标准市集售卖，创作者分成' },
  'print-on-demand': { label: '代打印实物', note: '平台报价、生产和发货' },
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function StlMarketplaceApp() {
  const [title, setTitle] = useState('Moon Base Chibi Astronaut Figurine');
  const [creator, setCreator] = useState('Atlas Creator');
  const [assetUrl, setAssetUrl] = useState('https://example.com/assets/moon-astronaut.stl');
  const [tier, setTier] = useState<ListingTier>('paid-stl');
  const [license, setLicense] = useState<License>('personal');
  const [price, setPrice] = useState(9.9);
  const [platformFee, setPlatformFee] = useState(20);
  const [heightCm, setHeightCm] = useState(12);
  const [wallMm, setWallMm] = useState(1.6);
  const [parts, setParts] = useState(1);
  const [supports, setSupports] = useState(true);
  const [watertight, setWatertight] = useState(false);
  const [commercialConsent, setCommercialConsent] = useState(true);

  const revenue = useMemo(() => {
    const fee = price * (platformFee / 100);
    return {
      price,
      platformFee: fee,
      creatorPayout: price - fee,
    };
  }, [platformFee, price]);

  const checks = [
    assetUrl.endsWith('.stl') || assetUrl.endsWith('.glb') || assetUrl.endsWith('.obj') ? '文件扩展名适合 3D 市集入口。' : '建议上传 STL/GLB/OBJ 文件。',
    wallMm >= 1.2 ? '壁厚满足常见树脂/PLA 入门要求。' : '壁厚低于 1.2mm，打印失败风险高。',
    watertight ? '已确认水密/非流形检查通过。' : '水密/非流形检查未确认，上架前需要修复。',
    supports ? '需要支撑，商品页应提示支撑痕迹和清理难度。' : '模型标记为免支撑或低支撑。',
    commercialConsent ? '已确认拥有该模型上架销售授权。' : '缺少商业授权，不应上架。',
    tier === 'print-on-demand' ? '代打印档需要生产成本、材质、包装和物流 SLA。' : '数字下载档需要防盗链、水印预览和退款规则。',
  ];

  const listingCopy = `${title}
作者：${creator}
档位：${tiers[tier].label}
授权：${license}
文件：${assetUrl}
尺寸：${heightCm}cm / ${parts} 个部件 / 壁厚 ${wallMm}mm
价格：${money(price)}，平台服务费 ${platformFee}%，创作者预计收入 ${money(revenue.creatorPayout)}

上架前质检：
${checks.map((check, index) => `${index + 1}. ${check}`).join('\n')}`;

  const manifest = {
    app: 'stl-marketplace',
    title,
    creator,
    assetUrl,
    tier,
    license,
    price,
    platformFee,
    creatorPayout: revenue.creatorPayout,
    heightCm,
    wallMm,
    parts,
    supports,
    watertight,
    commercialConsent,
    checks,
    listingCopy,
    generatedAt: new Date().toISOString(),
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI STL 市集/打印工作流</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              把 3D 资产整理成可售卖的 STL 商品页，覆盖质检、授权、定价、分成和代打印交付。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">商品标题</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">创作者</span>
              <input value={creator} onChange={(e) => setCreator(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">模型文件 URL / 文件名</span>
            <input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div>
            <div className="mb-2 text-sm font-medium">售卖档位</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(tiers).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTier(key as ListingTier)}
                  className={`rounded-lg border p-3 text-left transition ${
                    tier === key ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">授权</span>
              <select value={license} onChange={(e) => setLicense(e.target.value as License)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                <option value="personal">个人使用</option>
                <option value="commercial">商用授权</option>
                <option value="exclusive">独家授权</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">售价 $</span>
              <input type="number" min={0} step={0.5} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">平台费 %</span>
              <input type="number" min={0} max={80} value={platformFee} onChange={(e) => setPlatformFee(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">高度 cm</span>
              <input type="number" min={1} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">最小壁厚 mm</span>
              <input type="number" min={0.2} step={0.1} value={wallMm} onChange={(e) => setWallMm(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">部件数</span>
              <input type="number" min={1} value={parts} onChange={(e) => setParts(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={supports} onChange={(e) => setSupports(e.target.checked)} className="h-4 w-4 accent-brand-600" />
                需要支撑
              </label>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={watertight} onChange={(e) => setWatertight(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              水密/非流形已检查
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={commercialConsent} onChange={(e) => setCommercialConsent(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              已获上架销售授权
            </label>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">上架与分成</h2>
            <button onClick={() => downloadFile('stl-marketplace-listing.json', JSON.stringify(manifest, null, 2))} className="btn-ghost px-3 py-2 text-xs">
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">售价</div>
              <div className="mt-1 font-bold">{money(revenue.price)}</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">平台费</div>
              <div className="mt-1 font-bold">{money(revenue.platformFee)}</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">创作者</div>
              <div className="mt-1 font-bold text-brand-600">{money(revenue.creatorPayout)}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {checks.map((check) => (
              <div key={check} className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {check}
              </div>
            ))}
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">{listingCopy}</pre>
          <button onClick={() => navigator.clipboard.writeText(listingCopy)} className="btn-ghost mt-3 w-full text-xs">
            <Clipboard className="h-3.5 w-3.5" /> 复制上架文案
          </button>
          <button onClick={() => downloadFile('stl-marketplace-listing.txt', listingCopy, 'text/plain')} className="btn-ghost mt-3 w-full text-xs">
            <Download className="h-3.5 w-3.5" /> 下载上架文案
          </button>
          <Link href="/text-to-3d" className="btn-ghost mt-3 w-full text-xs">
            先生成 3D 模型
          </Link>
        </div>
      </aside>
    </div>
  );
}
