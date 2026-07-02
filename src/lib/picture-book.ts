import { atlasChat, submitRawGen } from '@/lib/atlas';

export const PICTURE_BOOK_PLAN_TEMPLATE_ID = 'picture-book-plan';
export const PICTURE_BOOK_CHARACTER_TEMPLATE_ID = 'picture-book-character';
export const PICTURE_BOOK_PAGE_TEMPLATE_ID = 'picture-book-page';
export const PICTURE_BOOK_PLAN_COST = 2;
export const PICTURE_BOOK_CHARACTER_COST = 4;
export const PICTURE_BOOK_PAGE_COST = 10;
export const PICTURE_BOOK_CHARACTER_MODEL = 'openai/gpt-image-2-developer/text-to-image';
export const PICTURE_BOOK_REFERENCE_MODEL = 'google/nano-banana-2-lite/edit-developer';

export type PictureBookPage = {
  pageNumber: number;
  text: string;
  scene: string;
  emotion: string;
  illustrationPrompt: string;
};

export type PictureBookPlan = {
  title: string;
  logline: string;
  ageRange: string;
  theme: string;
  visualStyle: string;
  character: {
    name: string;
    age: string;
    fixedTraits: string[];
    outfit: string;
    expressionNotes: string;
    characterPrompt: string;
  };
  pages: PictureBookPage[];
  safetyChecklist: string[];
  printSpecs: {
    trimSize: string;
    bleed: string;
    safeArea: string;
    exportNote: string;
  };
};

export type PictureBookInput = {
  childName: string;
  age: string;
  storySeed: string;
  lesson: string;
  style: string;
  pageCount: number;
  language: string;
  hasChildPhoto: boolean;
};

export function cleanPictureBookField(value: unknown, fallback: string, max = 500): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

export function normalizePictureBookPageCount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 6;
  return Math.max(4, Math.min(10, Math.round(n)));
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no json object found');
  return JSON.parse(raw.slice(start, end + 1));
}

function stringList(value: unknown, fallback: string[], max = 8): string[] {
  if (!Array.isArray(value)) return fallback;
  const out = value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim().slice(0, 180));
  return out.length ? out.slice(0, max) : fallback;
}

function normalizePlan(raw: unknown, input: PictureBookInput): PictureBookPlan {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, any>) : {};
  const character = data.character && typeof data.character === 'object' ? data.character : {};
  const fallback = buildFallbackPictureBookPlan(input);
  const pagesRaw = Array.isArray(data.pages) ? data.pages : [];
  const pages = pagesRaw
    .slice(0, input.pageCount)
    .map((page: unknown, index: number): PictureBookPage => {
      const p = page && typeof page === 'object' ? (page as Record<string, any>) : {};
      const fallbackPage = fallback.pages[index] || fallback.pages[fallback.pages.length - 1];
      return {
        pageNumber: index + 1,
        text: cleanPictureBookField(p.text, fallbackPage.text, 140),
        scene: cleanPictureBookField(p.scene, fallbackPage.scene, 280),
        emotion: cleanPictureBookField(p.emotion, fallbackPage.emotion, 80),
        illustrationPrompt: cleanPictureBookField(p.illustrationPrompt, fallbackPage.illustrationPrompt, 900),
      };
    });

  return {
    title: cleanPictureBookField(data.title, fallback.title, 80),
    logline: cleanPictureBookField(data.logline, fallback.logline, 180),
    ageRange: cleanPictureBookField(data.ageRange, input.age, 40),
    theme: cleanPictureBookField(data.theme, input.lesson || fallback.theme, 100),
    visualStyle: cleanPictureBookField(data.visualStyle, input.style, 160),
    character: {
      name: cleanPictureBookField(character.name, input.childName, 50),
      age: cleanPictureBookField(character.age, input.age, 40),
      fixedTraits: stringList(character.fixedTraits, fallback.character.fixedTraits, 8),
      outfit: cleanPictureBookField(character.outfit, fallback.character.outfit, 160),
      expressionNotes: cleanPictureBookField(character.expressionNotes, fallback.character.expressionNotes, 180),
      characterPrompt: cleanPictureBookField(character.characterPrompt, fallback.character.characterPrompt, 900),
    },
    pages: pages.length >= 4 ? pages : fallback.pages,
    safetyChecklist: stringList(data.safetyChecklist, fallback.safetyChecklist, 8),
    printSpecs: {
      trimSize: cleanPictureBookField(data.printSpecs?.trimSize, fallback.printSpecs.trimSize, 80),
      bleed: cleanPictureBookField(data.printSpecs?.bleed, fallback.printSpecs.bleed, 80),
      safeArea: cleanPictureBookField(data.printSpecs?.safeArea, fallback.printSpecs.safeArea, 120),
      exportNote: cleanPictureBookField(data.printSpecs?.exportNote, fallback.printSpecs.exportNote, 240),
    },
  };
}

