'use client';

import { useMemo, useState } from 'react';
import { Clipboard, Download, PackageCheck, ShieldCheck } from 'lucide-react';

const materials = {
  resin: { label: '树脂彩色打印', base: 18, multiplier: 1.25 },
  pla: { label: 'PLA 单色打印', base: 10, multiplier: 0.9 },
  sandstone: { label: '砂岩全彩', base: 22, multiplier: 1.45 },
  metal: { label: '金属质感喷涂', base: 28, multiplier: 1.8 },
} as const;

const finishes = {
  raw: { label: '基础打磨', price: 8 },
  painted: { label: '手工上色', price: 38 },
  premium: { label: '礼盒精修', price: 68 },
} as const;

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function PodOrderApp() {
  const [customer, setCustomer] = useState('Luna 宠物纪念公仔');
  const [assetUrl, setAssetUrl] = useState('https://example.com/luna-figurine.glb');
  const [height, setHeight] = useState(12);
  const [quantity, setQuantity] = useState(1);
  const [material, setMaterial] = useState<keyof typeof materials>('resin');
  const [finish, setFinish] = useState<keyof typeof finishes>('premium');
  const [complexity, setComplexity] = useState(2);
  const [fragile, setFragile] = useState(true);
  const [consent, setConsent] = useState(true);

  const quote = useMemo(() => {
    const m = materials[material];
    const f = finishes[finish];
    const volumeFactor = Math.max(1, Math.pow(height / 10, 2.2));
    const complexityFee = 12 * complexity;
    const fragileFee = fragile ? 16 : 0;
    const unitCost = (m.base * volumeFactor + f.price + complexityFee + fragileFee) * m.multiplier;
    const setup = 18;
    const subtotal = unitCost * quantity + setup;
    const recommendedPrice = subtotal * 2.4;
    return {
      unitCost,
      setup,
      subtotal,
      recommendedPrice,
      grossMargin: recommendedPrice - subtotal,
      marginRate: (recommendedPrice - subtotal) / recommendedPrice,
    };
  }, [complexity, finish, fragile, height, material, quantity]);

  const checks = [
    consent ? '已确认客户拥有照片/肖像/宠物素材授权。' : '缺少素材授权，先不要进入生产。',
    assetUrl.includes('.glb') || assetUrl.includes('.stl') || assetUrl.includes('.obj')
      ? '文件格式看起来可进入 3D 生产检查。'
      : '建议上传 GLB/STL/OBJ 生产文件。',
    height >= 8 && height <= 25 ? '尺寸在常规桌面摆件范围。' : '尺寸偏离常规范围，需要人工报价。',
    fragile ? '存在易损结构，生产前需要加厚耳朵/手指/尾巴等细节。' : '结构未标记易损，可进入标准检查。',
    '打印前确认：非流形边、薄壁、小零件、底座稳定性、纹理贴图路径。',
  ];

  const manifest = {
    customer,
    assetUrl,
    heightCm: height,
    quantity,
    material: materials[material].label,
    finish: finishes[finish].label,
    fragile,
    consent,
    quote,
    checks,
  };

  const approvalText = `订单确认：${customer}
文件：${assetUrl}
规格：${height}cm / ${materials[material].label} / ${finishes[finish].label} / x${quantity}
预估成本：${money(quote.subtotal)}
建议售价：${money(quote.recommendedPrice)}

生产前需客户确认：
1. 已授权使用上传素材制作实体纪念品。
2. 3D 预览图可接受，打印后存在轻微色差和纹理误差。
3. 易损结构已知悉，运输破损按售后规则处理。`;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <PackageCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI POD 下单履约</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              把 3D 手办/纪念摆件文件转成报价、打印检查、客户确认文本和订单交付清单。
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">订单名称</span>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">3D 文件链接/文件名</span>
            <input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">高度 cm</span>
              <input type="number" min={5} max={40} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">数量</span>
              <input type="number" min={1} max={50} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">材质</span>
              <select value={material} onChange={(e) => setMaterial(e.target.value as keyof typeof materials)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                {Object.entries(materials).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">后处理</span>
              <select value={finish} onChange={(e) => setFinish(e.target.value as keyof typeof finishes)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                {Object.entries(finishes).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">复杂度 {complexity}</span>
            <input type="range" min={1} max={5} value={complexity} onChange={(e) => setComplexity(Number(e.target.value))} className="w-full" />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} />
              含易损结构
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              已获素材授权
            </label>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">报价与履约</h2>
            <button
              onClick={() => downloadFile('pod-order-manifest.json', JSON.stringify(manifest, null, 2), 'application/json')}
              className="btn-ghost px-3 py-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">预估成本</div>
              <div className="mt-1 text-xl font-bold">{money(quote.subtotal)}</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">建议售价</div>
              <div className="mt-1 text-xl font-bold text-brand-600">{money(quote.recommendedPrice)}</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">毛利</div>
              <div className="mt-1 text-xl font-bold">{money(quote.grossMargin)}</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs text-neutral-500">毛利率</div>
              <div className="mt-1 text-xl font-bold">{Math.round(quote.marginRate * 100)}%</div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {checks.map((check) => (
              <div key={check} className="flex gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {check}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold">客户确认文本</div>
            <pre className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">{approvalText}</pre>
            <button onClick={() => navigator.clipboard.writeText(approvalText)} className="btn-ghost mt-3 w-full text-xs">
              <Clipboard className="h-3.5 w-3.5" /> 复制确认文本
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
