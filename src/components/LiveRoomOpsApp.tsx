'use client';

import { useMemo, useState } from 'react';
import { Activity, ClipboardList, Copy, Download, MessageSquareText, RadioTower, ShieldCheck } from 'lucide-react';

type Channel = 'douyin' | 'taobao' | 'tiktok' | 'private';

const channels: Record<Channel, { label: string; disclosure: string; cadence: string }> = {
  douyin: { label: '抖音直播', disclosure: '直播间显著标注 AI 数字人', cadence: '每 12 分钟循环一次核心卖点' },
  taobao: { label: '淘宝直播', disclosure: '商品页与直播间同步提示 AI 讲解', cadence: '每 8 分钟回到优惠和下单路径' },
  tiktok: { label: 'TikTok Live', disclosure: 'AI host disclosure in profile and live overlay', cadence: 'Every 10 minutes rotate FAQ and CTA' },
  private: { label: '私域/展厅屏', disclosure: '屏幕常驻 AI 接待说明', cadence: '根据到访问题自动切换讲解' },
};

export function LiveRoomOpsApp() {
  const [channel, setChannel] = useState<Channel>('douyin');
  const [product, setProduct] = useState('桌面便携加湿器');
  const [host, setHost] = useState('温和、专业、节奏快的虚拟主播，像认真做功课的家居博主');
  const [facts, setFacts] = useState('低噪；暖色氛围灯；USB-C；小体积；适合办公室和卧室');
  const [faq, setFaq] = useState('多久加一次水？适合多大空间？会不会吵？能不能当夜灯？售后多久？');
  const [hours, setHours] = useState(24);
  const [aiDisclosure, setAiDisclosure] = useState(true);
  const [humanHandoff, setHumanHandoff] = useState(true);
  const [noClaims, setNoClaims] = useState(true);

  const runbook = useMemo(() => {
    const factList = facts.split(/[；;\n]/).map((item) => item.trim()).filter(Boolean);
    const faqList = faq.split(/[？?\n]/).map((item) => item.trim()).filter(Boolean);
    return {
      opening: `大家好，这里是 ${product} 的 AI 讲解直播间。今天会用真实场景讲清楚它适合谁、怎么用、有哪些注意事项。`,
      loops: factList.map((fact, index) => ({
        minute: index * 3,
        topic: fact,
        script: `第 ${index + 1} 段讲解：围绕“${fact}”给一个生活场景，再给一个产品细节特写，最后引导观众提问或查看商品卡。`,
      })),
      faq: faqList.map((question) => ({
        question,
        answer: `先确认用户场景，再基于商品已知信息回答“${question}”。不确定时提示转人工。`,
      })),
    };
  }, [facts, faq, product]);

  const manifest = useMemo(() => ({
    app: 'live-room-ops',
    channel: channels[channel].label,
    product,
    hostPersona: host,
    liveHours: hours,
    compliance: {
      aiDisclosure,
      humanHandoff,
      noUnverifiedClaims: noClaims,
      disclosureText: channels[channel].disclosure,
    },
    cadence: channels[channel].cadence,
    handoffRoutes: ['/virtual-influencer', '/sales-video', '/avatar-agent', '/social-publisher'],
    runbook,
  }), [aiDisclosure, channel, host, hours, humanHandoff, noClaims, product, runbook]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <RadioTower className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">7x24 AI 数字人直播间</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">为虚拟主播生成商品讲解循环、FAQ、转人工规则、合规提示和发布包。</p>
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
              <p className="mt-1 text-xs leading-5 text-neutral-500">{channels[key].cadence}</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">商品/服务</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">直播时长</span>
              <input type="number" min={1} max={24} value={hours} onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">主播人设</span>
            <textarea value={host} onChange={(e) => setHost(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">商品卖点</span>
            <textarea value={facts} onChange={(e) => setFacts(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">FAQ</span>
            <textarea value={faq} onChange={(e) => setFaq(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['AI 标识', aiDisclosure, setAiDisclosure],
              ['转人工', humanHandoff, setHumanHandoff],
              ['禁未证实承诺', noClaims, setNoClaims],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                {label as string}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {runbook.loops.slice(0, 6).map((item) => (
            <div key={`${item.minute}-${item.topic}`} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.topic}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{item.minute} min</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-600">{item.script}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">直播状态板</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">频道</p>
              <p className="mt-1 font-medium">{channels[channel].label}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">循环节奏</p>
              <p className="mt-1 font-medium">{channels[channel].cadence}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">披露文案</p>
              <p className="mt-1 font-medium">{channels[channel].disclosure}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">FAQ 机器人</h2>
          </div>
          <div className="mt-4 space-y-3">
            {runbook.faq.slice(0, 5).map((item) => (
              <div key={item.question} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <p className="font-medium">{item.question}？</p>
                <p className="mt-1 text-xs leading-5 text-neutral-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">直播 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="live-room-runbook.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            已包含 AI 标识、禁未证实承诺、复杂问题转人工。
          </div>
          <pre className="mt-4 max-h-[320px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
