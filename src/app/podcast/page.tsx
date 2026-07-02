'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Images,
  Loader2,
  Mic2,
  PackageSearch,
  PlaySquare,
  Sparkles,
  UploadCloud,
  Video,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';

const COST = 6;
const MAX_IMAGES = 6;
const MAX_TOTAL_IMAGE_BYTES = 7_500_000;

const LANGUAGE_BY_LOCALE = {
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
  es: 'Spanish',
} as const;

type BusyMode = 'draft' | 'audio' | 'social' | null;
type PodcastMode = 'podcast' | 'image-explainer' | 'product-recommendation' | 'sales-video' | 'video-voiceover';
type ExampleItem = {
  key: string;
  title: string;
  mode: PodcastMode;
  tone: string;
  source: string;
  input: string;
  output: string;
  images: string[];
  videoContext?: string;
};

const MODES: Array<{ id: PodcastMode; icon: typeof Mic2; titleKey: string; descKey: string }> = [
  { id: 'podcast', icon: Mic2, titleKey: 'podcast.modePodcast', descKey: 'podcast.modePodcastDesc' },
  { id: 'image-explainer', icon: Images, titleKey: 'podcast.modeImage', descKey: 'podcast.modeImageDesc' },
  { id: 'product-recommendation', icon: PackageSearch, titleKey: 'podcast.modeProduct', descKey: 'podcast.modeProductDesc' },
  { id: 'sales-video', icon: PlaySquare, titleKey: 'podcast.modeSales', descKey: 'podcast.modeSalesDesc' },
  { id: 'video-voiceover', icon: Video, titleKey: 'podcast.modeVideo', descKey: 'podcast.modeVideoDesc' },
];

const FOCUSED_ROUTES: Record<string, { mode: PodcastMode; title: string; subtitle: string; guide: string }> = {
  '/image-explainer': {
    mode: 'image-explainer',
    title: 'AI 图片解说',
    subtitle: '上传多张图片，生成适合小红书、视频号、抖音的解说文案、旁白音频和竖版社媒视频。',
    guide: '这个入口专注“画面信息讲清楚”：先读图，再生成解说，再把图片和音频合成 9:16 视频。',
  },
  '/product-recommendation': {
    mode: 'product-recommendation',
    title: 'AI 商品推荐',
    subtitle: '从商品主图、细节图和场景图里提炼卖点，生成可信推荐音频和可发布的社媒视频。',
    guide: '这个入口专注“商品种草”：卖点、人群、场景和注意事项都会围绕商品图片组织。',
  },
  '/sales-video': {
    mode: 'sales-video',
    title: 'AI 带货口播',
    subtitle: '用产品图片生成短视频口播脚本、Seed Audio 旁白，并合成竖版发布素材。',
    guide: '这个入口专注“转化脚本”：前三秒钩子、利益点、使用场景和 CTA 会更强。',
  },
};

