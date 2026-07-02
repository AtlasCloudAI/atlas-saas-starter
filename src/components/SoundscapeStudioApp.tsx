'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Clipboard, Download, FileJson, Loader2, Music, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type AudioType = 'loop-bgm' | 'sfx-pack' | 'ambience' | 'intro-sting';

type Example = {
  title: string;
  note: string;
  audioType: AudioType;
  project: string;
  mood: string;
  sonicPalette: string;
  sceneDetails: string;
  duration: number;
  loopable: boolean;
};

const audioTypes: { id: AudioType; label: string; note: string }[] = [
  { id: 'loop-bgm', label: '循环 BGM', note: '短视频/播客/游戏可循环底乐' },
  { id: 'sfx-pack', label: '音效包', note: '按钮、转场、提示、环境点缀' },
  { id: 'ambience', label: '氛围音', note: 'ASMR、冥想、学习、睡眠' },
  { id: 'intro-sting', label: '主题曲/片头', note: '品牌开场、栏目包装、揭幕' },
];

const examples: Example[] = [
  {
    title: '产品发布片头',
    note: '适合广告开头和新品 reveal。',
    audioType: 'intro-sting',
    project: '高端桌面补光灯新品发布短视频',
    mood: 'premium, clean, confident, modern',
    sonicPalette: 'soft cinematic rise, restrained synth pulse, clean percussion, warm sub bass',
    sceneDetails: 'start minimal, build for 18 seconds, end with an elegant brand reveal hit',
    duration: 30,
    loopable: false,
  },
  {
    title: '学习频道循环底乐',
    note: '低干扰、可循环、无明显旋律疲劳。',
    audioType: 'loop-bgm',
    project: '30 分钟学习陪伴视频',
    mood: 'calm, focused, rainy night, low distraction',
    sonicPalette: 'lo-fi piano chords, soft vinyl crackle, gentle rain, warm ambient pad',
    sceneDetails: 'no sudden hits, no lead vocal, seamless loop point at the end',
    duration: 45,
    loopable: true,
  },
  {
    title: 'App 操作音效包',
    note: '一组轻量 UI 声音，可用于产品原型。',
    audioType: 'sfx-pack',
    project: 'AI 创作工具的 Web App 声音品牌',
    mood: 'bright, precise, friendly, not childish',
    sonicPalette: 'soft glass taps, subtle digital sparkle, short warm confirmation chimes',
    sceneDetails: 'include upload success, generation start, task completed, error warning, download ready',
    duration: 20,
    loopable: false,
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

export function SoundscapeStudioApp() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [audioType, setAudioType] = useState<AudioType>('loop-bgm');
  const [project, setProject] = useState('短视频产品开场');
  const [mood, setMood] = useState('premium, clean, confident, modern');
  const [sonicPalette, setSonicPalette] = useState('soft cinematic rise, restrained synth pulse, clean percussion, warm sub bass');
  const [sceneDetails, setSceneDetails] = useState('start minimal, build for 18 seconds, end with an elegant brand reveal hit');
  const [duration, setDuration] = useState(30);
  const [loopable, setLoopable] = useState(true);
  const [noVocals, setNoVocals] = useState(true);
  const [commercialLicense, setCommercialLicense] = useState(true);
  const [avoidCopyright, setAvoidCopyright] = useState(true);
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

  const selectedType = audioTypes.find((item) => item.id === audioType) || audioTypes[0];

  const prompt = useMemo(() => {
    return [
      `Create a ${duration}-second ${selectedType.label} for: ${project}.`,
      `Mood: ${mood}.`,
      `Sound palette: ${sonicPalette}.`,
      `Arrangement details: ${sceneDetails}.`,
      loopable ? 'Make it seamless and loopable, with no obvious ending tail.' : 'Give it a clean ending suitable for export.',
      noVocals ? 'No vocals, no spoken words, no lyrical melody.' : '',
      commercialLicense ? 'Design it as an original commercial-use audio asset.' : '',
      avoidCopyright ? 'Do not imitate any existing song, artist, film score, trademark jingle or copyrighted melody.' : '',
      'Output should be clean, broadcast-ready, and free of harsh clipping or sudden volume spikes.',
    ]
      .filter(Boolean)
      .join('\n');
  }, [avoidCopyright, commercialLicense, duration, loopable, mood, noVocals, project, sceneDetails, selectedType.label, sonicPalette]);

  const checklist = [
    `${selectedType.label}：${selectedType.note}`,
    `${duration}s 目标时长，${loopable ? '要求无缝循环' : '要求干净结尾'}。`,
    noVocals ? '已禁用人声/歌词，适合做底乐或商业素材。' : '允许人声元素，发布前需要额外审听歌词风险。',
    commercialLicense ? '已标记商用授权交付字段。' : '未标记商用授权，建议仅作内部测试。',
    avoidCopyright ? '已要求原创，不模仿现有歌曲、艺人或影视配乐。' : '未开启版权规避提示。',
    '交付建议：导出 MP3 预览版，正式商用前保留 prompt、生成时间和项目用途记录。',
  ];

  const manifest = {
    app: 'soundscape',
    audioType,
    project,
    mood,
    sonicPalette,
    sceneDetails,
    duration,
    loopable,
    noVocals,
    commercialLicense,
    avoidCopyright,
    prompt,
    checklist,
    generatedAt: new Date().toISOString(),
  };

  function applyExample(example: Example) {
    setAudioType(example.audioType);
    setProject(example.project);
    setMood(example.mood);
    setSonicPalette(example.sonicPalette);
    setSceneDetails(example.sceneDetails);
    setDuration(example.duration);
    setLoopable(example.loopable);
    setNoVocals(true);
    setCommercialLicense(true);
    setAvoidCopyright(true);
  }

  async function generate() {
    if (!session) return signIn('google');
    if (project.trim().length < 4 || mood.trim().length < 4 || sonicPalette.trim().length < 8) {
      return setErr('请先补全项目、情绪和声音元素。');
    }
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setStatus('正在提交音频任务...');
    setErr(null);
    setResultUrl(null);
    const res = await fetch('/api/audio-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'soundscape', text: prompt, languageCode: 'en' }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成音乐/音效...');
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
            <Music className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 音乐音效工厂</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              生成 BGM、音效包、ASMR、冥想和品牌片头，并自动整理循环、版权和商用交付字段。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-medium">音频类型</div>
            <div className="grid gap-2 sm:grid-cols-4">
              {audioTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAudioType(item.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    audioType === item.id ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">项目用途</span>
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">情绪关键词</span>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">时长 {duration}s</span>
              <input type="range" min={10} max={60} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">声音元素</span>
            <textarea
              value={sonicPalette}
              onChange={(e) => setSonicPalette(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">编排要求</span>
            <textarea
              value={sceneDetails}
              onChange={(e) => setSceneDetails(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="grid gap-2 md:grid-cols-2">
            {[
              { label: '无缝循环', checked: loopable, set: setLoopable },
              { label: '禁用人声/歌词', checked: noVocals, set: setNoVocals },
              { label: '商用授权交付', checked: commercialLicense, set: setCommercialLicense },
              { label: '规避版权模仿', checked: avoidCopyright, set: setAvoidCopyright },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={item.checked} onChange={(e) => item.set(e.target.checked)} className="h-4 w-4 accent-brand-600" />
                {item.label}
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">生成指令预览</span>
            <textarea
              value={prompt}
              readOnly
              rows={8}
              className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-sm leading-6 text-neutral-700 outline-none"
            />
          </label>

          <button onClick={generate} disabled={busy} className="btn-brand w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> 生成音频 · 6 {t('podcast.credits')}
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
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <button key={example.title} onClick={() => applyExample(example)} className="card p-5 text-left transition hover:shadow-card">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.note}</p>
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">交付清单</h2>
            <button onClick={() => downloadFile('soundscape-manifest.json', JSON.stringify(manifest, null, 2))} className="btn-ghost px-3 py-2 text-xs">
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
          <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              <div className="w-full space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                  <Volume2 className="h-8 w-8" />
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
