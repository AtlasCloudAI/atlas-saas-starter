'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AlertCircle, Clapperboard, Download, Loader2, Radio, Sparkles, Wand2 } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

const COST = 6;

const EXAMPLES = [
  {
    title: '午夜便利店',
    genre: '悬疑治愈',
    characters: '店员阿诚；深夜来买电池的神秘女孩林晚',
    premise: '暴雨夜里，便利店监控画面出现了十分钟前才会发生的事。',
    twist: '女孩不是来求救的，她是在提醒店员避开即将发生的危险。',
  },
  {
    title: '最后一班地铁',
    genre: '都市奇幻',
    characters: '赶末班车的设计师许诺；列车广播里的陌生声音',
    premise: '许诺坐上最后一班地铁，却发现每一站都停在自己错过的人生选择前。',
    twist: '陌生声音其实是未来的自己，只想让她别再逃避真正想做的事。',
  },
  {
    title: '火星来信',
    genre: '科幻温情',
    characters: '火星基地工程师乔南；地球上的妹妹乔一',
    premise: '通讯延迟 18 分钟，乔南收到一封不该出现的实时语音留言。',
    twist: '那不是故障，是妹妹提前录给他的一段生日祝福，被基地 AI 在最孤独的时候送达。',
  },
];

export default function AudioDramaPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [title, setTitle] = useState('午夜便利店');
  const [genre, setGenre] = useState('悬疑治愈');
  const [characters, setCharacters] = useState('店员阿诚；深夜来买电池的神秘女孩林晚');
  const [premise, setPremise] = useState('暴雨夜里，便利店监控画面出现了十分钟前才会发生的事。');
  const [twist, setTwist] = useState('女孩不是来求救的，她是在提醒店员避开即将发生的危险。');
  const [tone, setTone] = useState('cinematic, tense, emotional, and polished');
  const [language, setLanguage] = useState('Chinese');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  function loadExample(example: (typeof EXAMPLES)[number]) {
    setTitle(example.title);
    setGenre(example.genre);
    setCharacters(example.characters);
    setPremise(example.premise);
    setTwist(example.twist);
    setScript('');
    setResultUrl(null);
    setErr(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function errorText(code: string) {
    if (code === 'insufficient_credits') return '积分不足，请先到价格页充值。';
    if (code === 'drama_submit_failed') return '广播剧生成失败，请调整剧情设定后重试。';
    return `Error: ${code || 'failed'}`;
  }

  async function generate() {
    if (!session) return signIn('google');
    if (timer.current) clearInterval(timer.current);
    setBusy(true);
    setStatus('正在写广播剧脚本...');
    setErr(null);
    setScript('');
    setResultUrl(null);

    const res = await fetch('/api/audio-drama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, genre, characters, premise, twist, tone, language }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(errorText(j.error));
      return;
    }

    setScript(j.script || '');
    setStatus('正在生成多角色音频...');
    window.dispatchEvent(new Event('atlas:credits'));
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setResultUrl((Array.isArray(c.outputs) ? c.outputs : [])[0] || null);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(false);
          setStatus(null);
          setErr('音频生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Radio className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 广播剧工厂</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              输入角色、冲突和反转，一键生成带音效提示的短音频剧。
            </p>
          </div>
        </div>

        <div className="card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">剧名</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">类型</span>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <label className="mb-2 mt-4 block text-sm font-medium">角色设定</label>
          <textarea
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            rows={3}
            placeholder="例如：深夜值班的店员；带着秘密的陌生顾客。"
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-medium">
            <Clapperboard className="h-4 w-4 text-brand-500" />
            故事冲突
          </label>
          <textarea
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            rows={4}
            placeholder="例如：监控画面提前显示即将发生的事故。"
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <label className="mb-2 mt-4 block text-sm font-medium">反转或结尾</label>
          <textarea
            value={twist}
            onChange={(e) => setTwist(e.target.value)}
            rows={3}
            placeholder="例如：陌生人其实是在帮主角避开危险。"
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">语气</span>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">语言</span>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> 生成广播剧 · {COST} {t('podcast.credits')}
              </>
            )}
          </button>

          {err && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {err}
            </p>
          )}
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {EXAMPLES.map((example) => (
              <button key={example.title} onClick={() => loadExample(example)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.premise}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  套用案例
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">广播剧音频</h2>
          <div className="mt-4 flex min-h-[160px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              <audio src={resultUrl} controls className="w-full" />
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Sparkles className="h-8 w-8" />
                <span className="text-sm">音频会显示在这里</span>
              </div>
            )}
          </div>
          {resultUrl && (
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
              <Download className="h-4 w-4" /> 下载 MP3
            </a>
          )}
        </div>

        {script && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold">生成脚本</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{script}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
