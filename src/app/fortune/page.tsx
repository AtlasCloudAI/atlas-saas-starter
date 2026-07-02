'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export default function FortunePage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [mode, setMode] = useState('八字 + 塔罗风格综合报告');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('1998-08-18 09:30，出生地上海');
  const [question, setQuestion] = useState('最近 30 天我的事业和感情有什么机会？');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function handleImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('请上传图片文件。');
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setErr(null);
    };
    reader.onerror = () => setErr('图片读取失败。');
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!session) return signIn('google');
    setBusy(true);
    setErr(null);
    setReport('');
    const res = await fetch('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, name, birth, question, image }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setReport(j.report || '');
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 算命看相工作室</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">输入生日、问题或上传照片，生成可分享的娱乐向命运/塔罗/面相报告，并可衔接前世写真。</p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">报告类型</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option>八字 + 塔罗风格综合报告</option>
              <option>面相氛围解读</option>
              <option>前世今生故事报告</option>
              <option>事业财运 30 天行动报告</option>
              <option>感情关系能量报告</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">昵称</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="可选" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">出生信息</span>
            <input value={birth} onChange={(e) => setBirth(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">想问的问题</span>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center hover:border-brand-300">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] || undefined)} />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="face" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud className="h-7 w-7" />
                <span className="text-sm">可选：上传照片做氛围解读</span>
              </span>
            )}
          </label>
          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> 生成报告中...</> : <><Sparkles className="h-4 w-4" /> 生成报告 · 2 {t('podcast.credits')}</>}
          </button>
          {err && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
        </div>
      </section>

      <aside>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">报告结果</h2>
            {report && (
              <button onClick={() => navigator.clipboard.writeText(report)} className="btn-ghost px-3 py-2 text-xs">
                <Copy className="h-3.5 w-3.5" /> 复制
              </button>
            )}
          </div>
          <div className="mt-4 min-h-[420px] whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-7 text-neutral-700">
            {report || '报告会显示在这里'}
          </div>
        </div>
      </aside>
    </div>
  );
}
