'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  AlertCircle,
  Clipboard,
  Download,
  FileJson,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Video,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';

type ReplacementMode = 'fictional-actor' | 'brand-mascot' | 'stylized-character' | 'wardrobe-transform';

type Example = {
  title: string;
  note: string;
  mode: ReplacementMode;
  sourceSubject: string;
  targetName: string;
  characterDescription: string;
  usage: string;
};

const modes: { id: ReplacementMode; label: string; note: string }[] = [
  { id: 'fictional-actor', label: '虚拟演员', note: '广告/口播素材变体' },
  { id: 'brand-mascot', label: '品牌吉祥物', note: '账号人格化内容' },
  { id: 'stylized-character', label: '风格角色', note: '短剧/剧情号改版' },
  { id: 'wardrobe-transform', label: '服装造型', note: '保留人物身份换风格' },
];

const examples: Example[] = [
  {
    title: '产品口播虚拟演员',
    note: '保留产品、手势和镜头节奏，只把出镜人改成原创虚拟演员。',
    mode: 'fictional-actor',
    sourceSubject: '正在介绍桌面补光灯的真人口播者',
    targetName: 'Ava, original AI presenter',
    characterDescription:
      'a fictional warm female presenter in her late 20s, short dark hair, clean smart-casual blazer, friendly expression, not resembling any real person',
    usage: '电商广告多版本测试',
  },
  {
    title: '品牌吉祥物带货',
    note: '把主角换成可爱品牌角色，适合账号固定形象和系列内容。',
    mode: 'brand-mascot',
    sourceSubject: '拿着咖啡杯做推荐动作的主角',
    targetName: 'Mochi mascot',
    characterDescription:
      'a soft round original mascot character, cream white body, small purple scarf, expressive eyes, friendly retail brand personality',
    usage: '社媒短视频带货',
  },
  {
    title: '短剧角色风格化',
    note: '不冒充真人，把演员造型转成原创赛博短剧角色。',
    mode: 'stylized-character',
    sourceSubject: '走进霓虹街景的短剧主角',
    targetName: 'Nova runner',
    characterDescription:
      'an original cyberpunk courier character, silver jacket, subtle neon trim, confident posture, cinematic but clearly synthetic',
    usage: '短剧预告素材',
  },
];

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

