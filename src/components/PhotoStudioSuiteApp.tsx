'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Camera, CheckCircle2, ClipboardList, Copy, Download, ImagePlus, PackageCheck, Trash2 } from 'lucide-react';

type PackageKey = 'headshot' | 'id' | 'wedding' | 'yearbook' | 'dating';

const packages: Record<PackageKey, { label: string; scenes: string[]; files: string[]; price: number }> = {
  headshot: {
    label: '职业照套装',
    scenes: ['白底商务正装', '深灰 CEO 肖像', 'LinkedIn 横版封面'],
    files: ['1:1 头像', '4:5 社媒图', '高清修片原图'],
    price: 199,
  },
  id: {
    label: '证件照套装',
    scenes: ['白底', '蓝底', '红底'],
    files: ['一寸排版', '二寸排版', '电子证件照'],
    price: 39,
  },
  wedding: {
    label: '婚纱写真套装',
    scenes: ['法式室内棚拍', '海边日落', '黑白纪实'],
    files: ['精修 12 张', '朋友圈九宫格', '短视频封面'],
    price: 599,
  },
  yearbook: {
    label: '复古年鉴套装',
    scenes: ['90s 校园', '千禧复古', '运动社团'],
    files: ['年鉴拼图', '单张头像', '海报封面'],
    price: 129,
  },
  dating: {
    label: '约会资料照套装',
    scenes: ['咖啡馆自然光', '城市漫步', '运动生活方式'],
    files: ['主头像', '生活照 6 张', '资料页封面'],
    price: 169,
  },
};

export function PhotoStudioSuiteApp() {
  const [selected, setSelected] = useState<PackageKey>('headshot');
  const [customer, setCustomer] = useState('陈女士');
  const [style, setStyle] = useState('自然高级，不夸张磨皮，保留真实五官和亲和力');
  const [privacy, setPrivacy] = useState(true);
  const [manualReview, setManualReview] = useState(true);
  const [revision, setRevision] = useState(true);
  const [previews, setPreviews] = useState<string[]>([]);

  const pack = packages[selected];

  function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 8);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    ).then((items) => setPreviews((prev) => [...prev, ...items].slice(0, 8)));
    event.target.value = '';
  }

  const manifest = useMemo(() => {
    const filePrefix = `${customer || 'customer'}-${selected}`;
    return {
      app: 'photo-studio-suite',
      customer,
      package: pack.label,
      style,
      sourceImages: previews.length,
      scenes: pack.scenes,
      deliverables: pack.files.map((file, index) => `${filePrefix}-${index + 1}-${file}`),
      price: pack.price,
      reviewFlow: ['AI 初稿生成', manualReview ? '人工筛选和脸部一致性复核' : '自动筛选', revision ? '客户 1 次重修' : '无重修', '打包交付'],
      safeguards: {
        privacyConsent: privacy,
        manualReview,
        revisionPolicy: revision,
      },
    };
  }, [customer, manualReview, pack, previews.length, privacy, revision, selected, style]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Camera className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 影楼交付工作台</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">把客户自拍、套餐、修片规则和交付文件组织成影楼可执行订单。</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {(Object.keys(packages) as PackageKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`rounded-lg border p-4 text-left transition ${
                selected === key ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <p className="text-sm font-semibold">{packages[key].label}</p>
              <p className="mt-1 text-xs text-neutral-500">￥{packages[key].price} 起</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">客户名/订单名</span>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">参考照片</span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-600 hover:border-brand-300 hover:text-brand-600">
                <ImagePlus className="h-4 w-4" />
                上传自拍/参考图
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
              </label>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
              {previews.map((src, index) => (
                <div key={`${src.slice(0, 20)}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`参考图 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
              <button onClick={() => setPreviews([])} className="flex aspect-square items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">风格要求</span>
            <textarea value={style} onChange={(e) => setStyle(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['隐私授权', privacy, setPrivacy],
              ['人工复核', manualReview, setManualReview],
              ['支持重修', revision, setRevision],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                {label as string}
              </label>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">交付包</h2>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-medium">场景</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pack.scenes.map((scene) => <span key={scene} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{scene}</span>)}
              </div>
            </div>
            <div>
              <p className="font-medium">文件</p>
              <ul className="mt-2 space-y-2 text-neutral-600">
                {pack.files.map((file) => (
                  <li key={file} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{file}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-600">
              订单会保留原始上传、AI 初稿、人工精修、客户确认和最终交付文件名，便于线下门店交接。
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">订单 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="photo-studio-order.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
