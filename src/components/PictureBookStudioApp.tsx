'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  AlertCircle,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Palette,
  Printer,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import type { PictureBookPage, PictureBookPlan } from '@/lib/picture-book';

type TaskState = { status: 'idle' | 'processing' | 'completed' | 'failed'; id?: string; url?: string; error?: string };

const emptyTask: TaskState = { status: 'idle' };

const styleOptions = [
  'soft watercolor, warm picture-book style, gentle brush texture',
  'gouache children book illustration, rich paper texture, cozy colors',
  'clean digital picture-book art, soft gradients, premium print look',
  'colored pencil and watercolor mixed media, handmade children book feel',
];

function svgDataUrl(title: string, subtitle: string, bg = '#F8E7C9', accent = '#7C3AED') {
  const safeTitle = title.replace(/[<>&]/g, '');
  const safeSubtitle = subtitle.replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="${bg}"/>
  <circle cx="920" cy="180" r="120" fill="#fff7ed" opacity="0.82"/>
  <circle cx="250" cy="640" r="150" fill="#ffffff" opacity="0.46"/>
  <path d="M310 690 C430 520 610 510 745 680" stroke="${accent}" stroke-width="34" stroke-linecap="round" fill="none" opacity="0.32"/>
  <circle cx="548" cy="390" r="122" fill="#FFD4A8"/>
  <path d="M430 365 C480 285 615 265 690 350 C635 338 520 335 430 365Z" fill="#3f2b21"/>
  <circle cx="505" cy="396" r="15" fill="#3f2b21"/>
  <circle cx="598" cy="396" r="15" fill="#3f2b21"/>
  <path d="M520 450 C550 472 585 468 610 448" stroke="#3f2b21" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M405 645 C440 520 470 480 548 480 C626 480 662 520 698 645 Z" fill="#FACC15"/>
  <path d="M470 530 L635 530" stroke="#fff7ed" stroke-width="18" opacity="0.8"/>
  <text x="80" y="110" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#241C15">${safeTitle}</text>
  <text x="82" y="172" font-family="Arial, sans-serif" font-size="28" fill="#6b5d53">${safeSubtitle}</text>
  <text x="80" y="820" font-family="Arial, sans-serif" font-size="24" fill="#7c6f64">Sample preview · replace with Atlas generated art</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const samplePlan: PictureBookPlan = {
  title: '小星和发光小种子',
  logline: '一个孩子在雨后找到一颗会发光的小种子，学会倾听、合作和分享。',
  ageRange: '4-7 岁',
  theme: '倾听、表达需要和分享快乐',
  visualStyle: styleOptions[0],
  character: {
    name: '小星',
    age: '6 岁',
    fixedTraits: ['圆润友好的脸', '温暖好奇的眼睛', '短黑发和星星发夹', '黄色雨衣、条纹上衣、蓝色短裤、红色鞋子', '儿童安全比例，表情温柔不惊吓'],
    outfit: '黄色雨衣、条纹上衣、蓝色短裤、红色鞋子、星星发夹',
    expressionNotes: '好奇、勇敢、温柔；有表情但不过度刺激。',
    characterPrompt: 'Create a locked character design sheet for a children picture-book protagonist named 小星: round friendly face, warm curious eyes, short black hair with tiny star hair clip, yellow raincoat, striped shirt, blue shorts, red sneakers. Soft watercolor, white background, front-facing full body and small head close-up, no text.',
  },
  pages: [
    ['雨后，小星在窗边发现一颗发光的小种子。', '雨后窗边，小星双手捧起一颗发光小种子，房间温暖，远处有彩虹。', '好奇'],
    ['小种子轻轻闪了闪，像是在说需要一个家。', '小星把小种子放进小花盆，旁边小猫安静陪伴。', '关心'],
    ['小星听懂了：它想要一点阳光和一点水。', '小星拿着小水壶，阳台阳光像金色毯子一样铺开。', '专注'],
    ['朋友们一起帮忙，把花盆搬到最亮的地方。', '小星和朋友一起抬着花盆，小猫走在前面带路。', '合作'],
    ['夜里，第一片小叶子悄悄钻了出来。', '夜晚小夜灯旁，小星看着第一片叶子，月光温柔。', '安心'],
    ['第二天，小花把微笑送给了每一个路过的人。', '发光小花放在社区小桌上，路过的人露出微笑，小星在旁边开心。', '分享'],
  ].map((page, index) => ({
    pageNumber: index + 1,
    text: page[0],
    scene: page[1],
    emotion: page[2],
    illustrationPrompt: `Picture-book page ${index + 1}. Keep the exact same protagonist 小星: round friendly face, short black hair with star hair clip, yellow raincoat, striped shirt, blue shorts, red shoes. Scene: ${page[1]} Emotion: ${page[2]}. Soft watercolor, warm, child-safe, leave safe area for text, no text.`,
  })),
  safetyChecklist: ['儿童安全、无恐吓和暴力', '不包含真实学校/住址/电话等隐私', '主角每页同一张脸和同一套衣服', '每页留出文字安全区', '导出前人工确认文本和图片'],
  printSpecs: {
    trimSize: '8 x 8 inch square picture book',
    bleed: '0.125 inch bleed on all sides',
    safeArea: '重要人脸和文字距离裁切线至少 0.35 inch',
    exportNote: '浏览器打印为 PDF 用于 proof；正式印刷建议替换为 300 DPI 终稿。',
  },
};

const sampleCharacterUrl = svgDataUrl('小星定妆', 'same face · same outfit · safe style', '#F7E4C5', '#7C3AED');

function samplePageUrl(page: PictureBookPage) {
  const palette = ['#F8E7C9', '#DCFCE7', '#DBEAFE', '#FAE8FF', '#FEF3C7', '#E0F2FE'];
  return svgDataUrl(`第 ${page.pageNumber} 页`, page.text, palette[(page.pageNumber - 1) % palette.length], '#7C3AED');
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PictureBookStudioApp() {
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [childName, setChildName] = useState('小星');
  const [age, setAge] = useState('4-7 岁');
  const [storySeed, setStorySeed] = useState('雨后，一个孩子在窗边发现一颗会发光的小种子，并帮助它找到适合生长的家。');
  const [lesson, setLesson] = useState('学会倾听、表达需要、和朋友合作并分享快乐。');
  const [style, setStyle] = useState(styleOptions[0]);
  const [pageCount, setPageCount] = useState(6);
  const [language, setLanguage] = useState('Chinese');
  const [childPhoto, setChildPhoto] = useState<string | null>(null);
  const [guardianConsent, setGuardianConsent] = useState(true);
  const [privacySafe, setPrivacySafe] = useState(true);
  const [printIntent, setPrintIntent] = useState(true);
  const [plan, setPlan] = useState<PictureBookPlan | null>(samplePlan);
  const [planConfirmed, setPlanConfirmed] = useState(false);
  const [characterPrompt, setCharacterPrompt] = useState(samplePlan.character.characterPrompt);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [characterTask, setCharacterTask] = useState<TaskState>(emptyTask);
  const [characterConfirmed, setCharacterConfirmed] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [pageTasks, setPageTasks] = useState<Record<number, TaskState>>({});
  const [pagesConfirmed, setPagesConfirmed] = useState(false);
  const [busyPlan, setBusyPlan] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const pollers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const sourceComplete = storySeed.trim().length >= 8 && childName.trim().length >= 1 && guardianConsent && privacySafe && printIntent;
  const allPagesReady = Boolean(plan?.pages.length) && plan!.pages.every((page) => pageImages[page.pageNumber]);

  const steps = [
    { title: '素材', desc: '故事点子/照片', ready: sourceComplete },
    { title: '故事板', desc: '分页文本', ready: planConfirmed },
    { title: '定妆', desc: '锁角色', ready: characterConfirmed && Boolean(characterUrl) },
    { title: '逐页插画', desc: '一致成图', ready: pagesConfirmed && allPagesReady },
    { title: '排版导出', desc: 'PDF/HTML', ready: Boolean(plan) && allPagesReady },
  ];

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          app: 'picture-book-studio',
          childName,
          age,
          storySeed,
          lesson,
          style,
          pageCount,
          hasChildPhoto: Boolean(childPhoto),
          plan,
          characterUrl,
          pageImages,
          printGate: { guardianConsent, privacySafe, printIntent },
        },
        null,
        2,
      ),
    [age, characterUrl, childName, childPhoto, guardianConsent, lesson, pageCount, pageImages, plan, printIntent, privacySafe, storySeed, style],
  );

  function resetDownstream() {
    setPlanConfirmed(false);
    setCharacterUrl(null);
    setCharacterTask(emptyTask);
    setCharacterConfirmed(false);
    setPageImages({});
    setPageTasks({});
    setPagesConfirmed(false);
  }

  function goStep(index: number) {
    setErr(null);
    const locks = [
      sourceComplete,
      sourceComplete && Boolean(plan),
      sourceComplete && planConfirmed,
      sourceComplete && planConfirmed && characterConfirmed && Boolean(characterUrl),
      sourceComplete && planConfirmed && characterConfirmed && allPagesReady,
    ];
    if (!locks[index]) {
      setErr(`请先完成「${steps[Math.max(0, index - 1)]?.title || '素材'}」步骤，再进入下一步。`);
      return;
    }
    setActiveStep(index);
  }

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('请上传图片文件。');
    if (file.size > 4_500_000) return setErr('图片请控制在 4.5MB 以内。');
    setChildPhoto(await readImage(file));
    resetDownstream();
    setNotice('主角照片已加入，后续定妆会把它作为参考。');
  }

  function applySample() {
    const sampleImages: Record<number, string> = {};
    for (const page of samplePlan.pages) sampleImages[page.pageNumber] = samplePageUrl(page);
    setChildName('小星');
    setAge('4-7 岁');
    setStorySeed('雨后，一个孩子在窗边发现一颗会发光的小种子，并帮助它找到适合生长的家。');
    setLesson('学会倾听、表达需要、和朋友合作并分享快乐。');
    setStyle(styleOptions[0]);
    setPageCount(6);
    setLanguage('Chinese');
    setChildPhoto(null);
    setPlan(samplePlan);
    setCharacterPrompt(samplePlan.character.characterPrompt);
    setCharacterUrl(sampleCharacterUrl);
    setPageImages(sampleImages);
    setPlanConfirmed(true);
    setCharacterConfirmed(true);
    setPagesConfirmed(true);
    setErr(null);
    setNotice('已一键跑通样例：故事板、定妆图、逐页插画和导出预览都已填好。');
    setActiveStep(4);
  }

  async function generatePlan() {
    if (!session) return signIn('google');
    if (!sourceComplete) return setErr('请先填写故事点子，并确认授权/隐私/打印检查。');
    setBusyPlan(true);
    setErr(null);
    setNotice('正在生成分页故事板...');
    const res = await fetch('/api/picture-book/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName, age, storySeed, lesson, style, pageCount, language, hasChildPhoto: Boolean(childPhoto) }),
    });
    const data = await res.json();
    setBusyPlan(false);
    if (!res.ok) {
      setNotice(null);
      return setErr(data.error === 'insufficient_credits' ? '积分不足，请先充值。' : `故事板生成失败：${data.error || 'unknown'}`);
    }
    setPlan(data.plan);
    setCharacterPrompt(data.plan.character.characterPrompt);
    setPlanConfirmed(false);
    setCharacterUrl(null);
    setCharacterConfirmed(false);
    setPageImages({});
    setPagesConfirmed(false);
    setNotice(data.fallback ? 'LLM 暂不可用，已退回积分并填入本地兜底故事板。' : '分页故事板已生成，请检查后确认。');
    window.dispatchEvent(new Event('atlas:credits'));
    setActiveStep(1);
  }

  function pollCreation(id: string, onDone: (url: string) => void, onFail: () => void) {
    if (pollers.current[id]) clearInterval(pollers.current[id]);
    pollers.current[id] = setInterval(async () => {
      try {
        const res = await fetch(`/api/creations/${id}`);
        const data = await res.json();
        if (data.status === 'completed') {
          clearInterval(pollers.current[id]);
          delete pollers.current[id];
          const url = Array.isArray(data.outputs) ? data.outputs[0] : '';
          if (url) onDone(url);
        } else if (data.status === 'failed') {
          clearInterval(pollers.current[id]);
          delete pollers.current[id];
          window.dispatchEvent(new Event('atlas:credits'));
          onFail();
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  async function generateCharacter() {
    if (!session) return signIn('google');
    if (!plan) return setErr('请先生成或套用故事板。');
    setCharacterTask({ status: 'processing' });
    setErr(null);
    setNotice('正在生成主角定妆图...');
    const res = await fetch('/api/picture-book/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'character', prompt: characterPrompt, childPhoto }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCharacterTask({ status: 'failed', error: data.error });
      return setErr(data.error === 'insufficient_credits' ? '积分不足，请先充值。' : `定妆图提交失败：${data.error || 'unknown'}`);
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setCharacterTask({ status: 'processing', id: data.id });
    pollCreation(
      data.id,
      (url) => {
        setCharacterUrl(url);
        setCharacterTask({ status: 'completed', id: data.id, url });
        setNotice('定妆图已完成，请确认角色后进入逐页插画。');
      },
      () => {
        setCharacterTask({ status: 'failed', id: data.id });
        setErr('定妆图生成失败，积分已退回。');
      },
    );
  }

  async function generatePage(page: PictureBookPage) {
    if (!session) return signIn('google');
    if (!characterUrl) return setErr('请先生成并确认主角定妆图。');
    setPageTasks((current) => ({ ...current, [page.pageNumber]: { status: 'processing' } }));
    setErr(null);
    const res = await fetch('/api/picture-book/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page', prompt: page.illustrationPrompt, characterImage: characterUrl, childPhoto }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPageTasks((current) => ({ ...current, [page.pageNumber]: { status: 'failed', error: data.error } }));
      return setErr(data.error === 'insufficient_credits' ? '积分不足，请先充值。' : `第 ${page.pageNumber} 页提交失败：${data.error || 'unknown'}`);
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setPageTasks((current) => ({ ...current, [page.pageNumber]: { status: 'processing', id: data.id } }));
    pollCreation(
      data.id,
      (url) => {
        setPageImages((current) => ({ ...current, [page.pageNumber]: url }));
        setPageTasks((current) => ({ ...current, [page.pageNumber]: { status: 'completed', id: data.id, url } }));
      },
      () => {
        setPageTasks((current) => ({ ...current, [page.pageNumber]: { status: 'failed', id: data.id } }));
        setErr(`第 ${page.pageNumber} 页生成失败，积分已退回。`);
      },
    );
  }

  async function generateMissingPages() {
    if (!plan) return;
    for (const page of plan.pages) {
      if (!pageImages[page.pageNumber] && pageTasks[page.pageNumber]?.status !== 'processing') {
        await generatePage(page);
      }
    }
  }

  function updatePage(pageNumber: number, patch: Partial<PictureBookPage>) {
    setPlan((current) =>
      current
        ? {
            ...current,
            pages: current.pages.map((page) => (page.pageNumber === pageNumber ? { ...page, ...patch } : page)),
          }
        : current,
    );
    setPagesConfirmed(false);
  }

  function bookHtml() {
    if (!plan) return '';
    const pages = plan.pages
      .map((page) => {
        const image = pageImages[page.pageNumber] || '';
        return `<section class="spread">
  <div class="art">${image ? `<img src="${image}" />` : '<div class="missing">Missing image</div>'}</div>
  <div class="text"><span>${page.pageNumber}</span><p>${page.text}</p></div>
</section>`;
      })
      .join('\n');
    return `<!doctype html><html><head><meta charset="utf-8"/><title>${plan.title}</title><style>
@page{size:8in 8in;margin:0}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#241c15}.cover,.spread{break-after:page;page-break-after:always;width:8in;height:8in;position:relative;overflow:hidden;background:#fff}.cover{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0.7in;box-sizing:border-box;background:#f8e7c9}.cover h1{font-size:38pt;margin:0 0 18pt}.cover p{font-size:16pt;line-height:1.45}.art{position:absolute;inset:0}.art img{width:100%;height:100%;object-fit:cover}.missing{display:flex;align-items:center;justify-content:center;height:100%;color:#999;background:#f5f5f5}.text{position:absolute;left:.45in;right:.45in;bottom:.42in;padding:.18in .24in;border-radius:.18in;background:rgba(255,255,255,.86);box-shadow:0 10px 30px rgba(0,0,0,.1)}.text span{font-size:10pt;color:#7c3aed;font-weight:700}.text p{font-size:20pt;line-height:1.25;margin:.04in 0 0;font-weight:700}.spec{font-size:10pt;margin-top:18pt;color:#6b5d53}</style></head><body>
<section class="cover"><h1>${plan.title}</h1><p>${plan.logline}</p><div class="spec">${plan.printSpecs.trimSize} · ${plan.printSpecs.bleed}</div></section>
${pages}
</body></html>`;
  }

  function printBook() {
    const html = bookHtml();
    const win = window.open('', '_blank');
    if (!win) return setErr('浏览器阻止了弹窗，请允许弹窗后再导出。');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setErr(null);
      setNotice(`${label} 已复制。`);
    } catch {
      setErr(`${label} 复制失败，请改用下载文件。`);
    }
  }

  const currentPage = plan?.pages.find((page) => page.pageNumber === selectedPage) || plan?.pages[0];

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <BookOpenText className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 绘本成书</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
              一个故事点子或孩子照片进入后，先拆分页故事板，再锁定主角形象，逐页生成一致插画，最后排版成可打印 PDF/HTML。
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => {
              const active = activeStep === index;
              const ready = step.ready;
              return (
                <button key={step.title} onClick={() => goStep(index)} className={`group rounded-xl border p-3 text-left transition ${active ? 'border-brand-300 bg-brand-50' : ready ? 'border-emerald-200 bg-emerald-50/60' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-10 w-2 rounded-full ${active ? 'bg-brand-500 shadow-glow' : ready ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-brand-600 text-white' : ready ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>{ready ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                  </div>
                  <div className="text-sm font-semibold">{step.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">{step.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {(err || notice) && (
          <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${err ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {err ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{err || notice}</span>
          </div>
        )}
      </section>

      {activeStep === 0 && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="card p-5">
            <h2 className="text-lg font-bold">1. 上传主角 / 输入故事点子</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">主角昵称</span>
                <input value={childName} onChange={(e) => { setChildName(e.target.value); resetDownstream(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">年龄段</span>
                <input value={age} onChange={(e) => { setAge(e.target.value); resetDownstream(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">故事点子</span>
              <textarea value={storySeed} onChange={(e) => { setStorySeed(e.target.value); resetDownstream(); }} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">情绪目标 / 教育主题</span>
              <textarea value={lesson} onChange={(e) => { setLesson(e.target.value); resetDownstream(); }} rows={2} className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">视觉风格</span>
                <select value={style} onChange={(e) => { setStyle(e.target.value); resetDownstream(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                  {styleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">页数</span>
                <input type="number" min={4} max={10} value={pageCount} onChange={(e) => { setPageCount(Math.max(4, Math.min(10, Number(e.target.value) || 6))); resetDownstream(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['监护人授权使用照片/昵称', guardianConsent, setGuardianConsent],
                ['不包含学校住址等隐私', privacySafe, setPrivacySafe],
                ['导出前人工审核再打印', printIntent, setPrintIntent],
              ].map(([label, checked, setter]) => (
                <label key={String(label)} className="flex items-start gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm leading-5">
                  <input type="checkbox" checked={Boolean(checked)} onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600" />
                  {label as string}
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={generatePlan} disabled={busyPlan} className="btn-brand">
                {busyPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                生成分页故事板 · 2 积分
              </button>
              <button onClick={() => sourceComplete ? setActiveStep(1) : setErr('请先填写故事点子并确认授权/隐私。')} className="btn-ghost">
                下一步 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold">主角照片</h3>
              <label className="mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500 hover:border-brand-300 hover:bg-brand-50/40">
                {childPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={childPhoto} alt="child reference" className="max-h-[260px] w-full rounded-lg object-contain" />
                ) : (
                  <>
                    <UploadCloud className="mb-2 h-8 w-8 text-brand-500" />
                    上传孩子照片做主角参考
                    <span className="mt-1 text-xs text-neutral-400">可选；不上传也能生成原创主角</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
              </label>
              {childPhoto && <button onClick={() => { setChildPhoto(null); resetDownstream(); }} className="btn-ghost mt-3 w-full">移除照片</button>}
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-brand-600" />
                <h3 className="font-semibold">样例</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-500">不消耗积分，直接填充一个已设计好的绘本项目，验证从输入到导出的完整路径。</p>
              <button onClick={applySample} className="btn-brand mt-4 w-full"><Sparkles className="h-4 w-4" />一键运行样例</button>
            </div>
          </aside>
        </section>
      )}

      {activeStep === 1 && plan && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="card p-5">
            <h2 className="text-lg font-bold">2. 调试分页故事板</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">书名</span>
                <input value={plan.title} onChange={(e) => setPlan({ ...plan, title: e.target.value })} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">主题</span>
                <input value={plan.theme} onChange={(e) => setPlan({ ...plan, theme: e.target.value })} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">一句话简介</span>
              <textarea value={plan.logline} onChange={(e) => setPlan({ ...plan, logline: e.target.value })} rows={2} className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="mt-5 space-y-3">
              {plan.pages.map((page) => (
                <div key={page.pageNumber} className="rounded-xl border border-neutral-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">第 {page.pageNumber} 页</h3>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">{page.emotion}</span>
                  </div>
                  <input value={page.text} onChange={(e) => updatePage(page.pageNumber, { text: e.target.value })} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400" />
                  <textarea value={page.scene} onChange={(e) => updatePage(page.pageNumber, { scene: e.target.value })} rows={2} className="mt-2 w-full resize-none rounded-lg border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => { setPlanConfirmed(true); setNotice('故事板已确认，可以进入主角定妆。'); setActiveStep(2); }} className="btn-brand"><CheckCircle2 className="h-4 w-4" />确认故事板</button>
              <button onClick={generatePlan} disabled={busyPlan} className="btn-ghost">{busyPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}重新生成</button>
            </div>
          </div>

          <aside className="card p-5">
            <h3 className="font-semibold">中间 JSON</h3>
            <pre className="mt-4 max-h-[720px] overflow-auto rounded-xl bg-neutral-950 p-4 text-xs leading-5 text-neutral-100">{JSON.stringify(plan, null, 2)}</pre>
          </aside>
        </section>
      )}

      {activeStep === 2 && plan && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="card p-5">
            <h2 className="text-lg font-bold">3. 生成并确认主角定妆</h2>
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-900">
              <ShieldCheck className="mr-1 inline h-4 w-4" />
              定妆契约：后续每页都必须保留同一张脸、同一发型、同一套衣服、同一颜色体系。
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">定妆提示词</span>
              <textarea value={characterPrompt} onChange={(e) => { setCharacterPrompt(e.target.value); setCharacterConfirmed(false); }} rows={8} className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {plan.character.fixedTraits.map((trait) => (
                <div key={trait} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">{trait}</div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={generateCharacter} disabled={characterTask.status === 'processing'} className="btn-brand">
                {characterTask.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                生成定妆图 · 4 积分
              </button>
              <button disabled={!characterUrl} onClick={() => { setCharacterConfirmed(true); setNotice('主角定妆已确认，可以逐页生成插画。'); setActiveStep(3); }} className="btn-ghost disabled:opacity-50">
                确认角色 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <aside className="card p-5">
            <h3 className="font-semibold">定妆预览</h3>
            <div className="mt-4 flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              {characterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={characterUrl} alt="character" className="max-h-[520px] w-full object-contain" referrerPolicy="no-referrer" />
              ) : characterTask.status === 'processing' ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400"><Loader2 className="h-8 w-8 animate-spin text-brand-500" />生成中...</div>
              ) : (
                <div className="text-center text-sm text-neutral-400">定妆图会显示在这里</div>
              )}
            </div>
          </aside>
        </section>
      )}

      {activeStep === 3 && plan && currentPage && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">4. 逐页插画调试</h2>
              <button onClick={generateMissingPages} className="btn-brand"><ImagePlus className="h-4 w-4" />生成全部缺失页</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {plan.pages.map((page) => (
                <button key={page.pageNumber} onClick={() => setSelectedPage(page.pageNumber)} className={`rounded-full border px-3 py-1.5 text-sm ${selectedPage === page.pageNumber ? 'border-brand-300 bg-brand-50 text-brand-700' : pageImages[page.pageNumber] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500'}`}>第 {page.pageNumber} 页</button>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium">第 {currentPage.pageNumber} 页文字</span>
              <input value={currentPage.text} onChange={(e) => updatePage(currentPage.pageNumber, { text: e.target.value })} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">插画提示词</span>
              <textarea value={currentPage.illustrationPrompt} onChange={(e) => updatePage(currentPage.pageNumber, { illustrationPrompt: e.target.value })} rows={9} className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => generatePage(currentPage)} disabled={pageTasks[currentPage.pageNumber]?.status === 'processing'} className="btn-brand">
                {pageTasks[currentPage.pageNumber]?.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                生成当前页 · 10 积分
              </button>
              <button disabled={!allPagesReady} onClick={() => { setPagesConfirmed(true); setNotice('全部页面已确认，可以进入排版导出。'); setActiveStep(4); }} className="btn-ghost disabled:opacity-50">
                确认整本插画 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <aside className="card p-5">
            <h3 className="font-semibold">当前页预览</h3>
            <div className="mt-4 flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              {pageImages[currentPage.pageNumber] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pageImages[currentPage.pageNumber]} alt={`page ${currentPage.pageNumber}`} className="max-h-[520px] w-full object-contain" referrerPolicy="no-referrer" />
              ) : pageTasks[currentPage.pageNumber]?.status === 'processing' ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400"><Loader2 className="h-8 w-8 animate-spin text-brand-500" />第 {currentPage.pageNumber} 页生成中...</div>
              ) : (
                <div className="text-center text-sm text-neutral-400">页面插画会显示在这里</div>
              )}
            </div>
          </aside>
        </section>
      )}

      {activeStep === 4 && plan && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">5. 排版预览与导出</h2>
                <p className="mt-1 text-sm text-neutral-500">{plan.printSpecs.trimSize} · {plan.printSpecs.bleed}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => copyText(exportJson, '绘本 JSON')} className="btn-ghost"><Copy className="h-4 w-4" />复制 JSON</button>
                <button onClick={() => downloadFile('picture-book-production.json', exportJson, 'application/json')} className="btn-ghost"><Download className="h-4 w-4" />下载 JSON</button>
                <button onClick={() => downloadFile('picture-book-print.html', bookHtml(), 'text/html;charset=utf-8')} className="btn-ghost"><FileText className="h-4 w-4" />下载 HTML</button>
                <button onClick={printBook} className="btn-brand"><Printer className="h-4 w-4" />打印 / 存 PDF</button>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-[#f8e7c9] p-6 text-center">
                <h3 className="text-2xl font-bold">{plan.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{plan.logline}</p>
              </div>
              {plan.pages.map((page) => (
                <div key={page.pageNumber} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <div className="aspect-[4/3] bg-neutral-100">
                    {pageImages[page.pageNumber] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pageImages[page.pageNumber]} alt={`page ${page.pageNumber}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">缺少图片</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-semibold text-brand-600">第 {page.pageNumber} 页</div>
                    <p className="mt-1 text-sm font-semibold leading-6">{page.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="card p-5">
            <h3 className="font-semibold">导出前检查</h3>
            <div className="mt-4 space-y-2">
              {plan.safetyChecklist.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <pre className="mt-5 max-h-[360px] overflow-auto rounded-xl bg-neutral-950 p-4 text-xs leading-5 text-neutral-100">{exportJson}</pre>
          </aside>
        </section>
      )}

      {activeStep > 0 && !steps[activeStep].ready && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <LockKeyhole className="h-4 w-4" />
          当前步骤还没确认，完成后才能进入下一步。
        </div>
      )}
    </div>
  );
}
