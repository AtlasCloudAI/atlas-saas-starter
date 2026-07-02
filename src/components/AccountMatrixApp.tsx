'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, CalendarDays, ClipboardList, Copy, Download, Users } from 'lucide-react';

type Channel = 'tiktok' | 'reels' | 'shorts' | 'xiaohongshu';

const channels: Record<Channel, { label: string; format: string }> = {
  tiktok: { label: 'TikTok', format: '9:16 快节奏短视频' },
  reels: { label: 'Instagram Reels', format: '9:16 生活方式短片' },
  shorts: { label: 'YouTube Shorts', format: '9:16 搜索友好内容' },
  xiaohongshu: { label: '小红书', format: '3:4/9:16 种草笔记' },
};

function splitItems(value: string) {
  return value
    .split(/[；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function AccountMatrixApp() {
  const [ipName, setIpName] = useState('Mika');
  const [persona, setPersona] = useState('AI 生成的未来感生活方式 KOL，擅长桌搭、效率工具和轻科技好物推荐');
  const [pillars, setPillars] = useState('日常 vlog；好物测评；幕后花絮；粉丝问答；品牌合作');
  const [accounts, setAccounts] = useState(4);
  const [days, setDays] = useState(7);
  const [channel, setChannel] = useState<Channel>('tiktok');
  const [memory, setMemory] = useState(true);
  const [brandSafe, setBrandSafe] = useState(true);

  const calendar = useMemo(() => {
    const items = splitItems(pillars);
    return Array.from({ length: days }, (_, day) =>
      Array.from({ length: accounts }, (_, account) => {
        const pillar = items[(day + account) % Math.max(items.length, 1)] || '日常内容';
        return {
          day: day + 1,
          account: `${ipName}-${account + 1}`,
          pillar,
          title: `${ipName} ${pillar} #${day + 1}`,
          prompt: `Virtual KOL ${ipName}, ${persona}, ${pillar}, ${channels[channel].format}, consistent face and outfit system, clear opening hook, brand safe social content`,
        };
      }),
    ).flat();
  }, [accounts, channel, days, ipName, persona, pillars]);

  const manifest = useMemo(() => ({
    app: 'virtual-kol-account-matrix',
    ipName,
    persona,
    channel: channels[channel].label,
    accounts,
    days,
    memoryEnabled: memory,
    brandSafe,
    contentPillars: splitItems(pillars),
    routes: ['/virtual-influencer', '/showrunner', '/social-publisher'],
    calendar,
  }), [accounts, brandSafe, calendar, channel, days, ipName, memory, persona, pillars]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">虚拟 KOL / 账号矩阵日历</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">为同一个虚拟人 IP 生成多账号内容日历、长期记忆、内容支柱和发布交付包。</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {(Object.keys(channels) as Channel[]).map((key) => (
            <button
              key={key}
              onClick={() => setChannel(key)}
              className={`rounded-lg border p-4 text-left transition ${channel === key ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <p className="text-sm font-semibold">{channels[key].label}</p>
              <p className="mt-1 text-xs text-neutral-500">{channels[key].format}</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-1">
              <span className="mb-1.5 block text-sm font-medium">IP 名称</span>
              <input value={ipName} onChange={(e) => setIpName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">账号数</span>
              <input type="number" min={1} max={10} value={accounts} onChange={(e) => setAccounts(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">排产天数</span>
              <input type="number" min={3} max={30} value={days} onChange={(e) => setDays(Math.max(3, Math.min(30, Number(e.target.value) || 3)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">人设记忆</span>
            <textarea value={persona} onChange={(e) => setPersona(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">内容支柱</span>
            <textarea value={pillars} onChange={(e) => setPillars(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={memory} onChange={(e) => setMemory(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              启用长期记忆
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={brandSafe} onChange={(e) => setBrandSafe(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              品牌安全检查
            </label>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {calendar.slice(0, 8).map((item) => (
            <div key={`${item.day}-${item.account}-${item.pillar}`} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Day {item.day} · {item.account}</p>
                <CalendarDays className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-2 text-sm text-brand-700">{item.title}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-600">{item.prompt}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">IP 交付清单</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>人设记忆和禁忌边界固定，避免每条视频换人格。</li>
            <li>每个账号有独立内容支柱，统一角色视觉识别。</li>
            <li>生成后可送入 virtual-influencer 做视频，再进 social-publisher 发布。</li>
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
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="virtual-kol-calendar.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
