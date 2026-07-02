'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Baby, ClipboardList, Copy, Download, ShieldCheck } from 'lucide-react';

export function ChildSeriesShell({ children }: { children: ReactNode }) {
  const [childName, setChildName] = useState('小星');
  const [guardian, setGuardian] = useState('妈妈');
  const [episodes, setEpisodes] = useState(6);
  const [portraitConsent, setPortraitConsent] = useState(true);
  const [safeContent, setSafeContent] = useState(true);
  const [noPersonalData, setNoPersonalData] = useState(true);

  const manifest = useMemo(() => ({
    app: 'child-animation-series',
    childName,
    guardian,
    episodes,
    constraints: {
      portraitConsent,
      childSafe: safeContent,
      noPersonalData,
      noScaryScenes: true,
      bedtimeFriendly: true,
    },
    seriesPlan: Array.from({ length: episodes }, (_, index) => ({
      episode: index + 1,
      theme: ['分享玩具', '整理房间', '认识星星', '勇敢说谢谢', '睡前晚安', '周末小冒险'][index % 6],
      promptNote: `保持同一儿童友好角色，不暴露真实姓名、学校、住址等隐私，第 ${index + 1} 集用温和动作和安全音乐。`,
    })),
    handoffRoutes: ['/child-animation', '/kids-book', '/bedtime-story'],
  }), [childName, episodes, guardian, noPersonalData, portraitConsent, safeContent]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Baby className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">儿童连载安全与授权</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">为儿童动画、绘本和睡前故事统一保存监护人授权、隐私限制和分集计划。</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">儿童昵称</span>
              <input value={childName} onChange={(e) => setChildName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">监护关系</span>
              <input value={guardian} onChange={(e) => setGuardian(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">分集数</span>
              <input type="number" min={3} max={20} value={episodes} onChange={(e) => setEpisodes(Math.max(3, Math.min(20, Number(e.target.value) || 3)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['肖像授权', portraitConsent, setPortraitConsent],
              ['儿童安全内容', safeContent, setSafeContent],
              ['不包含个人隐私', noPersonalData, setNoPersonalData],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                {label as string}
              </label>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-600">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
            动画、绘本和睡前音频都使用同一组安全约束，避免恐吓、隐私暴露和未经授权的儿童肖像使用。
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">连载 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="child-series-plan.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[260px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </section>

      {children}
    </div>
  );
}
