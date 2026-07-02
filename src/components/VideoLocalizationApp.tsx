'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Clipboard, Download, Languages, Loader2, Sparkles } from 'lucide-react';

type LocalizedSegment = {
  index: number;
  start: string;
  end: string;
  source: string;
  target: string;
  voiceDirection: string;
};

type LocalizationResult = {
  targetLanguage: string;
  titleOptions: string[];
  segments: LocalizedSegment[];
  voiceScript: string;
  qaChecklist: string[];
  srt: string;
};

function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const sampleTranscript = `00:00:00,000 --> 00:00:03,200
这盏桌面补光灯最适合租房和小桌面。

00:00:03,200 --> 00:00:07,000
它不占空间，USB-C 供电，视频会议和拍短视频都能让脸部更干净。

00:00:07,000 --> 00:00:11,000
如果你经常在晚上拍产品或者开会，这个会比普通台灯稳定很多。`;

export function VideoLocalizationApp() {
  const { data: session } = useSession();
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [audience, setAudience] = useState('TikTok / YouTube Shorts viewers in the United States');
  const [tone, setTone] = useState('natural creator voice, concise, not over-selling');
  const [notes, setNotes] = useState('Keep USB-C untranslated. Do not claim medical or professional lighting certification.');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<LocalizationResult | null>(null);

  async function generate() {
    if (!session) return signIn('google');
    if (transcript.trim().length < 12) return setErr('请先粘贴视频转写或 SRT。');
    setBusy(true);
    setErr(null);
    setResult(null);
    const res = await fetch('/api/video-localize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, targetLanguage, audience, tone, notes }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(json.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${json.error || 'failed'}`);
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setResult(json);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Languages className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 视频翻译/本地化</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              粘贴视频转写或 SRT，生成目标语言字幕、配音稿、标题选项和本地化质检清单。
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">视频转写 / SRT</span>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">目标语言</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {['English', 'Spanish', 'Japanese', 'Portuguese', 'French', 'German', 'Arabic'].map((language) => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">受众/平台</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">语气</span>
            <input value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">术语/限制</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> 本地化中...</> : <><Sparkles className="h-4 w-4" /> 生成本地化包 · 3 credits</>}
          </button>
          {err && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">本地化结果</h2>
            {result && (
              <div className="flex gap-2">
                <button onClick={() => downloadFile('localized-subtitles.srt', result.srt)} className="btn-ghost px-3 py-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> SRT
                </button>
                <button onClick={() => downloadFile('video-localization.json', JSON.stringify(result, null, 2), 'application/json')} className="btn-ghost px-3 py-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> JSON
                </button>
              </div>
            )}
          </div>
          {result ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold">标题选项</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-neutral-600">
                  {result.titleOptions.map((title) => <li key={title}>{title}</li>)}
                </ul>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">SRT 字幕</h3>
                  <button onClick={() => navigator.clipboard.writeText(result.srt)} className="btn-ghost px-2 py-1 text-xs">
                    <Clipboard className="h-3.5 w-3.5" /> 复制
                  </button>
                </div>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-5 text-neutral-600">{result.srt}</pre>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold">配音稿</h3>
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-5 text-neutral-600">{result.voiceScript}</pre>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold">质检清单</h3>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-neutral-600">
                  {result.qaChecklist.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400">
              结果会显示 SRT、配音稿、标题和质检清单。
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
