'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Bot, Download, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export default function VoiceAgentPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [scenario, setScenario] = useState('电商售前客服');
  const [business, setBusiness] = useState('一家售卖 AI 生成商品图、数字人视频和 3D 手办的在线工具');
  const [knowledge, setKnowledge] = useState('价格：按积分计费。生成失败会退积分。支持图片、视频、音频、3D 资产生成。用户如果问退款，先解释失败自动退积分。');
  const [message, setMessage] = useState('我想给我的淘宝商品做一批带货视频，你们能怎么帮我？');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  async function generate() {
    if (!session) return signIn('google');
    if (message.trim().length < 2) return setErr('请填写用户问题。');
    if (timer.current) clearInterval(timer.current);
    setBusy(true);
    setStatus('正在生成客服回答...');
    setErr(null);
    setAnswer('');
    setAudioUrl(null);
    const res = await fetch('/api/voice-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, business, knowledge, message }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }
    setAnswer(j.answer || '');
    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在合成语音...');
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setAudioUrl((Array.isArray(c.outputs) ? c.outputs : [])[0] || null);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setErr('语音生成失败，积分已退回。');
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 语音客服 Agent</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">输入业务知识和用户问题，生成客服回答并合成可播放语音，用于 IVR、预约、售前咨询原型。</p>
          </div>
        </div>
        <div className="card space-y-4 p-5">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">场景</span><input value={scenario} onChange={(e) => setScenario(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">业务描述</span><textarea value={business} onChange={(e) => setBusiness(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">知识库 / FAQ</span><textarea value={knowledge} onChange={(e) => setKnowledge(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">用户问题</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></label>
          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}</> : <><Sparkles className="h-4 w-4" /> 生成回答语音 · 4 {t('podcast.credits')}</>}
          </button>
          {err && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
        </div>
      </section>
      <aside>
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Agent 输出</h2>
          <div className="mt-4 min-h-[260px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-7 text-neutral-700">
            {answer || '回答文本会显示在这里'}
          </div>
          {audioUrl && <audio src={audioUrl} controls className="mt-4 w-full" />}
          {audioUrl && <a href={`/api/download?url=${encodeURIComponent(audioUrl)}`} className="btn-ghost mt-3 w-full"><Download className="h-4 w-4" /> 下载语音</a>}
        </div>
      </aside>
    </div>
  );
}
