'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  AlertCircle,
  BookOpenText,
  CheckCircle2,
  Clipboard,
  Download,
  FileJson,
  Loader2,
  Mic2,
  Moon,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';

const COST = 5;

function readFile(file?: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('no file'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const EXAMPLES = [
  {
    title: '小月亮找家',
    childName: '小星星',
    age: '5 岁',
    theme: '一只迷路的小月亮在云朵、萤火虫和小河的帮助下找到回家的路。',
    lesson: '学会勇敢表达和向朋友求助。',
  },
  {
    title: '不想睡觉的小火车',
    childName: '豆豆',
    age: '4 岁',
    theme: '一辆兴奋的小火车总想多跑一圈，最后发现休息能让明天的旅程更远。',
    lesson: '理解睡眠和休息的重要。',
  },
  {
    title: '会发光的口袋',
    childName: '安安',
    age: '6 岁',
    theme: '孩子发现口袋里有一颗会发光的小纽扣，每次分享都会变得更亮。',
    lesson: '分享和善意会让自己也更快乐。',
  },
];

export default function BedtimeStoryPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [childName, setChildName] = useState('小星星');
  const [age, setAge] = useState('5 岁');
  const [theme, setTheme] = useState('一只迷路的小月亮在云朵、萤火虫和小河的帮助下找到回家的路。');
  const [lesson, setLesson] = useState('学会勇敢表达和向朋友求助。');
  const [tone, setTone] = useState('warm, sleepy, gentle, and imaginative');
  const [language, setLanguage] = useState('Chinese');
  const [caregiverName, setCaregiverName] = useState('妈妈');
  const [relationship, setRelationship] = useState('监护人 / 家长');
  const [voiceSample, setVoiceSample] = useState<string | null>(null);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [childSafe, setChildSafe] = useState(true);
  const [noPersonalData, setNoPersonalData] = useState(true);
  const [noScaryContent, setNoScaryContent] = useState(true);
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
    setChildName(example.childName);
    setAge(example.age);
    setTheme(example.theme);
    setLesson(example.lesson);
    setScript('');
    setResultUrl(null);
    setErr(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function errorText(code: string) {
    if (code === 'insufficient_credits') return '积分不足，请先到价格页充值。';
    if (code === 'voice_consent_required') return '上传家长声音采样时必须先确认授权。';
    if (code === 'story_submit_failed') return '故事生成失败，请换一个主题重试。';
    return `Error: ${code || 'failed'}`;
  }

  const safetyChecks = [
    voiceSample ? '已上传家长声音采样，可用于试听留档和后续克隆准备。' : '未上传家长声音采样，将使用默认温柔旁白音色。',
    voiceSample && voiceConsent ? '已确认声音采样由本人/监护人授权使用。' : voiceSample ? '声音采样缺少授权确认。' : '未启用声音采样授权流程。',
    childSafe ? '已启用儿童安全故事约束。' : '建议启用儿童安全故事约束。',
    noPersonalData ? '已要求不写入地址、学校、电话等隐私信息。' : '建议避免真实隐私信息。',
    noScaryContent ? '已避免惊吓、暴力和过度刺激桥段。' : '建议睡前故事避免刺激内容。',
    '当前生成链路使用默认 SeedAudio 旁白；上传采样会进入交付清单，不会在未验证克隆模型前直接提交克隆。',
  ];

  const manifest = {
    app: 'bedtime-story',
    childName,
    age,
    theme,
    lesson,
    tone,
    language,
    caregiverName,
    relationship,
    hasVoiceSample: Boolean(voiceSample),
    voiceConsent,
    childSafe,
    noPersonalData,
    noScaryContent,
    safetyChecks,
    generatedAt: new Date().toISOString(),
  };

  async function generate() {
    if (!session) return signIn('google');
    if (voiceSample && !voiceConsent) return setErr('上传家长声音采样时必须确认授权。');
    if (timer.current) clearInterval(timer.current);
    setBusy(true);
    setStatus('正在写故事...');
    setErr(null);
    setScript('');
    setResultUrl(null);

    const res = await fetch('/api/bedtime-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childName,
        age,
        theme,
        lesson,
        tone,
        language,
        caregiverName,
        relationship,
        hasVoiceSample: Boolean(voiceSample),
        voiceConsent,
        childSafe,
        noPersonalData,
        noScaryContent,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(errorText(j.error));
      return;
    }
    setScript(j.script || '');
    setStatus('正在生成睡前故事音频...');
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
            <Moon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 睡前故事</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              给孩子定制一个温柔、安全、可直接播放的睡前故事音频。
            </p>
          </div>
        </div>

        <div className="card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">主角名字</span>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">年龄</span>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mic2 className="h-4 w-4 text-brand-500" />
              家长声音采样
            </div>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              上传 30-120 秒家长朗读采样，用于本次交付留档和后续声音克隆准备；当前音频生成仍使用默认旁白音色。
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">采样人</span>
                <input
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">关系</span>
                <input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>
            <label className="mt-3 flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white p-4 text-center transition hover:border-brand-300">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0]).then(setVoiceSample).catch(() => setErr('音频采样读取失败。'))}
              />
              {voiceSample ? (
                <audio src={voiceSample} controls className="w-full" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-6 w-6" />
                  <span className="text-sm">上传 MP3/WAV/M4A 采样</span>
                </span>
              )}
            </label>
            <label className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
              <input type="checkbox" checked={voiceConsent} onChange={(e) => setVoiceConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
              我确认该声音采样由本人或监护人授权，仅用于生成/准备本次孩子睡前故事，不用于冒充、公开售卖或其他场景。
            </label>
          </div>

          <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-medium">
            <BookOpenText className="h-4 w-4 text-brand-500" />
            故事主题
          </label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            rows={5}
            placeholder="例如：一只小鲸鱼害怕黑夜，和星星成为朋友。"
            className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <label className="mb-2 mt-4 block text-sm font-medium">希望传递的寓意</label>
          <textarea
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            rows={3}
            placeholder="例如：勇敢表达、学会分享、接受自己的情绪。"
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

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { label: '儿童安全', checked: childSafe, set: setChildSafe },
              { label: '不写隐私信息', checked: noPersonalData, set: setNoPersonalData },
              { label: '避免惊吓刺激', checked: noScaryContent, set: setNoScaryContent },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={item.checked} onChange={(e) => item.set(e.target.checked)} className="h-4 w-4 accent-brand-600" />
                {item.label}
              </label>
            ))}
          </div>

          <button onClick={generate} disabled={busy} className="btn-brand mt-5 w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> 生成睡前故事 · {COST} {t('podcast.credits')}
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
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.theme}</p>
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
            <h2 className="text-sm font-semibold">授权与安全清单</h2>
            <button
              onClick={() => downloadFile('bedtime-story-manifest.json', JSON.stringify(manifest, null, 2))}
              className="btn-ghost px-3 py-2 text-xs"
            >
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {safetyChecks.map((check) => (
              <div key={check} className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {check}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold">故事音频</h2>
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
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              故事脚本
            </h2>
            <button onClick={() => navigator.clipboard.writeText(script)} className="btn-ghost mt-3 w-full text-xs">
              <Clipboard className="h-3.5 w-3.5" /> 复制脚本
            </button>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{script}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
