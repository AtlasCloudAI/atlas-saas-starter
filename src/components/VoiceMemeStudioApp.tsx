'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Clipboard, Download, FileJson, Loader2, Music, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type Variant = 'meme' | 'faceless';
type RightsMode = 'original' | 'authorized';

const COST = 6;

const memeExamples = [
  {
    title: '电商整活',
    characterName: '夸张但靠谱的 AI 导购',
    voiceStyle: 'fast, punchy, dramatic, comedic, original character voice',
    script: '把一台迷你榨汁机讲得像宇宙飞船引擎，但最后落到真实卖点：便携、好清洗、适合办公室。',
    platform: '抖音 / TikTok 商品短视频',
  },
  {
    title: '游戏 NPC 吐槽',
    characterName: '被玩家薅秃的原创奇幻商人',
    voiceStyle: 'grumpy fantasy shopkeeper, theatrical, short pauses, original voice',
    script: '吐槽玩家每次进店都把木勺和空瓶子拿走，最后反转说欢迎下次再来。',
    platform: '游戏解说 / Shorts',
  },
];

const facelessExamples = [
  {
    title: '科普频道',
    characterName: '冷静的纪录片旁白',
    voiceStyle: 'calm documentary narrator, clear pacing, subtle curiosity',
    script: '为什么人类在深夜更容易做冲动决定，用三个生活例子解释，并给一个温和建议。',
    platform: 'YouTube Shorts / 小红书知识号',
  },
  {
    title: '悬疑故事',
    characterName: '低声讲故事的原创旁白',
    voiceStyle: 'soft suspense narrator, no jumpscare, slow build, warm ending',
    script: '一个人收到来自旧手机的提醒，最后发现是自己过去设置的生日祝福。',
    platform: 'Faceless 故事频道',
  },
];

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function VoiceMemeStudioApp({ variant }: { variant: Variant }) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const examples = variant === 'meme' ? memeExamples : facelessExamples;
  const [characterName, setCharacterName] = useState(examples[0].characterName);
  const [voiceStyle, setVoiceStyle] = useState(examples[0].voiceStyle);
  const [script, setScript] = useState(examples[0].script);
  const [platform, setPlatform] = useState(examples[0].platform);
  const [rightsMode, setRightsMode] = useState<RightsMode>('original');
  const [rightsHolder, setRightsHolder] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [noCelebrity, setNoCelebrity] = useState(true);
  const [commercialSafe, setCommercialSafe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const title = variant === 'meme' ? 'AI 角色配音 Meme' : 'AI Faceless 频道音频';
  const subtitle =
    variant === 'meme'
      ? '为原创角色或已授权角色生成短音频，不支持未授权名人拟声或冒充真实人物。'
      : '为 faceless 频道生成旁白、BGM 和音效方向明确的成片音频原型，并保留授权/发布清单。';

  const prompt = useMemo(() => {
    return [
      variant === 'meme'
        ? 'Create a short original character voice meme audio.'
        : 'Create a faceless channel narration audio with subtle background music and transition sound effects.',
      `Character / narrator: ${characterName}.`,
      `Voice direction: ${voiceStyle}.`,
      `Content brief: ${script}.`,
      `Publishing platform: ${platform}.`,
      rightsMode === 'original'
        ? 'The voice must be an original fictional character and must not imitate any real person.'
        : `Use only the authorized character/voice direction approved by ${rightsHolder || 'the rights holder'}.`,
      noCelebrity ? 'Do not imitate celebrities, politicians, influencers, private people, or recognizable real-person voices.' : '',
      commercialSafe ? 'Avoid copyrighted music, trademark catchphrases, defamatory claims, medical claims, or misleading impersonation.' : '',
      variant === 'meme'
        ? 'Keep it punchy, social-video ready, under 25 seconds, with one memorable line.'
        : 'Keep it clear, paced for short-form video, under 60 seconds, with clean narration and no jumpscares.',
    ]
      .filter(Boolean)
      .join('\n');
  }, [characterName, commercialSafe, noCelebrity, platform, rightsHolder, rightsMode, script, variant, voiceStyle]);

  const checklist = [
    rightsMode === 'original' ? '当前为原创角色模式。' : `当前为授权角色模式：${rightsHolder || '未填写权利方'}。`,
    rightsMode === 'authorized' && rightsConfirmed ? '已确认拥有角色/声线授权。' : rightsMode === 'authorized' ? '授权角色缺少确认。' : '无需真实人物拟声授权。',
    noCelebrity ? '已禁用未授权名人、网红、政治人物或私人声线模仿。' : '建议保持禁用真实人物拟声。',
    commercialSafe ? '已启用商用安全提示。' : '建议启用商用安全提示。',
    '输出适合做音频原型；发布前仍需人工审听文本、音乐和平台合规。',
  ];

  const manifest = {
    app: variant === 'meme' ? 'voice-meme' : 'faceless-channel',
    characterName,
    voiceStyle,
    script,
    platform,
    rightsMode,
    rightsHolder,
    rightsConfirmed,
    noCelebrity,
    commercialSafe,
    prompt,
    checklist,
    generatedAt: new Date().toISOString(),
  };

  function applyExample(example: (typeof examples)[number]) {
    setCharacterName(example.characterName);
    setVoiceStyle(example.voiceStyle);
    setScript(example.script);
    setPlatform(example.platform);
    setRightsMode('original');
    setRightsHolder('');
    setRightsConfirmed(false);
    setNoCelebrity(true);
    setCommercialSafe(true);
    setResultUrl(null);
    setErr(null);
  }

  async function generate() {
    if (!session) return signIn('google');
    if (script.trim().length < 12) return setErr('请先填写内容 brief。');
    if (rightsMode === 'authorized' && (!rightsHolder.trim() || !rightsConfirmed)) return setErr('授权角色模式需要填写权利方并确认授权。');
    if (!noCelebrity) return setErr('请保持禁用未授权真实人物拟声。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交音频任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/audio-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: variant === 'meme' ? 'voice-meme' : 'soundscape', text: prompt, languageCode: 'zh' }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成音频...');
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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Radio className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">{subtitle}</p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { id: 'original' as const, label: '原创角色', note: '默认推荐，不模仿真实人物' },
              { id: 'authorized' as const, label: '授权角色', note: '需要权利方和授权确认' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRightsMode(item.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  rightsMode === item.id ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
              </button>
            ))}
          </div>

          {rightsMode === 'authorized' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">权利方 / 授权来源</span>
                <input
                  value={rightsHolder}
                  onChange={(e) => setRightsHolder(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="mt-3 flex items-start gap-2 text-sm leading-6 text-amber-900">
                <input type="checkbox" checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
                我确认拥有该角色/声线用于当前音频生成和发布的授权。
              </label>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">角色/旁白名称</span>
            <input value={characterName} onChange={(e) => setCharacterName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">声线方向</span>
            <input value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">内容 brief</span>
            <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">发布平台/用途</span>
            <input value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={noCelebrity} onChange={(e) => setNoCelebrity(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              禁用未授权真实人物拟声
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={commercialSafe} onChange={(e) => setCommercialSafe(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              商用安全提示
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">生成指令预览</span>
            <textarea value={prompt} readOnly rows={8} className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-sm leading-6 text-neutral-700 outline-none" />
          </label>

          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成音频 · {COST} {t('podcast.credits')}
              </>
            )}
          </button>
          {err && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {err}
            </p>
          )}
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">案例</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <button key={example.title} onClick={() => applyExample(example)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.script}</p>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">套用案例</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">授权与发布清单</h2>
            <button onClick={() => downloadFile(`${manifest.app}-manifest.json`, JSON.stringify(manifest, null, 2))} className="btn-ghost px-3 py-2 text-xs">
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {checklist.map((check) => (
              <div key={check} className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {check}
              </div>
            ))}
          </div>
          <button onClick={() => navigator.clipboard.writeText(prompt)} className="btn-ghost mt-4 w-full text-xs">
            <Clipboard className="h-3.5 w-3.5" /> 复制生成指令
          </button>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold">音频结果</h2>
          <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              <div className="w-full space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                  <Music className="h-8 w-8" />
                </div>
                <audio src={resultUrl} controls className="w-full" />
              </div>
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Music className="h-8 w-8" />
                <span className="text-sm">音频会显示在这里</span>
              </div>
            )}
          </div>
          {resultUrl && (
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
              <Download className="h-4 w-4" /> 下载音频
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
