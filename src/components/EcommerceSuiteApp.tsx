'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  FileText,
  ImagePlus,
  LockKeyhole,
  Loader2,
  Package,
  PlaySquare,
  ShoppingCart,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';

type EcommerceSuitePlan = {
  productName: string;
  category: string;
  audience: string;
  sellingPoints: string[];
  complianceLimits: string[];
  imagePrompts: {
    mainImage: string;
    lifestyle: string;
    aPlus: string;
    modelOrTryOn: string;
  };
  videoPrompt: string;
  amazonListing: {
    title: string;
    bullets: string[];
    description: string;
    searchTerms: string[];
  };
  socialPublisher: {
    tiktok: string;
    xiaohongshu: string;
    instagram: string;
  };
  qaChecklist: string[];
};

type TaskKey = 'mainImage' | 'lifestyle' | 'aPlus' | 'modelOrTryOn' | 'video';
type TaskState = { status: 'idle' | 'processing' | 'completed' | 'failed'; id?: string; url?: string; error?: string };
type ImagePromptKey = keyof EcommerceSuitePlan['imagePrompts'];

type Example = {
  title: string;
  note: string;
  productName: string;
  productUrl: string;
  marketplace: string;
  audience: string;
  productFacts: string;
  constraints: string;
  imagePaths: string[];
  plan: EcommerceSuitePlan;
};

const emptyTasks: Record<TaskKey, TaskState> = {
  mainImage: { status: 'idle' },
  lifestyle: { status: 'idle' },
  aPlus: { status: 'idle' },
  modelOrTryOn: { status: 'idle' },
  video: { status: 'idle' },
};

