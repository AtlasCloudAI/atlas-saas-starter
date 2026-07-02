import { atlasChat } from './atlas';

export const ECOMMERCE_SUITE_COST = 3;

export type EcommerceSuiteInput = {
  productName: string;
  productUrl: string;
  marketplace: string;
  audience: string;
  productFacts: string;
  constraints: string;
  sourceImageCount: number;
};

export type EcommerceSuitePlan = {
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

export function cleanEcommerceField(value: unknown, fallback = '', max = 1600): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, max);
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no_json_object');
  return JSON.parse(raw.slice(start, end + 1));
}

function asStringArray(value: unknown, fallback: string[], max = 8): string[] {
  const items = Array.isArray(value) ? value : [];
  const cleaned = items
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
  return cleaned.length ? cleaned : fallback;
}

function asString(value: unknown, fallback: string, max = 2200): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

function normalizePlan(value: any, input: EcommerceSuiteInput): EcommerceSuitePlan {
  const productName = asString(value?.productName, input.productName || 'Unnamed product', 120);
  const category = asString(value?.category, '电商商品', 120);
  const audience = asString(value?.audience, input.audience || '目标消费者', 240);
  const sellingPoints = asStringArray(value?.sellingPoints, ['核心卖点清晰', '适合目标人群', '可用于主图、详情页和广告'], 6);
  const complianceLimits = asStringArray(value?.complianceLimits, ['不得夸大未证明功效', '主图不要随机加文字或徽章', '保持商品外观、标签和材质准确'], 6);
  const bullets = asStringArray(value?.amazonListing?.bullets, sellingPoints.map((point) => `${point}，适合${audience}`), 5);

  return {
    productName,
    category,
    audience,
    sellingPoints,
    complianceLimits,
    imagePrompts: {
      mainImage: asString(
        value?.imagePrompts?.mainImage,
        `Keep the exact same ${productName}. Create a marketplace-compliant main image on pure white background, centered product, realistic soft shadow, no extra text, no watermark.`,
      ),
      lifestyle: asString(
        value?.imagePrompts?.lifestyle,
        `Keep the exact same ${productName}. Place it in a realistic lifestyle scene for ${audience}, natural light, premium ecommerce photography, no misleading claims.`,
      ),
      aPlus: asString(
        value?.imagePrompts?.aPlus,
        `Keep the exact same ${productName}. Create a clean A+ content hero image with product detail close-ups, tasteful props, space for text overlay, premium commercial lighting.`,
      ),
      modelOrTryOn: asString(
        value?.imagePrompts?.modelOrTryOn,
        `Use the uploaded product as the exact item. Show a realistic model or hand using the product naturally, preserve product details, ecommerce ad style, no false claims.`,
      ),
    },
    videoPrompt: asString(
      value?.videoPrompt,
      `Use the uploaded product references. Create a vertical ecommerce ad for ${productName}: start with a clear product hero shot, show one real use case, close-up the key detail, end with a concise CTA, no exaggerated claims.`,
    ),
    amazonListing: {
      title: asString(value?.amazonListing?.title, `${productName} for ${audience}`, 220),
      bullets,
      description: asString(
        value?.amazonListing?.description,
        `${productName} is positioned for ${audience}. Focus on practical benefits, accurate product details, and a clean marketplace-compliant tone.`,
        1000,
      ),
      searchTerms: asStringArray(value?.amazonListing?.searchTerms, [productName, category, ...sellingPoints.slice(0, 3)], 12),
    },
    socialPublisher: {
      tiktok: asString(value?.socialPublisher?.tiktok, `${productName}: one practical problem, one clear demo, one CTA.`, 400),
      xiaohongshu: asString(value?.socialPublisher?.xiaohongshu, `${productName}真实使用体验，适合${audience}。`, 400),
      instagram: asString(value?.socialPublisher?.instagram, `${productName} in a clean lifestyle setup for ${audience}.`, 400),
    },
    qaChecklist: asStringArray(value?.qaChecklist, ['商品外观和标签未被改写', '主图符合平台规则', '卖点来自可证明事实', '视频首秒出现商品', '字幕和按钮区域不遮挡主体'], 8),
  };
}