export function VideoFaceSwapApp() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [video, setVideo] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [mode, setMode] = useState<ReplacementMode>('fictional-actor');
  const [sourceSubject, setSourceSubject] = useState('视频里的主要出镜人物');
  const [targetName, setTargetName] = useState('Ava, original AI presenter');
  const [characterDescription, setCharacterDescription] = useState(
    'a fictional warm female presenter in her late 20s, short dark hair, clean smart-casual blazer, friendly expression, not resembling any real person',
  );
  const [usage, setUsage] = useState('电商广告多版本测试');
  const [preserveProduct, setPreserveProduct] = useState(true);
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [preserveTiming, setPreserveTiming] = useState(true);
  const [consent, setConsent] = useState(false);
  const [syntheticDisclosure, setSyntheticDisclosure] = useState(true);
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

  const selectedMode = modes.find((item) => item.id === mode) || modes[0];

  const prompt = useMemo(() => {
    const preserve = [
      preserveProduct ? 'preserve all products, logos and props' : '',
      preserveBackground ? 'preserve the original background and scene layout' : '',
      preserveTiming ? 'preserve camera movement, body motion timing and action rhythm' : '',
    ]
      .filter(Boolean)
      .join('; ');

    return [
      `Edit the uploaded video by replacing or restyling ${sourceSubject}.`,
      `Replacement mode: ${selectedMode.label}.`,
      `Target character: ${targetName}.`,
      `Target description: ${characterDescription}.`,
      preserve ? `Preservation requirements: ${preserve}.` : '',
      `Usage context: ${usage}.`,
      'Do not impersonate a real person. The target must be an original fictional or authorized character.',
      syntheticDisclosure ? 'Keep the output clearly synthetic and suitable for disclosure as AI-generated content.' : '',
      'Avoid changing non-target people unless needed for visual consistency.',
    ]
      .filter(Boolean)
      .join('\n');
  }, [
    characterDescription,
    preserveBackground,
    preserveProduct,
    preserveTiming,
    selectedMode.label,
    sourceSubject,
    syntheticDisclosure,
    targetName,
    usage,
  ]);

  const checks = [
    video ? '已上传源视频。' : '缺少源视频。',
    referenceImage ? '已上传目标角色参考图，供人工确认和交付留档。' : '未上传参考图，将完全按文字描述生成。',
    characterDescription.trim().length >= 24 ? '目标角色描述足够具体。' : '目标角色描述过短，建议补充年龄感、服装、发型、气质和风格。',
    consent ? '已确认拥有源视频、出镜人或角色素材的使用授权。' : '缺少授权确认，不应进入生成。',
    syntheticDisclosure ? '已启用 AI 合成披露要求。' : '建议开启 AI 合成披露要求。',
    '当前生成链路按 video + prompt 提交，参考图不会直接作为模型条件输入。',
  ];

  const manifest = {
    app: 'video-faceswap',
    mode,
    sourceSubject,
    targetName,
    characterDescription,
    usage,
    preserveProduct,
    preserveBackground,
    preserveTiming,
    consent,
    syntheticDisclosure,
    hasSourceVideo: Boolean(video),
    hasReferenceImage: Boolean(referenceImage),
    prompt,
    checks,
    generatedAt: new Date().toISOString(),
  };

  function applyExample(example: Example) {
    setMode(example.mode);
    setSourceSubject(example.sourceSubject);
    setTargetName(example.targetName);
    setCharacterDescription(example.characterDescription);
    setUsage(example.usage);
    setPreserveProduct(true);
    setPreserveBackground(true);
    setPreserveTiming(true);
    setSyntheticDisclosure(true);
  }

  async function generate() {
    if (!session) return signIn('google');
    if (!video) return setErr('请先上传源视频。');
    if (characterDescription.trim().length < 24) return setErr('请把目标角色描述写具体一点。');
    if (!consent) return setErr('请先确认源视频、出镜人或角色素材授权。');
    if (!syntheticDisclosure) return setErr('请开启 AI 合成披露要求。');
    if (timer.current) clearInterval(timer.current);

    setBusy(true);
    setErr(null);
    setResultUrl(null);
    setStatus('正在上传视频并提交换角色任务...');

    const res = await fetch('/api/media-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'video-edit', image: referenceImage, video, prompt }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(null);
      setErr(j.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${j.error || 'failed'}`);
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    setStatus('正在生成视频，通常需要 1-5 分钟...');
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
          setErr('视频生成失败，积分已退回。');
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Wand2 className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 视频换角色</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              上传源视频，整理目标角色参考、授权确认和结构化编辑指令，生成适合广告、短剧和账号人设的视频变体。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0]).then(setVideo).catch(() => setErr('视频读取失败。'))}
              />
              {video ? (
                <video src={video} controls className="max-h-72 w-full object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm">上传源视频</span>
                  <span className="text-xs">建议先用 5-10 秒短视频测试</span>
                </span>
              )}
            </label>

            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0]).then(setReferenceImage).catch(() => setErr('图片读取失败。'))}
              />
              {referenceImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={referenceImage} alt="target character reference" className="max-h-72 rounded-lg object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm">目标角色参考图</span>
                  <span className="text-xs">用于预览、确认和交付留档</span>
                </span>
              )}
            </label>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">换角色模式</div>
            <div className="grid gap-2 sm:grid-cols-4">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    mode === item.id ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">源视频主体</span>
              <input
                value={sourceSubject}
                onChange={(e) => setSourceSubject(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">目标角色名称</span>
              <input
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">目标角色描述</span>
            <textarea
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">用途</span>
            <input
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="grid gap-2 md:grid-cols-2">
            {[
              { label: '保留产品/道具', checked: preserveProduct, set: setPreserveProduct },
              { label: '保留背景构图', checked: preserveBackground, set: setPreserveBackground },
              { label: '保留动作节奏', checked: preserveTiming, set: setPreserveTiming },
              { label: '启用 AI 合成披露', checked: syntheticDisclosure, set: setSyntheticDisclosure },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={item.checked} onChange={(e) => item.set(e.target.checked)} className="h-4 w-4 accent-brand-600" />
                {item.label}
              </label>
            ))}
          </div>

          <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
            我确认拥有源视频、出镜人、品牌或角色素材的使用授权，不用于冒充真实人物或误导性发布。
          </label>

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
                <Sparkles className="h-4 w-4" /> 生成换角色视频 · 16 {t('podcast.credits')}
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
            <h2 className="text-sm font-semibold">授权与交付清单</h2>
            <button
              onClick={() => downloadFile('video-faceswap-manifest.json', JSON.stringify(manifest, null, 2))}
              className="btn-ghost px-3 py-2 text-xs"
            >
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {checks.map((check) => (
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
          <h2 className="text-sm font-semibold">视频结果</h2>
          <div className="mt-4 flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            {resultUrl ? (
              <video src={resultUrl} controls autoPlay loop className="max-h-[520px] w-full object-contain" />
            ) : busy ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm">{status}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-300">
                <Video className="h-8 w-8" />
                <span className="text-sm">生成后的视频会显示在这里</span>
              </div>
            )}
          </div>
          {resultUrl && (
            <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
              <Download className="h-4 w-4" /> 下载视频
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