const examples: Example[] = [
  {
    title: '桌面便携加湿器',
    note: '输入：商品生活方式图 + 低噪/氛围灯卖点。输出：白底主图、卧室场景图、A+ 图、短视频脚本和 Amazon listing。',
    productName: '桌面便携加湿器',
    productUrl: 'https://example.com/products/portable-humidifier',
    marketplace: 'Amazon + TikTok Shop + Shopify',
    audience: '租房、办公室、小卧室用户；需要低噪、小体积、氛围灯和干燥季节舒适感。',
    productFacts: '小体积桌面加湿器；USB-C 供电；暖色氛围灯；可见雾量；适合办公室和床头柜；不得宣称治疗鼻炎、皮肤病或改善健康问题。',
    constraints: '主图保持商品外观准确；不要添加不存在的按钮、容量数字和医疗承诺；视频强调场景舒适，不做健康疗效承诺。',
    imagePaths: ['/examples/podcast/sales-video-1.jpg', '/examples/podcast/sales-video-2.jpg'],
    plan: {
      productName: '桌面便携加湿器',
      category: '小家电 / 家居舒适',
      audience: '租房、办公室、小卧室用户',
      sellingPoints: ['桌面小体积', 'USB-C 供电', '暖色氛围灯', '低干扰夜间使用场景', '适合办公室和床头柜'],
      complianceLimits: ['不得宣称医疗或皮肤治疗效果', '不得虚构容量、续航或认证', '主图不加随机文字和徽章'],
      imagePrompts: {
        mainImage: 'Keep the exact same humidifier. Create an Amazon-compliant main image on pure white background, product centered, visible mist but realistic, soft shadow, no text, no watermark.',
        lifestyle: 'Keep the exact same humidifier. Place it on a warm bedside table in a small apartment bedroom, soft night light, calm cozy atmosphere, realistic ecommerce lifestyle photography, no medical claims.',
        aPlus: 'Keep the exact same humidifier. Create a clean A+ content image with close-ups of USB-C power, warm ambient light, compact desk size, space for text overlay, premium commercial lighting.',
        modelOrTryOn: 'Keep the exact same humidifier. Show a realistic person using it on a work desk at night, natural home office scene, product clearly visible, no false claims.',
      },
      videoPrompt: 'Use the uploaded humidifier references. Create a vertical ecommerce ad: first second shows the mist and warm light, then show bedside and desk use cases, close-up USB-C and compact size, end with a calm CTA, no health claims.',
      amazonListing: {
        title: 'Portable Desktop Humidifier with Warm Ambient Light for Bedroom, Office and Small Spaces',
        bullets: ['Compact desktop size for nightstand and office desks', 'USB-C powered design for flexible daily use', 'Warm ambient light creates a calm bedside setup', 'Visible mist for dry rooms without oversized appliances', 'Simple lifestyle design for renters and small spaces'],
        description: 'A compact desktop humidifier designed for small spaces, work desks and nightstands. The product communication should focus on comfort, atmosphere and practical placement, while avoiding medical or therapeutic claims.',
        searchTerms: ['desktop humidifier', 'portable humidifier', 'small room humidifier', 'bedside humidifier', 'USB C humidifier'],
      },
      socialPublisher: {
        tiktok: 'POV: your desk and bedside setup finally feels less dry and more cozy. Compact humidifier, warm light, USB-C power.',
        xiaohongshu: '租房/办公桌加湿器真实体验：小体积、暖光、放床头柜也不突兀。',
        instagram: 'Small-space comfort setup with a compact humidifier and warm ambient light.',
      },
      qaChecklist: ['主图保持产品形状和出雾方式准确', '不出现医疗疗效词', 'A+ 图留出文字空间', '短视频首秒出现产品状态', 'CTA 不承诺未经验证效果'],
    },
  },
  {
    title: '通勤电脑托特包',
    note: '输入：白底包图 + 咖啡馆使用图。输出：Amazon 主图、通勤生活方式图、A+ 收纳细节和 Reels/TikTok 视频 brief。',
    productName: '灰色通勤电脑托特包',
    productUrl: 'https://example.com/products/commuter-laptop-tote',
    marketplace: 'Amazon + Shopify + Instagram Reels',
    audience: '城市通勤、咖啡馆办公、需要放电脑/水杯/雨伞的上班族和自由职业者。',
    productFacts: '灰色托特包；可放笔记本电脑；侧袋可放水杯或雨伞；顶部拉链；中性极简外观；不得虚构防水等级和承重。',
    constraints: '保持包形、颜色、拉链、侧袋准确；不要随机添加 logo；不得声称防盗、防水等级或具体容量，除非用户提供证明。',
    imagePaths: ['/examples/podcast/product-recommendation-1.jpg', '/examples/podcast/product-recommendation-2.jpg'],
    plan: {
      productName: '灰色通勤电脑托特包',
      category: '箱包 / 通勤电脑包',
      audience: '城市通勤和咖啡馆办公人群',
      sellingPoints: ['可放笔记本电脑', '侧袋适合水杯或雨伞', '顶部拉链', '中性极简外观', '适合办公和短途出行'],
      complianceLimits: ['不得虚构防水等级', '不得虚构防盗功能', '不得改变包的颜色、形状和拉链结构'],
      imagePrompts: {
        mainImage: 'Keep the exact same gray laptop tote bag. Create a marketplace-compliant main image on pure white background, centered, product fills 85% of frame, realistic shadow, no logo added, no text.',
        lifestyle: 'Keep the exact same gray laptop tote bag. Place it in a realistic cafe work scene with laptop, notebook and coffee nearby, urban commuter mood, natural light, premium ecommerce photography.',
        aPlus: 'Keep the exact same tote bag. Create an A+ content image showing organized laptop compartment, side bottle pocket and top zipper detail, clean layout, space for text overlay, no fake labels.',
        modelOrTryOn: 'Keep the exact same tote bag. Show a realistic commuter carrying it naturally in a city cafe or subway entrance scene, bag clearly visible, premium lifestyle ad style.',
      },
      videoPrompt: 'Use the uploaded tote bag references. Create a vertical ecommerce ad: start with the bag on a clean desk, show laptop and bottle storage, quick commuter carry shot, close-up zipper and side pocket, end with a practical CTA.',
      amazonListing: {
        title: 'Gray Laptop Tote Bag for Work, Commuting and Cafe Office Use',
        bullets: ['Room for a laptop and daily work essentials', 'Side pocket designed for bottle or umbrella placement', 'Top zipper helps keep items organized on the move', 'Minimal gray design fits office and casual outfits', 'Useful for commuting, coworking and short business trips'],
        description: 'A clean gray commuter tote for people who carry a laptop and daily essentials between home, office and cafes. Keep all claims tied to visible product features.',
        searchTerms: ['laptop tote bag', 'work tote', 'commuter bag', 'gray tote bag', 'office bag'],
      },
      socialPublisher: {
        tiktok: 'A work tote that actually fits the laptop, bottle and cafe-day essentials.',
        xiaohongshu: '通勤包真实场景：电脑、水杯、雨伞、笔记本都能有位置。',
        instagram: 'Minimal commuter tote for cafe work days and office routines.',
      },
      qaChecklist: ['主图不得添加不存在 logo', '不要虚构防水/防盗', '展示侧袋和拉链必须与原图一致', '视频中包不能变色', 'Listing 使用可见事实'],
    },
  },
  {
    title: '新能源展会展示装置',
    note: '输入：B2B 展示场景图。输出：官网 hero、展会 A+ 图、招商视频 brief 和 LinkedIn 发布文案。',
    productName: '新能源互动展示装置',
    productUrl: 'https://example.com/products/energy-display-kiosk',
    marketplace: 'Shopify B2B + LinkedIn + 展会落地页',
    audience: '新能源展商、B2B 销售团队、展会主办方、企业解决方案采购。',
    productFacts: '展会互动展示装置；用于展示太阳能、储能、电网和城市能源概念；适合展台讲解和销售演示；不得虚构已部署客户、发电效率或认证。',
    constraints: '保持 B2B 专业感；不要编造客户案例和性能数据；强调演示、互动、展台吸引力和销售讲解效率。',
    imagePaths: ['/examples/podcast/image-explainer-1.jpg'],
    plan: {
      productName: '新能源互动展示装置',
      category: 'B2B 展会展示 / 能源解决方案演示',
      audience: '新能源展商和 B2B 销售团队',
      sellingPoints: ['适合展台互动讲解', '将复杂能源概念可视化', '提高现场停留和咨询效率', '适合官网和 LinkedIn 展示', '可作为销售演示素材'],
      complianceLimits: ['不得虚构发电效率', '不得编造客户案例', '不得添加未经确认的认证标识'],
      imagePrompts: {
        mainImage: 'Keep the exact same energy display kiosk concept. Create a clean B2B website hero image, professional trade show lighting, product centered, no fake logos, no random text.',
        lifestyle: 'Keep the exact same energy display setup. Show a realistic trade show interaction scene with business visitors discussing solar, storage and smart grid visuals, professional B2B atmosphere.',
        aPlus: 'Keep the exact same display. Create a clean feature breakdown image with close-up areas for interactive glass panel, energy diagram and demonstration table, space for website text overlay.',
        modelOrTryOn: 'Keep the exact same B2B display. Show a sales presenter naturally explaining the interactive energy diagram to two business visitors, professional exhibition booth scene.',
      },
      videoPrompt: 'Use the uploaded energy display reference. Create a horizontal or vertical B2B promo video: open with the booth attracting visitors, show hand interaction with the energy diagram, close-up solar/storage visuals, end with a sales demo CTA, no fake metrics.',
      amazonListing: {
        title: 'Interactive Energy Display Kiosk for Trade Shows and B2B Sales Demonstrations',
        bullets: ['Visualizes solar, storage and smart grid concepts for visitors', 'Designed for trade show booths and sales demonstrations', 'Supports clear explanation of complex energy solutions', 'Useful for website hero, LinkedIn and event promotion', 'Professional presentation style for B2B teams'],
        description: 'A B2B interactive display concept for energy solution teams that need to explain complex systems in a trade show or sales environment without relying on unsupported performance claims.',
        searchTerms: ['energy display kiosk', 'trade show display', 'solar demo booth', 'B2B sales demo', 'interactive energy exhibit'],
      },
      socialPublisher: {
        tiktok: 'How to make a complex energy solution understandable in 10 seconds at a trade show.',
        xiaohongshu: '新能源展台怎么做得更好讲？这个互动展示装置适合做销售演示。',
        instagram: 'Interactive energy storytelling for trade shows and B2B sales teams.',
      },
      qaChecklist: ['不出现未授权品牌 logo', '不虚构发电效率和客户案例', '保持专业 B2B 语气', '视频突出互动演示', '官网文案避免夸大承诺'],
    },
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function imageUrlToDataUrl(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`fetch image failed: ${path}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
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

export function EcommerceSuiteApp() {
  const { data: session } = useSession();
  const [productName, setProductName] = useState('桌面便携加湿器');
  const [productUrl, setProductUrl] = useState('https://example.com/products/portable-humidifier');
  const [marketplace, setMarketplace] = useState('Amazon + TikTok Shop + Shopify');
  const [audience, setAudience] = useState('租房、办公室、小卧室用户；需要低噪、小体积、氛围灯和干燥季节舒适感。');
  const [productFacts, setProductFacts] = useState('小体积桌面加湿器；USB-C 供电；暖色氛围灯；可见雾量；适合办公室和床头柜；不得宣称治疗鼻炎、皮肤病或改善健康问题。');
  const [constraints, setConstraints] = useState('主图保持商品外观准确；不要添加不存在的按钮、容量数字和医疗承诺；视频强调场景舒适，不做健康疗效承诺。');
  const [images, setImages] = useState<string[]>([]);
  const [plan, setPlan] = useState<EcommerceSuitePlan>(examples[0].plan);
  const [tasks, setTasks] = useState<Record<TaskKey, TaskState>>(emptyTasks);
  const [busyDraft, setBusyDraft] = useState(false);
  const [loadingExample, setLoadingExample] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [briefReady, setBriefReady] = useState(false);
  const [imageStageConfirmed, setImageStageConfirmed] = useState(false);
  const [videoStageConfirmed, setVideoStageConfirmed] = useState(false);

  const manifest = useMemo(
    () => ({
      app: 'ecommerce-suite',
      productName,
      productUrl,
      marketplace,
      audience,
      productFacts,
      constraints,
      sourceImages: images.length,
      plan,
      tasks,
      handoffRoutes: ['/product-photo', '/amazon-listing', '/virtual-try-on', '/virtual-model-ad', '/ugc-ad-factory', '/social-publisher'],
    }),
    [audience, constraints, images.length, marketplace, plan, productFacts, productName, productUrl, tasks],
  );

  const manifestJson = JSON.stringify(manifest, null, 2);

  function setTask(key: TaskKey, patch: Partial<TaskState>) {
    setTasks((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  function resetTasks() {
    setTasks(emptyTasks);
  }

  function markSourceDirty() {
    setBriefReady(false);
    setImageStageConfirmed(false);
    setVideoStageConfirmed(false);
    setNotice(null);
  }

  function updatePlan(patch: Partial<EcommerceSuitePlan>) {
    setPlan((current) => ({ ...current, ...patch }));
  }

  function updateImagePrompt(key: ImagePromptKey, value: string) {
    setPlan((current) => ({ ...current, imagePrompts: { ...current.imagePrompts, [key]: value } }));
    setImageStageConfirmed(false);
  }

  function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 8);
    if (!files.length) return;
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((items) => {
        setImages(items);
        setErr(null);
        setBriefReady(false);
        setImageStageConfirmed(false);
        setVideoStageConfirmed(false);
        setActiveStep(0);
        resetTasks();
      })
      .catch(() => setErr('图片读取失败。'));
    event.target.value = '';
  }

  async function applyExample(example: Example) {
    setLoadingExample(example.title);
    setErr(null);
    try {
      const dataUrls = await Promise.all(example.imagePaths.map((path) => imageUrlToDataUrl(path)));
      setProductName(example.productName);
      setProductUrl(example.productUrl);
      setMarketplace(example.marketplace);
      setAudience(example.audience);
      setProductFacts(example.productFacts);
      setConstraints(example.constraints);
      setImages(dataUrls);
      setPlan(example.plan);
      resetTasks();
      setBriefReady(true);
      setImageStageConfirmed(false);
      setVideoStageConfirmed(false);
      setActiveStep(1);
      setNotice('已套用测试案例：字段、预期输出和示例图已填充，可从 SKU brief 继续调试。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(`案例图片加载失败：${String(e)}`);
    } finally {
      setLoadingExample(null);
    }
  }

  async function generateDraft() {
    if (!session) return signIn('google');
    if (productName.trim().length < 2) return setErr('请填写商品名。');
    if (productFacts.trim().length < 8) return setErr('请填写可证明卖点/商品事实。');
    setBusyDraft(true);
    setErr(null);
    setNotice(null);
    const res = await fetch('/api/ecommerce-suite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, productUrl, marketplace, audience, productFacts, constraints, sourceImageCount: images.length }),
    });
    const json = await res.json();
    setBusyDraft(false);
    if (!res.ok) {
      setErr(json.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${json.error || 'draft_failed'}`);
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setPlan(json.plan);
    resetTasks();
    setBriefReady(true);
    setImageStageConfirmed(false);
    setVideoStageConfirmed(false);
    setActiveStep(1);
    setNotice(json.fallback ? 'Atlas LLM 暂时不可用，已退回 3 credits，并使用本地保守规则生成 SKU brief。' : 'SKU brief 已由 LLM 生成，可继续生成图片和视频资产。');
  }

  async function pollCreation(id: string, key: TaskKey) {
    for (let i = 0; i < 80; i++) {
      await sleep(i === 0 ? 1200 : key === 'video' ? 4500 : 3000);
      try {
        const res = await fetch(`/api/creations/${id}`);
        const json = await res.json();
        if (json.status === 'completed') {
          const url = Array.isArray(json.outputs) ? json.outputs[0] : null;
          setTask(key, { status: 'completed', url: url || undefined });
          if (key === 'video') setVideoStageConfirmed(true);
          else setImageStageConfirmed(true);
          window.dispatchEvent(new Event('atlas:credits'));
          return;
        }
        if (json.status === 'failed') {
          setTask(key, { status: 'failed', error: json.error || '生成失败，积分已退回。' });
          window.dispatchEvent(new Event('atlas:credits'));
          return;
        }
      } catch {
        /* keep polling */
      }
    }
    setTask(key, { status: 'failed', error: '轮询超时，请稍后在作品页查看。' });
  }

  async function submitImageAsset(key: Exclude<TaskKey, 'video'>, templateId: string, prompt: string) {
    if (!session) return signIn('google');
    if (!images.length) return setErr('请先上传或套用至少一张商品图。');
    setErr(null);
    setTask(key, { status: 'processing', error: undefined, url: undefined });
    const selectedImages = templateId === 'virtual-try-on' ? images.slice(0, 2) : images.slice(0, 1);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, prompt, images: selectedImages }),
    });
    const json = await res.json();
    if (!res.ok) {
      setTask(key, { status: 'failed', error: json.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${json.error || 'failed'}` });
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setTask(key, { status: 'processing', id: json.id });
    pollCreation(json.id, key);
  }

  async function submitVideoAsset() {
    if (!session) return signIn('google');
    if (!images.length) return setErr('请先上传或套用至少一张商品图。');
    setErr(null);
    setTask('video', { status: 'processing', error: undefined, url: undefined });
    const res = await fetch('/api/reference-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'ecommerce-suite-video',
        prompt: plan.videoPrompt,
        images: images.slice(0, 9),
        ratio: '9:16',
        duration: 5,
        resolution: '720p',
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setTask('video', { status: 'failed', error: json.error === 'insufficient_credits' ? '积分不足，请先充值。' : `Error: ${json.error || 'failed'}` });
      return;
    }
    window.dispatchEvent(new Event('atlas:credits'));
    setTask('video', { status: 'processing', id: json.id });
    pollCreation(json.id, 'video');
  }

  function taskLabel(key: TaskKey) {
    return {
      mainImage: '白底主图',
      lifestyle: '生活方式图',
      aPlus: 'A+ 内容图',
      modelOrTryOn: '试穿/模特图',
      video: '广告短视频',
    }[key];
  }

  function renderTask(key: TaskKey) {
    const task = tasks[key];
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{taskLabel(key)}</p>
          <span className="rounded-full bg-white px-2 py-1 text-xs text-neutral-500">{task.status}</span>
        </div>
        <div className="mt-3 flex min-h-[120px] items-center justify-center overflow-hidden rounded-lg bg-white">
          {task.status === 'processing' ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          ) : task.url ? (
            key === 'video' ? (
              <video src={task.url} controls className="max-h-56 w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={task.url} alt={taskLabel(key)} referrerPolicy="no-referrer" className="max-h-56 w-full object-contain" />
            )
          ) : (
            <span className="text-xs text-neutral-400">{task.error || '待生成'}</span>
          )}
        </div>
        {task.url && (
          <a href={`/api/download?url=${encodeURIComponent(task.url)}`} className="btn-ghost mt-3 w-full text-xs">
            <Download className="h-3.5 w-3.5" /> 下载
          </a>
        )}
      </div>
    );
  }

  const sourceReady = productName.trim().length >= 2 && productFacts.trim().length >= 8 && images.length > 0;
  const imageStageComplete = imageStageConfirmed || (['mainImage', 'lifestyle', 'aPlus', 'modelOrTryOn'] as TaskKey[]).some((key) => tasks[key].status === 'completed');
  const videoStageComplete = videoStageConfirmed || tasks.video.status === 'completed';
  const stepItems = [
    { title: '素材', desc: '商品信息 + 图片', done: sourceReady, locked: false, gate: '先填写商品名、商品事实，并上传或套用至少一张商品图。' },
    { title: 'SKU brief', desc: '卖点/合规/提示词', done: briefReady, locked: !sourceReady, gate: '先完成素材步骤。' },
    { title: '图片资产', desc: '主图/A+/模特图', done: imageStageComplete, locked: !sourceReady || !briefReady, gate: '先确认 SKU brief。' },
    { title: '视频资产', desc: '广告短视频 brief', done: videoStageComplete, locked: !sourceReady || !briefReady || !imageStageComplete, gate: '先完成或确认图片资产。' },
    { title: '发布包', desc: 'Listing/社媒/JSON', done: videoStageComplete, locked: !sourceReady || !briefReady || !imageStageComplete || !videoStageComplete, gate: '先完成或确认视频资产。' },
  ];

  function goStep(index: number) {
    const target = stepItems[index];
    if (target.locked) {
      setErr(target.gate);
      return;
    }
    setErr(null);
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function continueFromStep() {
    if (!stepItems[activeStep].done) {
      setErr(stepItems[activeStep].gate);
      return;
    }
    goStep(Math.min(activeStep + 1, stepItems.length - 1));
  }

  function confirmBrief() {
    if (!sourceReady) {
      setErr(stepItems[0].gate);
      return;
    }
    setBriefReady(true);
    setNotice('SKU brief 已确认，可以进入图片资产调试。');
    setErr(null);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmImageStage() {
    if (!briefReady) {
      setErr(stepItems[1].gate);
      return;
    }
    setImageStageConfirmed(true);
    setNotice('图片提示词/预览已确认，可以进入视频 brief。');
    setErr(null);
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmVideoStage() {
    if (!imageStageComplete) {
      setErr(stepItems[2].gate);
      return;
    }
    setVideoStageConfirmed(true);
    setNotice('视频 brief 已确认，可以查看最终发布包。');
    setErr(null);
    setActiveStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStepRail() {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          {stepItems.map((step, index) => {
            const active = index === activeStep;
            const done = step.done;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => goStep(index)}
                className={`flex min-h-[104px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-brand-300 bg-brand-50'
                    : step.locked
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-400'
                      : done
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-neutral-200 bg-white hover:border-brand-200'
                }`}
              >
                <span
                  className={`block h-14 w-2 shrink-0 rounded-full ${
                    active
                      ? 'bg-brand-500 shadow-[0_0_18px_rgba(124,58,237,0.65)]'
                      : done
                        ? 'bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.45)]'
                        : 'bg-neutral-200'
                  }`}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {step.locked ? <LockKeyhole className="h-3.5 w-3.5" /> : done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">{step.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSourceStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">商品名</span>
              <input value={productName} onChange={(e) => { setProductName(e.target.value); markSourceDirty(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">商品 URL</span>
              <input value={productUrl} onChange={(e) => { setProductUrl(e.target.value); markSourceDirty(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">平台组合</span>
            <input value={marketplace} onChange={(e) => { setMarketplace(e.target.value); markSourceDirty(); }} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">目标人群</span>
            <textarea value={audience} onChange={(e) => { setAudience(e.target.value); markSourceDirty(); }} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">可证明卖点 / 商品事实</span>
            <textarea value={productFacts} onChange={(e) => { setProductFacts(e.target.value); markSourceDirty(); }} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">合规限制</span>
            <textarea value={constraints} onChange={(e) => { setConstraints(e.target.value); markSourceDirty(); }} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">商品图片 / 一键样例</h2>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">{images.length}/8</span>
            </div>
            <label className="mt-4 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-brand-300">
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
              {images.length ? (
                <span className="grid w-full grid-cols-2 gap-3">
                  {images.map((src, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={`${src.slice(0, 30)}-${index}`} src={src} alt={`商品图 ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                  ))}
                </span>
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-400">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm">上传商品图、场景图或模特参考图</span>
                  <span className="text-xs">支持多张；前两张可用于试穿/模特参考</span>
                </span>
              )}
            </label>

            <div className="mt-4 grid gap-3">
              {examples.map((example) => (
                <button key={example.title} type="button" onClick={() => applyExample(example)} className="rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-brand-200 hover:bg-brand-50">
                  <span className="flex gap-3">
                    <span className="grid w-24 shrink-0 grid-cols-2 gap-1">
                      {example.imagePaths.slice(0, 2).map((path) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={path} src={path} alt={example.title} className="h-12 w-full rounded-md object-cover" />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{example.title}</span>
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">{example.note}</span>
                      <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        {loadingExample === example.title ? '加载中...' : '一键运行样例'}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={continueFromStep} disabled={!sourceReady} className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50">
            下一步：生成 SKU brief <ChevronRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    );
  }

  function renderBriefStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">SKU brief 调试</h2>
              <p className="mt-1 text-sm text-neutral-500">先让 LLM 生成，再人工确认；也可以直接编辑当前 brief。</p>
            </div>
            <button onClick={generateDraft} disabled={busyDraft || !sourceReady} className="btn-brand disabled:cursor-not-allowed disabled:opacity-50">
              {busyDraft ? <><Loader2 className="h-4 w-4 animate-spin" /> 生成中...</> : <><Sparkles className="h-4 w-4" /> 生成 brief · 3 credits</>}
            </button>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">品类</span>
            <input value={plan.category} onChange={(e) => updatePlan({ category: e.target.value })} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">卖点（一行一个）</span>
            <textarea value={plan.sellingPoints.join('\n')} onChange={(e) => updatePlan({ sellingPoints: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} rows={5} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">合规限制（一行一个）</span>
            <textarea value={plan.complianceLimits.join('\n')} onChange={(e) => updatePlan({ complianceLimits: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <button onClick={confirmBrief} disabled={!sourceReady} className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50">
            确认 brief，进入图片资产 <ChevronRight className="h-4 w-4" />
          </button>
        </section>
        <aside className="card p-5">
          <h2 className="text-sm font-semibold">中间结果预览</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">输入素材</p>
              <p className="mt-1 font-medium text-neutral-800">{productName}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {images.slice(0, 4).map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${src.slice(0, 30)}-${index}`} src={src} alt={`商品图 ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">品类</p>
              <p className="mt-1 font-medium text-neutral-800">{plan.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">目标人群</p>
              <p className="mt-1 leading-6 text-neutral-700">{plan.audience}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">卖点</p>
              <div className="mt-2 flex flex-wrap gap-2">{plan.sellingPoints.map((item) => <span key={item} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{item}</span>)}</div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">QA</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-neutral-600">{plan.qaChecklist.map((item) => <li key={item}>- {item}</li>)}</ul>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  function renderImageStep() {
    const promptCards: Array<{ key: Exclude<TaskKey, 'video'>; promptKey: ImagePromptKey; title: string; templateId: string }> = [
      { key: 'mainImage', promptKey: 'mainImage', title: '白底主图', templateId: 'amazon-listing' },
      { key: 'lifestyle', promptKey: 'lifestyle', title: '生活方式图', templateId: 'product-photo' },
      { key: 'aPlus', promptKey: 'aPlus', title: 'A+ 内容图', templateId: 'product-photo' },
      { key: 'modelOrTryOn', promptKey: 'modelOrTryOn', title: '试穿/模特图', templateId: images.length >= 2 ? 'virtual-try-on' : 'product-photo' },
    ];
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {promptCards.map((item) => (
              <div key={item.key} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs text-neutral-400">/api/generate · {item.templateId} · 8 credits</p>
                  </div>
                  <button onClick={() => submitImageAsset(item.key, item.templateId, plan.imagePrompts[item.promptKey])} className="btn-brand px-3 py-1.5 text-xs">
                    <ImagePlus className="h-3.5 w-3.5" /> 生成
                  </button>
                </div>
                <textarea value={plan.imagePrompts[item.promptKey]} onChange={(e) => updateImagePrompt(item.promptKey, e.target.value)} rows={6} className="mt-3 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 outline-none focus:border-brand-300" />
              </div>
            ))}
          </div>
          <button onClick={confirmImageStage} disabled={!briefReady} className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50">
            确认图片中间结果，进入视频 brief <ChevronRight className="h-4 w-4" />
          </button>
        </section>
        <aside className="space-y-4">
          {renderTask('mainImage')}
          {renderTask('lifestyle')}
          {renderTask('aPlus')}
          {renderTask('modelOrTryOn')}
        </aside>
      </div>
    );
  }

  function renderVideoStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">广告短视频 brief</h2>
              <p className="mt-1 text-sm text-neutral-500">先调脚本和镜头，再生成 9:16 带声参考视频。</p>
            </div>
            <button onClick={submitVideoAsset} className="btn-brand">
              <PlaySquare className="h-4 w-4" /> 生成视频 · 14 credits
            </button>
          </div>
          <textarea value={plan.videoPrompt} onChange={(e) => { updatePlan({ videoPrompt: e.target.value }); setVideoStageConfirmed(false); }} rows={10} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          <button onClick={confirmVideoStage} disabled={!imageStageComplete} className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50">
            确认视频中间结果，进入发布包 <ChevronRight className="h-4 w-4" />
          </button>
        </section>
        <aside className="space-y-4">
          {renderTask('video')}
          <div className="card p-5">
            <h2 className="text-sm font-semibold">源图预览</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {images.slice(0, 4).map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${src.slice(0, 30)}-${index}`} src={src} alt={`视频参考图 ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  function renderPublishStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card p-5">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-bold tracking-tight">Listing / 发布包</h2>
          </div>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-semibold">Amazon 标题</p>
              <textarea value={plan.amazonListing.title} onChange={(e) => updatePlan({ amazonListing: { ...plan.amazonListing, title: e.target.value } })} rows={2} className="mt-2 w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">五点描述</p>
              <textarea value={plan.amazonListing.bullets.join('\n')} onChange={(e) => updatePlan({ amazonListing: { ...plan.amazonListing, bullets: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) } })} rows={6} className="mt-2 w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none focus:border-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">社媒文案预览</p>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {Object.entries(plan.socialPublisher).map(([platform, text]) => (
                  <div key={platform} className="rounded-xl bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
                    <p className="mb-1 text-xs font-semibold uppercase text-neutral-400">{platform}</p>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">QA 检查</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">{plan.qaChecklist.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">交付 JSON</h2>
              <button onClick={() => downloadFile('ecommerce-suite-manifest.json', manifestJson)} className="btn-ghost px-3 py-2 text-xs">
                <Download className="h-3.5 w-3.5" /> 下载
              </button>
            </div>
            <pre className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{manifestJson}</pre>
          </div>
          <div className="card p-5">
            <h2 className="text-sm font-semibold">现有入口仍保留</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                ['/product-photo', '单独生成商品图'],
                ['/amazon-listing', '单独生成 Amazon 主图'],
                ['/virtual-try-on', '单独做试穿'],
                ['/virtual-model-ad', '单独做模特广告视频'],
                ['/ugc-ad-factory', '广告矩阵脚本'],
                ['/social-publisher', '发布包'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-lg bg-neutral-50 px-3 py-2 text-neutral-700 hover:bg-brand-50 hover:text-brand-700">{label} · {href}</Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  function renderActiveStep() {
    if (activeStep === 0) return renderSourceStep();
    if (activeStep === 1) return renderBriefStep();
    if (activeStep === 2) return renderImageStep();
    if (activeStep === 3) return renderVideoStep();
    return renderPublishStep();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 电商创意流水线</h1>
          <p className="mt-1 max-w-3xl text-sm text-neutral-500">
            按步骤完成商品素材、SKU brief、图片资产、视频资产和发布包；每一步都能预览和调试中间结果。
          </p>
        </div>
      </div>
      {renderStepRail()}
      {notice && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-700">{notice}</p>}
      {err && <p className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <FileText className="h-4 w-4 text-brand-600" />
          当前步骤：{stepItems[activeStep].title}
        </div>
        {renderActiveStep()}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 电商创意流水线</h1>
          <p className="mt-1 max-w-3xl text-sm text-neutral-500">
            商品图进入后，先生成 SKU brief、主图/A+ 提示词、试穿/模特方案、广告视频 brief 和 listing，再按阶段调用现有生成入口。
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section className="space-y-6">
          <div className="card space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">商品名</span>
                <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">商品 URL</span>
                <input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">平台组合</span>
              <input value={marketplace} onChange={(e) => setMarketplace(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">目标人群</span>
              <textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">可证明卖点 / 商品事实</span>
              <textarea value={productFacts} onChange={(e) => setProductFacts(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">合规限制</span>
              <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>

            <div>
              <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5 text-center transition hover:border-brand-300">
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
                {images.length ? (
                  <span className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
                    {images.map((src, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`${src.slice(0, 30)}-${index}`} src={src} alt={`商品图 ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                    ))}
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-neutral-400">
                    <UploadCloud className="h-8 w-8" />
                    <span className="text-sm">上传商品图、场景图或模特参考图</span>
                    <span className="text-xs">支持多张；前两张可用于试穿/模特参考</span>
                  </span>
                )}
              </label>
            </div>

            <button onClick={generateDraft} disabled={busyDraft} className="btn-brand w-full">
              {busyDraft ? <><Loader2 className="h-4 w-4 animate-spin" /> 正在生成 SKU brief...</> : <><Sparkles className="h-4 w-4" /> 生成 SKU brief / Listing / Prompts · 3 credits</>}
            </button>
            {notice && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-700">{notice}</p>}
            {err && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{err}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['1', 'LLM 识别', '品类、卖点、合规限制'],
              ['2', '图片生成', '白底主图、场景图、A+'],
              ['3', '模特/视频', '试穿/模特图、广告短片'],
              ['4', '发布包', 'Listing、社媒标题、QA'],
            ].map(([num, title, desc]) => (
              <div key={num} className="rounded-lg border border-neutral-200 bg-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{num}</span>
                <p className="mt-3 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">SKU brief</h2>
              <button onClick={() => navigator.clipboard.writeText(manifestJson)} className="btn-ghost px-3 py-2 text-xs">
                <Copy className="h-3.5 w-3.5" /> 复制 JSON
              </button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">品类</p>
                <p className="mt-1 font-medium">{plan.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">卖点</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plan.sellingPoints.map((item) => <span key={item} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{item}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">合规限制</p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-neutral-600">
                  {plan.complianceLimits.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold">现有入口仍保留</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                ['/product-photo', '单独生成商品图'],
                ['/amazon-listing', '单独生成 Amazon 主图'],
                ['/virtual-try-on', '单独做试穿'],
                ['/virtual-model-ad', '单独做模特广告视频'],
                ['/ugc-ad-factory', '广告矩阵脚本'],
                ['/social-publisher', '发布包'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-lg bg-neutral-50 px-3 py-2 text-neutral-700 hover:bg-brand-50 hover:text-brand-700">
                  {label} · {href}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-bold tracking-tight">生成资产</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AssetPromptCard
              title="白底主图"
              route="/api/generate · amazon-listing"
              prompt={plan.imagePrompts.mainImage}
              cost="8 credits"
              onCopy={() => navigator.clipboard.writeText(plan.imagePrompts.mainImage)}
              onGenerate={() => submitImageAsset('mainImage', 'amazon-listing', plan.imagePrompts.mainImage)}
            />
            <AssetPromptCard
              title="生活方式图"
              route="/api/generate · product-photo"
              prompt={plan.imagePrompts.lifestyle}
              cost="8 credits"
              onCopy={() => navigator.clipboard.writeText(plan.imagePrompts.lifestyle)}
              onGenerate={() => submitImageAsset('lifestyle', 'product-photo', plan.imagePrompts.lifestyle)}
            />
            <AssetPromptCard
              title="A+ 内容图"
              route="/api/generate · product-photo"
              prompt={plan.imagePrompts.aPlus}
              cost="8 credits"
              onCopy={() => navigator.clipboard.writeText(plan.imagePrompts.aPlus)}
              onGenerate={() => submitImageAsset('aPlus', 'product-photo', plan.imagePrompts.aPlus)}
            />
            <AssetPromptCard
              title="试穿/模特图"
              route={images.length >= 2 ? '/api/generate · virtual-try-on' : '/api/generate · product-photo'}
              prompt={plan.imagePrompts.modelOrTryOn}
              cost="8 credits"
              onCopy={() => navigator.clipboard.writeText(plan.imagePrompts.modelOrTryOn)}
              onGenerate={() => submitImageAsset('modelOrTryOn', images.length >= 2 ? 'virtual-try-on' : 'product-photo', plan.imagePrompts.modelOrTryOn)}
            />
            <AssetPromptCard
              title="广告短视频"
              route="/api/reference-video"
              prompt={plan.videoPrompt}
              cost="14 credits"
              onCopy={() => navigator.clipboard.writeText(plan.videoPrompt)}
              onGenerate={submitVideoAsset}
              wide
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="grid gap-4">
            {renderTask('mainImage')}
            {renderTask('lifestyle')}
            {renderTask('aPlus')}
            {renderTask('modelOrTryOn')}
            {renderTask('video')}
          </div>
        </aside>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-bold tracking-tight">Listing / 发布包</h2>
          </div>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-semibold">Amazon 标题</p>
              <p className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">{plan.amazonListing.title}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">五点描述</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
                {plan.amazonListing.bullets.map((item) => <li key={item} className="rounded-xl bg-neutral-50 p-3">• {item}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">社媒文案</p>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {Object.entries(plan.socialPublisher).map(([platform, text]) => (
                  <div key={platform} className="rounded-xl bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
                    <p className="mb-1 text-xs font-semibold uppercase text-neutral-400">{platform}</p>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">QA 检查</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">
              {plan.qaChecklist.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">交付 JSON</h2>
              <button onClick={() => downloadFile('ecommerce-suite-manifest.json', manifestJson)} className="btn-ghost px-3 py-2 text-xs">
                <Download className="h-3.5 w-3.5" /> 下载
              </button>
            </div>
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{manifestJson}</pre>
          </div>
        </aside>
      </section>

      <section className="border-t border-neutral-200 pt-8">
        <div className="flex items-center gap-2">
          <Clipboard className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold tracking-tight">测试案例</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-500">每个案例都包含输入、预期输出和示例图；点击套用后会填入表单和图片，可以继续真实提交 LLM、图片、视频任务。</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {examples.map((example) => (
            <button key={example.title} onClick={() => applyExample(example)} className="card overflow-hidden text-left transition hover:shadow-card">
              <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1">
                {example.imagePaths.slice(0, 2).map((path) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={path} src={path} alt={example.title} className="h-32 w-full rounded-md object-cover" />
                ))}
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{example.note}</p>
                <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                  <p className="font-semibold text-neutral-700">预期输出</p>
                  <p className="mt-1">{example.plan.amazonListing.title}</p>
                  <p className="mt-1 text-brand-700">{example.plan.sellingPoints.slice(0, 3).join(' / ')}</p>
                </div>
                <span className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {loadingExample === example.title ? '加载中...' : '套用案例'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function AssetPromptCard({
  title,
  route,
  prompt,
  cost,
  wide,
  onCopy,
  onGenerate,
}: {
  title: string;
  route: string;
  prompt: string;
  cost: string;
  wide?: boolean;
  onCopy: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className={`rounded-lg border border-neutral-200 bg-white p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-neutral-400">{route} · {cost}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCopy} className="btn-ghost px-2 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" /></button>
          <button onClick={onGenerate} className="btn-brand px-3 py-1.5 text-xs">
            {title.includes('视频') ? <PlaySquare className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
            生成
          </button>
        </div>
      </div>
      <p className="mt-3 line-clamp-5 text-xs leading-5 text-neutral-600">{prompt}</p>
    </div>
  );
}
