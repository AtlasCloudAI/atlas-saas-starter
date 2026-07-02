'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Gauge,
  ImageIcon,
  Loader2,
  Package,
  Mic2,
  Sparkles,
  UploadCloud,
  Video,
  Wand2,
} from 'lucide-react';

const COSTS = { plan: 3, asset: 15, video: 25, ugcAudio: 6, avatar: 20, handheld: 15 };

type Slot = { status: 'idle' | 'processing' | 'done' | 'failed'; url?: string };
type SkuAsset = { key: string; label: string; kind: string; prompt: string; aspectRatio: string };
type SkuCopy = { platform: string; title: string; body: string; cta: string; hashtags: string[]; score: number; scoreReason: string };
type SkuPlan = {
  productName: string;
  category: string;
  sellingPoints: string[];
  audience: string;
  assets: SkuAsset[];
  demoVideoPrompt: string;
  ugcScript: string;
  platformCopy: SkuCopy[];
};

async function imageToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function postJson(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'failed');
  return j;
}

function pollCreation(id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let n = 0;
    const t = setInterval(async () => {
      n += 1;
      if (n > 240) {
        clearInterval(t);
        reject(new Error('timeout'));
        return;
      }
      try {
        const c = await (await fetch(`/api/creations/${id}`)).json();
        if (c.status === 'completed') {
          clearInterval(t);
          resolve((Array.isArray(c.outputs) ? c.outputs : [])[0] || '');
        } else if (c.status === 'failed') {
          clearInterval(t);
          reject(new Error('failed'));
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  });
}

function errText(code: string) {
  if (code === 'insufficient_credits') return '积分不足,请到定价页充值。';
  if (code === 'product_image_required') return '请先上传一张商品图。';
  if (code === 'image_too_large') return '图片太大,请换一张。';
  if (code === 'plan_failed') return '方案生成失败(模型未返回有效结果),请重试。';
  if (code === 'upload_failed') return '图片上传失败,请重试。';
  return `出错了:${code}`;
}

export default function SkuStudioPage() {
  const { data: session } = useSession();
  const [productImage, setProductImage] = useState('');
  const [sellingPoints, setSellingPoints] = useState('');
  const [audience, setAudience] = useState('');
  const [platforms, setPlatforms] = useState('Amazon, TikTok, Instagram');
  const [language, setLanguage] = useState('English');
  const [plan, setPlan] = useState<SkuPlan | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [assets, setAssets] = useState<Record<string, Slot>>({});
  const [demo, setDemo] = useState<Slot>({ status: 'idle' });
  const [ugcAudio, setUgcAudio] = useState<Slot>({ status: 'idle' });
  const [actorImage, setActorImage] = useState('');
  const [handheld, setHandheld] = useState<Slot>({ status: 'idle' });
  const [ugcVideo, setUgcVideo] = useState<Slot>({ status: 'idle' });
  const [copied, setCopied] = useState('');

  async function onProductFile(files?: FileList | null) {
    const f = files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setErr(null);
    setProductImage(await imageToDataUrl(f));
    setPlan(null);
    setAssets({});
    setDemo({ status: 'idle' });
    setUgcAudio({ status: 'idle' });
    setUgcVideo({ status: 'idle' });
  }

  async function genPlan() {
    if (!session) return signIn('google');
    if (!productImage) return setErr('请先上传一张商品图。');
    setErr(null);
    setBusy('plan');
    try {
      const j = await postJson('/api/sku/plan', { productImage, sellingPoints, audience, platforms, language });
      setPlan(j.plan);
      setProductUrl(j.productUrl);
      window.dispatchEvent(new Event('atlas:credits'));
    } catch (e) {
      setErr(errText(e instanceof Error ? e.message : 'failed'));
    }
    setBusy(null);
  }

  async function genKit() {
    if (!plan || !productUrl) return;
    setErr(null);
    setBusy('kit');
    const jobs: Promise<unknown>[] = [];
    for (const a of plan.assets) {
      setAssets((s) => ({ ...s, [a.key]: { status: 'processing' } }));
      jobs.push(
        postJson('/api/sku/asset', { productUrl, prompt: a.prompt, aspectRatio: a.aspectRatio })
          .then((j) => pollCreation(j.id))
          .then((url) => setAssets((s) => ({ ...s, [a.key]: { status: 'done', url } })))
          .catch(() => setAssets((s) => ({ ...s, [a.key]: { status: 'failed' } }))),
      );
    }
    setDemo({ status: 'processing' });
    jobs.push(
      postJson('/api/sku/video', { productUrl, prompt: plan.demoVideoPrompt })
        .then((j) => pollCreation(j.id))
        .then((url) => setDemo({ status: 'done', url }))
        .catch(() => setDemo({ status: 'failed' })),
    );
    window.dispatchEvent(new Event('atlas:credits'));
    await Promise.all(jobs);
    setBusy(null);
  }

  async function genUgcAudio() {
    if (!plan) return;
    setErr(null);
    setBusy('ugc');
    setUgcAudio({ status: 'processing' });
    try {
      const j = await postJson('/api/sku/ugc', { script: plan.ugcScript });
      const url = await pollCreation(j.id);
      setUgcAudio({ status: 'done', url });
      window.dispatchEvent(new Event('atlas:credits'));
    } catch {
      setUgcAudio({ status: 'failed' });
    }
    setBusy(null);
  }

  async function genUgcVideo() {
    if (!actorImage) return setErr('请上传一张 AI 主播/真人肖像作为 UGC 出镜形象。');
    if (ugcAudio.status !== 'done' || !ugcAudio.url) return setErr('请先生成口播音频。');
    if (!productUrl) return setErr('请先生成方案(需要商品图)。');
    setErr(null);
    setBusy('avatar');
    try {
      // step 1: 把商品合成进主播手里,这样口播视频里真的看得到商品(而不是空口讲)
      let handheldUrl = handheld.status === 'done' ? handheld.url : undefined;
      if (!handheldUrl) {
        setHandheld({ status: 'processing' });
        const hj = await postJson('/api/sku/handheld', { actorImage, productUrl });
        handheldUrl = await pollCreation(hj.id);
        setHandheld({ status: 'done', url: handheldUrl });
      }
      // step 2: 用「主播手持商品图」驱动数字人口播
      setUgcVideo({ status: 'processing' });
      const j = await postJson('/api/sku/avatar', { actorImage: handheldUrl, audioUrl: ugcAudio.url });
      const url = await pollCreation(j.id);
      setUgcVideo({ status: 'done', url });
      window.dispatchEvent(new Event('atlas:credits'));
    } catch {
      setHandheld((s) => (s.status === 'processing' ? { status: 'failed' } : s));
      setUgcVideo({ status: 'failed' });
    }
    setBusy(null);
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  const dl = (url: string) => `/api/download?url=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Package className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SKU 素材工厂</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            一张商品图 + 卖点 → 一整套可直接投放的素材包:主图 / lifestyle / 详情 / banner + 演示视频 + UGC 口播 + 各平台文案。
            全程用最强模型(claude-opus · nano-banana-pro · veo3.1 · kling-avatar),商品跨物料保持一致。
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* —— 左:输入 + 计划 —— */}
        <section className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">1</span>
              商品图 + 卖点
            </h2>
            <label className="flex min-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onProductFile(e.target.files)} />
              {productImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productImage} alt="product" className="max-h-[220px] w-full object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-7 w-7" />
                  <span className="text-sm">上传商品图(白底或实拍都行)</span>
                </span>
              )}
            </label>

            <label className="mb-1.5 mt-4 block text-sm font-medium">卖点(可留空,让模型看图自己提炼)</label>
            <textarea
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value)}
              rows={3}
              placeholder="如:食品级陶瓷、双层锥形滤孔、萃取均匀、易清洗"
              className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">目标人群</span>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="如:居家咖啡爱好者"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">文案语言</span>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>
            <label className="mb-1.5 mt-3 block text-sm font-medium">投放平台</label>
            <input
              value={platforms}
              onChange={(e) => setPlatforms(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <button onClick={genPlan} disabled={busy !== null} className="btn-brand mt-4 w-full">
              {busy === 'plan' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> claude 正在看图 + 出方案…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> 生成素材方案 · {COSTS.plan} 积分
                </>
              )}
            </button>
            {err && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {err}
              </p>
            )}
          </div>

          {plan && (
            <div className="card space-y-3 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">2</span>
                方案确认
              </h2>
              <div className="text-sm">
                <div className="font-semibold">{plan.productName}</div>
                <div className="text-xs text-neutral-500">{plan.category}</div>
              </div>
              {plan.sellingPoints.length > 0 && (
                <ul className="list-inside list-disc space-y-0.5 text-sm text-neutral-600">
                  {plan.sellingPoints.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
              {plan.audience && <p className="text-xs text-neutral-500">🎯 {plan.audience}</p>}
              <div className="rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                将生成 <b>{plan.assets.length}</b> 张静态素材({plan.assets.map((a) => a.label).join(' / ')})+ <b>1</b> 条演示视频。
              </div>
              <button onClick={genKit} disabled={busy !== null} className="btn-brand w-full">
                {busy === 'kit' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 生成素材包中…(图 ~30s / 视频 ~80s)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> 生成全套素材 · {plan.assets.length * COSTS.asset + COSTS.video} 积分
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* —— 右:素材包输出 —— */}
        <section className="space-y-5">
          {!plan && (
            <div className="card flex min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center text-neutral-300">
              <Package className="h-10 w-10" />
              <p className="text-sm">左侧上传商品图并生成方案,这里会长出一整套素材包。</p>
            </div>
          )}

          {plan && (
            <>
              {/* 静态素材 */}
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <ImageIcon className="h-4 w-4 text-brand-500" /> 静态素材(商品一致)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {plan.assets.map((a) => {
                    const slot = assets[a.key] || { status: 'idle' };
                    return (
                      <div key={a.key} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                        <div className="flex aspect-square items-center justify-center bg-neutral-100">
                          {slot.status === 'done' && slot.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slot.url} alt={a.label} className="h-full w-full object-cover" />
                          ) : slot.status === 'processing' ? (
                            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                          ) : slot.status === 'failed' ? (
                            <AlertCircle className="h-6 w-6 text-red-400" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-neutral-300" />
                          )}
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5">
                          <span className="text-xs font-medium text-neutral-600">{a.label}</span>
                          {slot.status === 'done' && slot.url && (
                            <a href={dl(slot.url)} className="text-brand-600 hover:text-brand-700">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 演示视频 */}
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Video className="h-4 w-4 text-brand-500" /> 商品演示视频(veo3.1,原生音频)
                </h3>
                <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                  {demo.status === 'done' && demo.url ? (
                    <video src={demo.url} controls className="max-h-[360px] w-full rounded-lg" />
                  ) : demo.status === 'processing' ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
                      <span className="text-xs">生成中 ~60-90s</span>
                    </div>
                  ) : demo.status === 'failed' ? (
                    <span className="text-sm text-red-500">演示视频生成失败</span>
                  ) : (
                    <span className="text-sm text-neutral-300">点「生成全套素材」后出现</span>
                  )}
                </div>
                {demo.status === 'done' && demo.url && (
                  <a href={dl(demo.url)} className="btn-ghost mt-3 w-full">
                    <Download className="h-4 w-4" /> 下载演示视频
                  </a>
                )}
              </div>

              {/* UGC 口播 */}
              <div className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Mic2 className="h-4 w-4 text-brand-500" /> UGC 口播(seed-audio 口播 + kling 数字人)
                </h3>
                <p className="mb-3 rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">{plan.ugcScript}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={genUgcAudio} disabled={busy !== null} className="btn-ghost">
                    {ugcAudio.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic2 className="h-4 w-4" />}
                    生成口播音频 · {COSTS.ugcAudio}
                  </button>
                  {ugcAudio.status === 'done' && ugcAudio.url && <audio src={ugcAudio.url} controls className="h-9" />}
                </div>
                {ugcAudio.status === 'done' && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-500">
                      <UploadCloud className="h-4 w-4" /> 上传出镜形象(AI 主播 / 真人肖像)—— 会先把商品合成进 TA 手里再驱动口播,让视频里看得到商品
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setActorImage(await imageToDataUrl(f));
                              setHandheld({ status: 'idle' });
                            }
                          }}
                        />
                        {actorImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={actorImage} alt="actor" className="h-full w-full object-cover" />
                        ) : (
                          <UploadCloud className="h-5 w-5 text-neutral-300" />
                        )}
                      </label>
                      {handheld.status !== 'idle' && (
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50" title="主播手持商品(自动合成)">
                          {handheld.status === 'done' && handheld.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={handheld.url} alt="主播手持商品" className="h-full w-full object-cover" />
                          ) : handheld.status === 'processing' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      )}
                      <button onClick={genUgcVideo} disabled={busy !== null} className="btn-brand">
                        {busy === 'avatar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                        生成 UGC 口播视频(手持商品) · {COSTS.handheld + COSTS.avatar}
                      </button>
                      {ugcVideo.status === 'failed' && <span className="text-xs text-red-500">失败</span>}
                    </div>
                    {handheld.status === 'processing' && <p className="mt-2 text-xs text-neutral-400">正在把商品合成进主播手里…</p>}
                    {ugcVideo.status === 'processing' && <p className="mt-2 text-xs text-neutral-400">数字人口播生成中 ~5-7min…</p>}
                    {ugcVideo.status === 'done' && ugcVideo.url && (
                      <div className="mt-3">
                        <video src={ugcVideo.url} controls className="max-h-[360px] w-full rounded-lg" />
                        <a href={dl(ugcVideo.url)} className="btn-ghost mt-2 w-full">
                          <Download className="h-4 w-4" /> 下载 UGC 视频
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 平台文案 + 评分 */}
              {plan.platformCopy.length > 0 && (
                <div className="card p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Gauge className="h-4 w-4 text-brand-500" /> 各平台文案 + 预测评分
                  </h3>
                  <div className="space-y-3">
                    {plan.platformCopy.map((c, i) => {
                      const block = `【${c.platform}】${c.title}\n\n${c.body}\n\n${c.cta}\n${c.hashtags.map((h) => '#' + h).join(' ')}`;
                      return (
                        <div key={i} className="rounded-xl border border-neutral-200 p-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-sm font-semibold">{c.platform}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  c.score >= 80 ? 'bg-green-100 text-green-700' : c.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                {c.score}
                              </span>
                              <button onClick={() => copy(block, `copy-${i}`)} className="text-neutral-400 hover:text-brand-600">
                                {copied === `copy-${i}` ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-neutral-800">{c.title}</div>
                          <div className="mt-1 whitespace-pre-line text-xs leading-5 text-neutral-600">{c.body}</div>
                          <div className="mt-1.5 text-xs font-medium text-brand-600">{c.cta}</div>
                          {c.hashtags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {c.hashtags.map((h, j) => (
                                <span key={j} className="text-xs text-neutral-400">
                                  #{h}
                                </span>
                              ))}
                            </div>
                          )}
                          {c.scoreReason && <div className="mt-1.5 text-xs text-neutral-400">📊 {c.scoreReason}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