export async function draftEcommerceSuite(input: EcommerceSuiteInput): Promise<EcommerceSuitePlan> {
  const content = await atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior ecommerce creative director for Amazon, Shopify, TikTok Shop and social ads. Return strict JSON only. Do not invent certifications, medical claims, discounts, legal guarantees, or unsupported performance numbers.',
      },
      {
        role: 'user',
        content: `Create an ecommerce creative pipeline plan.

Product name: ${input.productName}
Product URL: ${input.productUrl || 'not provided'}
Marketplace: ${input.marketplace}
Audience: ${input.audience}
Verified facts / product notes: ${input.productFacts}
Constraints: ${input.constraints}
Uploaded product image count: ${input.sourceImageCount}

Return this JSON shape exactly:
{
  "productName": "...",
  "category": "...",
  "audience": "...",
  "sellingPoints": ["..."],
  "complianceLimits": ["..."],
  "imagePrompts": {
    "mainImage": "prompt for marketplace main image, preserve exact product",
    "lifestyle": "prompt for lifestyle product photo, preserve exact product",
    "aPlus": "prompt for A+ detail/benefit image, preserve exact product",
    "modelOrTryOn": "prompt for model/try-on/hand-held product image, preserve exact product"
  },
  "videoPrompt": "prompt for a vertical ecommerce ad video using product references",
  "amazonListing": {
    "title": "...",
    "bullets": ["5 bullets max"],
    "description": "...",
    "searchTerms": ["..."]
  },
  "socialPublisher": {
    "tiktok": "...",
    "xiaohongshu": "...",
    "instagram": "..."
  },
  "qaChecklist": ["..."]
}`,
      },
    ],
  );

  return normalizePlan(extractJson(content), input);
}

export function buildFallbackEcommerceSuitePlan(input: EcommerceSuiteInput): EcommerceSuitePlan {
  const facts = input.productFacts
    .split(/[；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const sellingPoints = facts.length ? facts : ['商品外观清晰', '适合目标人群', '可用于主图、详情页和广告素材'];
  return normalizePlan(
    {
      productName: input.productName,
      category: input.marketplace.includes('Amazon') ? 'Amazon / Shopify 电商商品' : '电商商品',
      audience: input.audience,
      sellingPoints,
      complianceLimits: [
        '只使用用户提供的可证明卖点',
        '不得虚构认证、疗效、容量、续航、销量或客户案例',
        '生成素材必须保持商品形状、颜色、标签和材质准确',
        '主图不加随机文字、水印、徽章或无关道具',
      ],
      imagePrompts: {
        mainImage: `Keep the exact same ${input.productName}. Create a marketplace-compliant main image on pure white background, centered product, realistic soft shadow, no text, no watermark, preserve shape, color, label and material.`,
        lifestyle: `Keep the exact same ${input.productName}. Place it in a realistic lifestyle scene for ${input.audience}, natural light, premium ecommerce photography, preserve product details, no unsupported claims.`,
        aPlus: `Keep the exact same ${input.productName}. Create a clean A+ content image showing product details and practical benefits based only on these facts: ${sellingPoints.join(', ')}. Leave space for text overlay, no fake labels.`,
        modelOrTryOn: `Use the uploaded ${input.productName} as the exact product reference. Show a realistic model, hand or lifestyle user naturally using it. Preserve product details and avoid false claims.`,
      },
      videoPrompt: `Use the uploaded ${input.productName} references. Create a vertical ecommerce ad: open with a clear product hero shot, demonstrate one realistic use case for ${input.audience}, close-up the most visible product detail, end with a concise CTA. Do not invent claims beyond: ${sellingPoints.join(', ')}.`,
      amazonListing: {
        title: `${input.productName} for ${input.audience}`,
        bullets: sellingPoints.map((point) => `${point}，适合${input.audience}`).slice(0, 5),
        description: `${input.productName} 的页面文案应围绕用户已提供事实展开：${sellingPoints.join('；')}。避免夸大承诺，保持平台合规语气。`,
        searchTerms: [input.productName, ...sellingPoints].slice(0, 8),
      },
      socialPublisher: {
        tiktok: `${input.productName} 的真实使用场景：一个问题，一个演示，一个清晰 CTA。`,
        xiaohongshu: `${input.productName}真实体验：${sellingPoints.slice(0, 3).join(' / ')}。`,
        instagram: `${input.productName} in a clean ecommerce lifestyle setup for ${input.audience}.`,
      },
      qaChecklist: [
        '商品外观和标签未被改写',
        '主图符合平台规则',
        '卖点来自用户提供事实',
        '视频首秒出现商品',
        '文案不包含未证实承诺',
      ],
    },
    input,
  );
}