export function buildFallbackPictureBookPlan(input: PictureBookInput): PictureBookPlan {
  const child = input.childName || '小星';
  const style = input.style || 'soft watercolor picture book';
  const fixedTraits = [
    `same child character named ${child}`,
    'round friendly face, warm curious eyes, gentle smile',
    'short dark hair with a tiny star hair clip',
    'yellow raincoat over striped shirt, blue shorts, red sneakers',
    'soft child-safe proportions, no scary details',
  ];
  const scenes = [
    ['在窗边发现一颗会发光的小种子', `${child} 在雨后窗边捧起一颗发光的小种子，房间温暖明亮。`, '好奇'],
    ['给小种子找一个舒服的家', `${child} 把小种子放进小花盆，旁边有一只温柔的小猫陪伴。`, '专注'],
    ['小种子需要勇敢说出需要', `小种子发出微弱的光，${child} 认真听见它需要阳光和水。`, '关心'],
    ['和朋友一起把花盆搬到阳光下', `${child} 和小猫把花盆搬到阳台，阳光像金色毯子一样铺开。`, '合作'],
    ['夜晚守护第一片叶子', `夜晚，${child} 在小夜灯旁看见第一片叶子冒出来，画面安静安心。`, '安心'],
    ['把发光小花送给需要微笑的人', `小花开了，${child} 把它放在社区小桌上，让路过的人都露出微笑。`, '分享'],
    ['回家发现勇气也在心里发芽', `${child} 回到房间，把今天的故事画进小本子里。`, '满足'],
    ['睡前和小猫一起说晚安', `${child} 和小猫在床边向发光小花道晚安，月光柔和。`, '平静'],
  ];
  const pages = Array.from({ length: input.pageCount }, (_, index) => {
    const scene = scenes[index % scenes.length];
    return {
      pageNumber: index + 1,
      text: scene[0],
      scene: scene[1],
      emotion: scene[2],
      illustrationPrompt: `Children's picture book page ${index + 1}. Keep the exact same protagonist: ${fixedTraits.join('; ')}. Scene: ${scene[1]} Emotion: ${scene[2]}. Style: ${style}. Full-bleed illustration with safe blank area for Chinese text, warm lighting, consistent outfit, same face, no text in the image.`,
    };
  });

  return {
    title: `${child} 和发光小种子`,
    logline: '一个关于倾听、合作和分享的小小冒险。',
    ageRange: input.age || '4-7 岁',
    theme: input.lesson || '学会倾听、表达需要和分享快乐',
    visualStyle: style,
    character: {
      name: child,
      age: input.age || '6 岁',
      fixedTraits,
      outfit: 'yellow raincoat, striped shirt, blue shorts, red sneakers, tiny star hair clip',
      expressionNotes: 'curious, gentle, brave, never frightened; expressive but calm',
      characterPrompt: `Create the locked character design sheet for a children's picture book protagonist named ${child}. ${fixedTraits.join('; ')}. Show front-facing full body and a small head close-up, ${style}, white background, child-safe, print-ready, no text.`,
    },
    pages,
    safetyChecklist: ['儿童安全、无恐吓和暴力', '不包含真实学校、住址、电话等隐私', '主角每页同一张脸和同一套衣服', '每页留出文字安全区', '不生成品牌、商标或医疗承诺'],
    printSpecs: {
      trimSize: '8 x 8 inch square picture book',
      bleed: '0.125 inch bleed on all sides',
      safeArea: 'keep important face/text at least 0.35 inch away from trim',
      exportNote: 'Use browser print-to-PDF for proofing; production print should replace generated images with 300 DPI final exports.',
    },
  };
}