const SHOWCASE: ExampleItem[] = [
  {
    key: 'image-explainer',
    title: '图片解说',
    mode: 'image-explainer' as const,
    tone: 'clear, curious, and cinematic',
    input: '输入：2 张清洁能源展会图 + “做 60 秒中文解说，适合小红书/视频号”。',
    output: '输出：从画面亮点切入，讲清智能能源展台、太阳能、储能和观众可关注的细节。',
    source:
      '把这组图片做成 60 秒中文解说，适合小红书/视频号。先抓住画面里最吸引人的细节，再解释清洁能源展台、太阳能、储能和智能城市看板分别代表什么。语气要有好奇心，但不要夸大。',
    images: ['/examples/podcast/image-explainer-1.jpg', '/examples/podcast/image-explainer-2.jpg'],
  },
  {
    key: 'product-recommendation',
    title: '商品推荐',
    mode: 'product-recommendation' as const,
    tone: 'professional, honest, and persuasive',
    input: '输入：通勤托特包主图 + 生活场景图，强调轻便、防水、容量和不硬广推荐。',
    output: '输出：整理卖点、适合人群、通勤场景、注意事项，并给出可信的购买建议。',
    source:
      '根据商品图片做一段双人推荐。目标用户是城市通勤人群，重点提炼轻便、防水、容量、拉链安全、侧袋和电脑收纳。请说明适合谁、不适合谁、真实使用场景，以及一个不夸张的购买建议。',
    images: ['/examples/podcast/product-recommendation-1.jpg', '/examples/podcast/product-recommendation-2.jpg'],
  },
  {
    key: 'sales-video',
    title: '带货口播',
    mode: 'sales-video' as const,
    tone: 'short-form, energetic, and conversion-focused',
    input: '输入：桌面加湿器产品图 + 使用场景图，生成 30-45 秒短视频口播。',
    output: '输出：前三秒钩子、利益点、使用场景、可信 CTA，确认后生成 Seed Audio MP3。',
    source:
      '生成 30-45 秒带货口播脚本。产品是桌面便携加湿器，适合办公桌、卧室和晚间学习场景。前三秒要有强钩子，重点讲干燥环境里的舒适感、氛围灯、低噪和小体积，最后给一个清晰但不油腻的 CTA。',
    images: ['/examples/podcast/sales-video-1.jpg', '/examples/podcast/sales-video-2.jpg'],
  },
];

const QUICK_EXAMPLES = SHOWCASE;

