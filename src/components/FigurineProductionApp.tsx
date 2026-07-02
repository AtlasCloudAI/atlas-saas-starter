'use client';

import { useMemo, useState } from 'react';
import { Box, ClipboardList, Copy, Download, PackageCheck, Ruler } from 'lucide-react';
import { ImageTo3DGenerationApp } from '@/components/ImageTo3DGenerationApp';

type Variant = 'person' | 'memorial';

export function FigurineProductionApp({ variant }: { variant: Variant }) {
  const isMemorial = variant === 'memorial';
  const [orderName, setOrderName] = useState(isMemorial ? '奶糖纪念摆件' : '小林生日手办');
  const [height, setHeight] = useState(isMemorial ? 12 : 18);
  const [material, setMaterial] = useState('树脂彩色打印');
  const [baseText, setBaseText] = useState(isMemorial ? '奶糖 2014-2026' : 'Happy Birthday');
  const [consent, setConsent] = useState(true);
  const [printCheck, setPrintCheck] = useState(true);

  const manifest = useMemo(() => ({
    app: isMemorial ? 'memorial-figurine' : 'photo-to-figurine',
    orderName,
    targetHeightCm: height,
    material,
    baseText,
    consent,
    printCheck,
    productionChecks: [
      '主体完整、脸部/毛色参考清晰',
      '生成 GLB/OBJ 后检查壁厚、水密、悬空和支撑',
      '底座文字单独建模，避免和主体粘连失败',
      '实体打印前由人工确认尺寸、材质、颜色和运输风险',
    ],
    handoffRoutes: ['/image-to-3d', '/stl-marketplace', '/ar-commerce'],
  }), [baseText, consent, height, isMemorial, material, orderName, printCheck]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Box className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{isMemorial ? '宠物/亲人纪念 3D 公仔' : '照片到实体手办工坊'}</h1>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">先生成 3D 模型，再把尺寸、底座、授权和打印质检整理成实体生产订单。</p>
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">订单名</span>
                <input value={orderName} onChange={(e) => setOrderName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">目标高度 cm</span>
                <input type="number" min={6} max={40} value={height} onChange={(e) => setHeight(Math.max(6, Math.min(40, Number(e.target.value) || 6)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">材质/工艺</span>
              <input value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">底座文字</span>
              <input value={baseText} onChange={(e) => setBaseText(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                已取得照片/肖像授权
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={printCheck} onChange={(e) => setPrintCheck(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                打印前人工质检
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">生产检查</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {manifest.productionChecks.map((item) => <li key={item}>• {item}</li>)}
            </ul>
            <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-600">
              <Ruler className="mr-1 inline h-3.5 w-3.5" />
              当前目标高度 {height}cm，建议先打印小样确认脸部和底座细节。
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-semibold">生产 JSON</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
                <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="figurine-production.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
              </div>
            </div>
            <pre className="mt-4 max-h-[300px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
          </div>
        </aside>
      </section>

      <ImageTo3DGenerationApp
        title={isMemorial ? '生成纪念公仔 3D 模型' : '生成实体手办 3D 模型'}
        subtitle={isMemorial ? '上传宠物或亲人授权照片，生成可下载 3D 资产，再进入 STL/打印检查。' : '上传人物或宠物清晰参考图，生成可下载 3D 资产，再进入实体生产订单。'}
        uploadHint={isMemorial ? '上传宠物/亲人主体清晰的授权照片' : '上传主体完整、姿态清晰的手办参考图'}
        uploadSubhint="建议正面或 3/4 角度，背景简单，主体不要被遮挡"
        defaultPbr
        defaultFaceCount={isMemorial ? 900000 : 800000}
        useCases={[
          { title: '3D 生成', note: '用图生 3D 生成 GLB/OBJ 资产，先看比例和主体还原。' },
          { title: 'STL 上架', note: '进入 STL 市集检查壁厚、水密、支撑和授权。' },
          { title: 'AR 预览', note: '用 AR 商品页生成 model-viewer 嵌入，给客户确认尺寸。' },
        ]}
      />
    </div>
  );
}