export async function draftPictureBookPlan(input: PictureBookInput): Promise<PictureBookPlan> {
  const content = await atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior children picture-book editor and art director. Return only valid JSON. Create safe, age-appropriate, print-aware picture-book plans with strict character consistency.',
      },
      {
        role: 'user',
        content: `Create a ${input.pageCount}-page picture book production plan in ${input.language}.
Main child / character: ${input.childName}
Age range: ${input.age}
Story seed: ${input.storySeed}
Lesson / emotional goal: ${input.lesson}
Visual style: ${input.style}
Photo reference provided: ${input.hasChildPhoto ? 'yes, preserve identity gently while making a child-safe illustrated character' : 'no, invent a consistent original child-safe character'}

Return this exact JSON shape:
{
  "title": "...",
  "logline": "...",
  "ageRange": "...",
  "theme": "...",
  "visualStyle": "...",
  "character": {
    "name": "...",
    "age": "...",
    "fixedTraits": ["5-8 permanent visual traits that must never change"],
    "outfit": "one fixed outfit used across all pages",
    "expressionNotes": "...",
    "characterPrompt": "prompt for the locked character design sheet"
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "short page text, <= 38 Chinese chars or <= 28 English words",
      "scene": "what happens on this page",
      "emotion": "dominant emotion",
      "illustrationPrompt": "image prompt that repeats fixed face/outfit/traits and leaves safe area for text"
    }
  ],
  "safetyChecklist": ["..."],
  "printSpecs": {
    "trimSize": "8 x 8 inch square picture book",
    "bleed": "0.125 inch bleed on all sides",
    "safeArea": "...",
    "exportNote": "..."
  }
}

Rules:
- The protagonist must remain the same person on every page: same face, hair, outfit, colors, proportions.
- No scary threats, gore, violence, unsafe advice, personal data, school names, addresses, phone numbers, or medical claims.
- Every illustrationPrompt must be self-contained and repeat the character consistency constraints.
- Keep each page text short enough for picture-book layout.
- Return only JSON.`,
      },
    ],
    undefined,
    1800,
  );
  return normalizePlan(extractJson(content), input);
}

export async function submitPictureBookCharacterImage(input: {
  prompt: string;
  childPhoto?: string;
}) {
  if (input.childPhoto) {
    return submitRawGen('generateImage', {
      model: PICTURE_BOOK_REFERENCE_MODEL,
      prompt: `${input.prompt} Use the uploaded photo only as a gentle identity reference. Keep the child recognizable, but render as an original safe children's book illustration. Do not include text.`,
      images: [input.childPhoto],
      aspect_ratio: '1:1',
      resolution: '1k',
      thinking_level: 'default',
    });
  }
  return submitRawGen('generateImage', {
    model: PICTURE_BOOK_CHARACTER_MODEL,
    prompt: input.prompt,
    size: '1024x1024',
    quality: 'medium',
    output_format: 'jpeg',
    moderation: 'low',
  });
}

export async function submitPictureBookPageImage(input: {
  prompt: string;
  characterImage: string;
  childPhoto?: string;
}) {
  const images = input.childPhoto ? [input.characterImage, input.childPhoto] : [input.characterImage];
  return submitRawGen('generateImage', {
    model: PICTURE_BOOK_REFERENCE_MODEL,
    prompt: `${input.prompt} Use the first image as the locked character design reference. Preserve the same face, outfit, colors, and child-safe proportions. Make a finished picture-book spread illustration. No text, no watermark.`,
    images,
    aspect_ratio: '4:3',
    resolution: '1k',
    thinking_level: 'default',
  });
}