async function imageToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function publicImageToDataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error('example image unavailable');
  const blob = await res.blob();
  return imageToDataUrl(new File([blob], src.split('/').pop() || 'example.jpg', { type: blob.type || 'image/jpeg' }));
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function socialMimeType() {
  const candidates = ['video/mp4;codecs=h264,aac', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return candidates.find((x) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(x)) || '';
}

function socialExtension(mimeType: string) {
  return mimeType.includes('mp4') ? 'mp4' : 'webm';
}

function scriptCues(script: string) {
  const clean = script
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/@audio\d+\s*:/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = clean.split(/(?<=[。！？.!?])\s*/).filter(Boolean);
  const cues: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > 42 && current) {
      cues.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) cues.push(current);
  return cues.length ? cues.slice(0, 16) : ['AI 生成旁白', '图片轮播社媒视频'];
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = Array.from(text);
  let line = '';
  let lines = 0;
  for (const char of chars) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = char;
      lines += 1;
      if (lines >= 2) break;
    } else {
      line = next;
    }
  }
  if (line && lines < 2) ctx.fillText(line, x, y + lines * lineHeight);
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, zoom: number) {
  const scale = Math.max(w / img.width, h / img.height) * zoom;
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export default function PodcastPage() {
  const { data: session } = useSession();
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const focusedRoute = FOCUSED_ROUTES[pathname] || null;
  const [mode, setMode] = useState<PodcastMode>('podcast');
  const [source, setSource] = useState('');
  const [videoContext, setVideoContext] = useState('');
  const [tone, setTone] = useState('smart, warm, and conversational');
  const [language, setLanguage] = useState<string>(LANGUAGE_BY_LOCALE[locale]);
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState<BusyMode>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [socialVideoUrl, setSocialVideoUrl] = useState<string | null>(null);
  const [socialVideoExt, setSocialVideoExt] = useState('webm');
  const [script, setScript] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const appliedPath = useRef('');
  const visibleShowcase = focusedRoute ? SHOWCASE.filter((item) => item.mode === focusedRoute.mode) : SHOWCASE;

  useEffect(() => {
    setLanguage(LANGUAGE_BY_LOCALE[locale]);
  }, [locale]);

  useEffect(() => {
    if (!focusedRoute || appliedPath.current === pathname) return;
    appliedPath.current = pathname;
    setMode(focusedRoute.mode);
    const example = SHOWCASE.find((item) => item.mode === focusedRoute.mode);
    if (example) setTone(example.tone);
  }, [focusedRoute, pathname]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      setSocialVideoUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    },
    [],
  );

  function clearSocialVideo() {
    setSocialVideoUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }

  function resetResult() {
    setErr(null);
    setStatus(null);
    setResultUrl(null);
    clearSocialVideo();
    if (timer.current) clearInterval(timer.current);
  }

  function clearDraft() {
    setScript('');
    setResultUrl(null);
    clearSocialVideo();
  }

  async function loadExample(example: ExampleItem) {
    setMode(example.mode);
    setTone(example.tone);
    setSource(example.source);
    setVideoContext(example.videoContext || '');
    clearDraft();
    setErr(null);
    setBusy('draft');
    setStatus(t('podcast.preparingImages'));
    try {
      const encoded = await Promise.all(example.images.map(publicImageToDataUrl));
      if (encoded.join('').length > MAX_TOTAL_IMAGE_BYTES) throw new Error('too large');
      setImages(encoded);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErr(t('podcast.exampleLoadFailed'));
    } finally {
      setBusy(null);
      setStatus(null);
    }
  }

  async function handleFiles(files?: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files);
    if (images.length + incoming.length > MAX_IMAGES) return setErr(t('podcast.tooManyImages', { n: MAX_IMAGES }));
    if (incoming.some((f) => !f.type.startsWith('image/'))) return setErr(t('podcast.imageOnly'));
    try {
      setBusy('draft');
      setStatus(t('podcast.preparingImages'));
      const encoded = await Promise.all(incoming.map(imageToDataUrl));
      const next = [...images, ...encoded];
      if (next.join('').length > MAX_TOTAL_IMAGE_BYTES) {
        setErr(t('podcast.imageTooLarge'));
        return;
      }
      setImages(next);
      clearDraft();
      setErr(null);
    } catch {
      setErr(t('podcast.imageReadFailed'));
    } finally {
      setBusy(null);
      setStatus(null);
    }
  }

  function errorText(code: string) {
    if (code === 'insufficient_credits') return t('podcast.notEnough');
    if (code === 'source_too_short' || code === 'script_too_short') return t('podcast.tooShort');
    if (code === 'source_too_long') return t('podcast.tooLong');
    if (code === 'image_too_large') return t('podcast.imageTooLarge');
    if (code === 'video_context_too_long') return t('podcast.videoTooLong');
    if (code === 'draft_failed') return t('podcast.draftFailed');
    return `Error: ${code || 'failed'}`;
  }

  async function draftScript() {
    resetResult();
    if (!session) return signIn('google');
    const text = source.trim();
    const video = videoContext.trim();
    if (text.length < 30 && images.length === 0 && !video) return setErr(t('podcast.tooShort'));
    if (text.length > 12000) return setErr(t('podcast.tooLong'));
    if (video.length > 4000) return setErr(t('podcast.videoTooLong'));

    setBusy('draft');
    setStatus(t('podcast.drafting'));
    const res = await fetch('/api/podcast/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, source: text, images, videoContext: video, tone, language }),
    });
    const j = await res.json();
    setBusy(null);
    setStatus(null);
    if (!res.ok) {
      setErr(errorText(j.error));
      return;
    }
    setScript(j.script || '');
  }

  async function generateAudio() {
    resetResult();
    if (!session) return signIn('google');
    const confirmed = script.trim();
    if (confirmed.length < 80) return setErr(t('podcast.scriptTooShort'));

    setBusy('audio');
    setStatus(t('podcast.generating'));
    const res = await fetch('/api/podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, script: confirmed, tone, language }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(null);
      setStatus(null);
      setErr(errorText(j.error));
      return;
    }

    window.dispatchEvent(new Event('atlas:credits'));
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/creations/${j.id}`);
        const c = await r.json();
        if (c.status === 'completed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(null);
          setStatus(null);
          setResultUrl((Array.isArray(c.outputs) ? c.outputs : [])[0] || null);
        } else if (c.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
          setBusy(null);
          setStatus(null);
          setErr(t('podcast.failed'));
          window.dispatchEvent(new Event('atlas:credits'));
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  async function generateSocialVideo() {
    setErr(null);
    clearSocialVideo();
    if (!resultUrl) return setErr(t('podcast.socialNeedsAudio'));
    if (images.length === 0) return setErr(t('podcast.socialNeedsImages'));
    if (typeof MediaRecorder === 'undefined') return setErr(t('podcast.socialFailed'));

    setBusy('social');
    setStatus(t('podcast.socialGenerating'));
    let audioObjectUrl: string | null = null;
    let frame: number | null = null;
    try {
      const mimeType = socialMimeType();
      const imageEls = await Promise.all(images.map(loadImageElement));
      const audioRes = await fetch(`/api/download?url=${encodeURIComponent(resultUrl)}`);
      if (!audioRes.ok) throw new Error('audio fetch failed');
      audioObjectUrl = URL.createObjectURL(await audioRes.blob());

      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');

      const audio = new Audio(audioObjectUrl);
      const AudioContextCtor =
        window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) throw new Error('audio context unavailable');
      const audioCtx = new AudioContextCtor();
      const sourceNode = audioCtx.createMediaElementSource(audio);
      const dest = audioCtx.createMediaStreamDestination();
      sourceNode.connect(dest);

      const canvasStream = canvas.captureStream(30);
      const stream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      const cues = scriptCues(script || source);
      const title = focusedRoute?.title || t('podcast.title');
      const render = () => {
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 45;
        const progress = Math.min(1, audio.currentTime / duration);
        const imageIndex = Math.min(imageEls.length - 1, Math.floor(progress * imageEls.length));
        const cueIndex = Math.min(cues.length - 1, Math.floor(progress * cues.length));

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCover(ctx, imageEls[imageIndex], 0, 0, canvas.width, canvas.height, 1.03 + progress * 0.05);

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.34)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.08)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.68)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '700 30px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(title, 48, 76);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 42px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
        drawWrappedText(ctx, cues[cueIndex], 48, 1040, 624, 58);

        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.font = '500 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('Atlas Media Studio', 48, 1208);
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(48, 1232, 624 * progress, 6);
        frame = requestAnimationFrame(render);
      };

      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error('audio load failed'));
        audio.load();
      });

      await audioCtx.resume();
      const done = new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () => reject(new Error('record failed'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
      });
      recorder.start(1000);
      render();
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
      });
      if (frame) cancelAnimationFrame(frame);
      recorder.stop();
      const blob = await done;
      stream.getTracks().forEach((track) => track.stop());
      await audioCtx.close();
      setSocialVideoExt(socialExtension(blob.type));
      setSocialVideoUrl(URL.createObjectURL(blob));
    } catch {
      if (frame) cancelAnimationFrame(frame);
      setErr(t('podcast.socialFailed'));
    } finally {
      if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
      setBusy(null);
      setStatus(null);
    }
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Mic2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{focusedRoute?.title || t('podcast.title')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">{focusedRoute?.subtitle || t('podcast.subtitle')}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">{t('podcast.scenario')}</h2>
            {focusedRoute ? (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm leading-6 text-brand-900">
                {focusedRoute.guide}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {MODES.map((x) => {
                  const Icon = x.icon;
                  return (
                    <button
                      key={x.id}
                      onClick={() => {
                        setMode(x.id);
                        clearDraft();
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        mode === x.id ? 'border-brand-300 bg-brand-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-brand-500" />
                      <span className="mt-2 block text-sm font-medium">{t(x.titleKey)}</span>
                      <span className="mt-1 block text-xs leading-4 text-neutral-500">{t(x.descKey)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {!focusedRoute && (
              <>
                <h2 className="mb-3 mt-5 text-sm font-semibold">{t('podcast.examples')}</h2>
                <div className="flex flex-wrap gap-2">
                  {QUICK_EXAMPLES.map((example) => (
                    <button
                      key={example.key}
                      onClick={() => loadExample(example)}
                      disabled={busy !== null}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      {t(`podcast.example.${example.key}`)}
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium">
              <Images className="h-4 w-4 text-brand-500" />
              {t('podcast.images')}{' '}
              <span className="font-normal text-neutral-400">
                {images.length}/{MAX_IMAGES}
              </span>
            </label>
            <label className="flex min-h-[128px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <span className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud className="h-7 w-7" />
                <span className="text-sm">
                  {busy === 'draft' && status === t('podcast.preparingImages') ? status : t('podcast.dropImages')}
                </span>
              </span>
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {images.map((src, index) => (
                  <div key={`${src.slice(0, 32)}-${index}`} className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`input ${index + 1}`} className="aspect-square h-full w-full object-cover" />
                    <button
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== index));
                        clearDraft();
                      }}
                      className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-xs text-neutral-600 shadow"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-brand-500" />
              {t('podcast.source')}
            </label>
            <textarea
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                clearDraft();
              }}
              placeholder={t('podcast.sourcePlaceholder')}
              rows={6}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-medium">
              <Video className="h-4 w-4 text-brand-500" />
              {t('podcast.videoContext')}
            </label>
            <textarea
              value={videoContext}
              onChange={(e) => {
                setVideoContext(e.target.value);
                clearDraft();
              }}
              placeholder={t('podcast.videoContextPlaceholder')}
              rows={4}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{t('podcast.tone')}</span>
                <input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{t('podcast.language')}</span>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            <button onClick={draftScript} disabled={busy !== null} className="btn-ghost mt-5 w-full">
              {busy === 'draft' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> {t('podcast.draft')}
                </>
              )}
            </button>

            {script && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">{t('podcast.script')}</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={10}
                  className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button onClick={generateAudio} disabled={busy !== null} className="btn-brand mt-3 w-full">
                  {busy === 'audio' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> {t('podcast.confirmGenerate')} · {COST} {t('podcast.credits')}
                    </>
                  )}
                </button>
              </div>
            )}

            {err && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {err}
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold">{t('podcast.result')}</h2>
            <div className="mt-4 flex min-h-[160px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              {resultUrl ? (
                <audio src={resultUrl} controls className="w-full" />
              ) : busy === 'audio' ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                  <span className="text-sm">{status}</span>
                  <span className="text-xs text-neutral-300">~20-60s</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-300">
                  <Sparkles className="h-8 w-8" />
                  <span className="text-sm">{t('podcast.empty')}</span>
                </div>
              )}
            </div>
            {resultUrl && (
              <a href={`/api/download?url=${encodeURIComponent(resultUrl)}`} className="btn-ghost mt-3 w-full">
                <Download className="h-4 w-4" /> {t('podcast.download')}
              </a>
            )}
            {resultUrl && (
              <button onClick={generateSocialVideo} disabled={busy !== null} className="btn-brand mt-3 w-full">
                {busy === 'social' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {status || '...'}
                  </>
                ) : (
                  <>
                    <PlaySquare className="h-4 w-4" /> {t('podcast.socialVideo')}
                  </>
                )}
              </button>
            )}
            {resultUrl && (
              <p className="mt-2 text-xs leading-5 text-neutral-400">{t('podcast.socialVideoHint')}</p>
            )}
            {socialVideoUrl && (
              <a href={socialVideoUrl} download={`atlas-social-video.${socialVideoExt}`} className="btn-ghost mt-3 w-full">
                <Download className="h-4 w-4" /> {t('podcast.downloadSocialVideo')}
              </a>
            )}
          </div>
        </aside>
      </div>

      <section className="border-t border-neutral-200 pt-8">
        <h2 className="text-xl font-bold tracking-tight">{t('podcast.showcaseTitle')}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t('podcast.showcaseSubtitle')}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleShowcase.map((item) => (
            <div key={item.title} className="card p-5">
              <div className="mb-4 grid grid-cols-2 gap-2">
                {item.images.map((src, index) => (
                  <div key={src} className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${item.title} example ${index + 1}`} className="aspect-[4/3] h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <button
                  onClick={() => loadExample(item)}
                  disabled={busy !== null}
                  className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:border-brand-300"
                >
                  {t('podcast.useExample')}
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6">
                <div>
                  <div className="text-xs font-semibold uppercase text-neutral-400">{t('podcast.showcaseInput')}</div>
                  <p className="mt-1 text-neutral-600">{item.input}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-neutral-400">{t('podcast.showcaseOutput')}</div>
                  <p className="mt-1 text-neutral-600">{item.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
