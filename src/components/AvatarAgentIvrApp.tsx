'use client';

import { useMemo, useState } from 'react';
import { Bot, ClipboardList, Copy, Download, GitBranch, PhoneCall, ShieldCheck } from 'lucide-react';

type Channel = 'phone' | 'web' | 'kiosk' | 'live';

const channels: Record<Channel, { label: string; mode: string; fallback: string }> = {
  phone: { label: '电话 IVR', mode: '语音输入 + DTMF 按键', fallback: '三次识别失败转人工坐席' },
  web: { label: '网页客服', mode: '文本/语音输入', fallback: '复杂售后单自动创建工单' },
  kiosk: { label: '门店/展厅数字人', mode: '屏幕数字人 + 语音问答', fallback: '呼叫前台或展示二维码' },
  live: { label: '直播间客服', mode: '弹幕/私信意图识别', fallback: '高风险问题转人工客服' },
};

function splitLines(value: string) {
  return value
    .split(/[；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function AvatarAgentIvrApp() {
  const [channel, setChannel] = useState<Channel>('kiosk');
  const [business, setBusiness] = useState('一家提供 AI 图片、视频、音频和 3D 资产生成的在线工具');
  const [greeting, setGreeting] = useState('您好，我是 AI 前台，可以帮您了解价格、生成流程、失败退款、商用授权和人工支持。');
  const [intents, setIntents] = useState('价格与积分；生成失败退款；商品图/带货视频怎么做；3D 手办怎么做；商用授权；转人工');
  const [knowledge, setKnowledge] = useState('价格按积分计费；生成失败自动退积分；支持图片、视频、音频、3D；涉及真人肖像、声音或逝者内容需要授权。');
  const [privacyNotice, setPrivacyNotice] = useState(true);
  const [handoff, setHandoff] = useState(true);
  const [recordingNotice, setRecordingNotice] = useState(true);

  const flow = useMemo(() => {
    const intentList = splitLines(intents);
    return intentList.map((intent, index) => ({
      node: `N${String(index + 1).padStart(2, '0')}`,
      dtmf: channel === 'phone' ? String(index + 1) : undefined,
      intent,
      prompt: `如果用户询问“${intent}”，先用一句话确认需求，再只根据知识库回答，最后给下一步按钮或转人工选项。`,
      sampleAnswer: `${intent}：我先确认一下您的场景。根据当前知识库，${knowledge.split(/[；;\n]/)[index % splitLines(knowledge).length] || knowledge}。如果需要更详细处理，我可以为您转人工。`,
    }));
  }, [channel, intents, knowledge]);

  const manifest = useMemo(() => ({
    app: 'avatar-agent-ivr',
    business,
    channel: channels[channel].label,
    inputMode: channels[channel].mode,
    greeting,
    compliance: {
      privacyNotice,
      recordingNotice,
      humanHandoff: handoff,
      fallback: channels[channel].fallback,
    },
    knowledgeBase: splitLines(knowledge),
    flow,
    handoffRoutes: ['/voice-agent', '/live-room'],
  }), [business, channel, flow, greeting, handoff, knowledge, privacyNotice, recordingNotice]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">实时客服 / IVR 数字人前台</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">把业务知识库拆成意图、话术节点、转人工规则和可接语音客服的 IVR JSON。</p>
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
              <p className="mt-1 text-xs leading-5 text-neutral-500">{channels[key].mode}</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">业务描述</span>
            <textarea value={business} onChange={(e) => setBusiness(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">开场白</span>
            <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">意图菜单</span>
            <textarea value={intents} onChange={(e) => setIntents(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">知识库</span>
            <textarea value={knowledge} onChange={(e) => setKnowledge(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['隐私提示', privacyNotice, setPrivacyNotice],
              ['录音提示', recordingNotice, setRecordingNotice],
              ['转人工', handoff, setHandoff],
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
            <GitBranch className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">意图流程</h2>
          </div>
          <div className="mt-4 space-y-3">
            {flow.map((node) => (
              <div key={node.node} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{node.node} · {node.intent}</p>
                  {node.dtmf && <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">按 {node.dtmf}</span>}
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-600">{node.prompt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">上线检查</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li className="flex gap-2"><PhoneCall className="mt-0.5 h-4 w-4 text-emerald-600" />{channels[channel].fallback}</li>
            <li>知识库只回答已配置事实，不确定时转人工。</li>
            <li>录音、隐私和 AI 生成身份在首轮明确告知。</li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">IVR JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="avatar-agent-ivr.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
