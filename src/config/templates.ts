/**
 * Launch scenarios. Each binds a REAL Atlas model (verified working) to a
 * creative preset. All take ONE uploaded image.
 *
 *   image-edit  → generateImage, input under `images` (seedream .../edit)
 *   i2v         → generateVideo, input under `image`  (seedance i2v)
 *
 * `cost` is in your in-app credits (config/pricing.ts). Atlas's real per-run
 * cost is a few cents, so every scenario is high-margin.
 *
 * Want UGC-avatar ads or micro-drama? Those need talking-avatar / multi-shot
 * models with higher technical risk — add them once their endpoints are
 * verified. Multi-image scenarios (try-on, baby-predictor, group reunion) need
 * a 2nd reference image and a different UI, so they're left out of this
 * single-image gallery.
 */
export interface Template {
  id: string;
  title: string;
  description: string;
  emoji: string;
  output: 'image' | 'video';
  endpoint: 'generateImage' | 'generateVideo';
  model: string;
  imageField: 'image' | 'images';
  cost: number;
  promptPlaceholder: string;
  defaultPrompt: string;
  extra?: Record<string, unknown>;
  atlasCost: string;
}

const EDIT = {
  output: 'image' as const,
  endpoint: 'generateImage' as const,
  model: 'bytedance/seedream-v4.5/edit',
  imageField: 'images' as const,
  cost: 8,
  atlasCost: '$0.036',
};

export const TEMPLATES: Template[] = [
  {
    ...EDIT,
    id: 'headshot',
    title: 'AI Professional Headshot',
    description: 'Selfie → studio-grade corporate headshot.',
    emoji: '👔',
    promptPlaceholder: 'navy business suit, soft window light, confident smile',
    defaultPrompt:
      'Transform this person into a professional corporate headshot: tasteful business attire, clean neutral studio background, soft professional lighting, confident friendly expression, photorealistic.',
  },
  {
    ...EDIT,
    id: 'product-photo',
    title: 'AI Product Photo',
    description: 'Any product → clean premium studio scene.',
    emoji: '📦',
    promptPlaceholder: 'on a marble podium, soft studio shadows, minimal beige backdrop',
    defaultPrompt:
      'Place this product in a clean professional e-commerce studio scene: soft realistic shadows, premium minimal backdrop, even commercial lighting, crisp focus, hero product shot.',
  },
  {
    ...EDIT,
    id: 'virtual-staging',
    title: 'AI Virtual Staging',
    description: 'Empty room → furnished real-estate listing.',
    emoji: '🛋️',
    promptPlaceholder: 'modern Scandinavian living room, warm and inviting',
    defaultPrompt:
      'Furnish this empty room with tasteful modern furniture and decor: warm inviting staging, realistic interior design, natural lighting, photorealistic. Keep the room architecture and windows unchanged.',
  },
  {
    ...EDIT,
    id: 'wedding',
    title: 'AI Wedding Photoshoot',
    description: 'A photo → a dreamy wedding shoot.',
    emoji: '💍',
    promptPlaceholder: 'elegant white gown, golden-hour garden, cinematic bokeh',
    defaultPrompt:
      'Transform this into an elegant wedding photoshoot: formal wedding attire, romantic scenic background, soft cinematic golden-hour lighting, professional photography, keep the faces faithful.',
  },
  {
    ...EDIT,
    id: 'pet-portrait',
    title: 'AI Pet Portrait',
    description: 'Your pet → a regal Renaissance painting.',
    emoji: '🐾',
    promptPlaceholder: 'royal velvet robe, golden crown, oil-painting style',
    defaultPrompt:
      'Transform this pet into a regal Renaissance oil-painting portrait: royal attire, classic painterly style, ornate background, museum quality, keep the pet recognizable.',
  },
  {
    ...EDIT,
    id: 'photo-restore',
    title: 'AI Photo Restore',
    description: 'Old/damaged photo → restored & colorized.',
    emoji: '🖼️',
    promptPlaceholder: 'repair scratches, natural colors, sharpen details',
    defaultPrompt:
      'Restore and colorize this old photo: repair scratches, tears and damage, add natural realistic colors, sharpen details, while preserving the original faces and composition.',
  },
  {
    ...EDIT,
    id: 'hairstyle',
    title: 'AI Hairstyle Try-On',
    description: 'See yourself with a new hairstyle.',
    emoji: '💇',
    promptPlaceholder: 'long wavy bob, warm brown, natural volume',
    defaultPrompt:
      'Give this person a stylish new hairstyle: modern flattering cut, natural realistic hair, keep the face and identity faithful, photorealistic.',
  },
  {
    ...EDIT,
    id: 'tattoo',
    title: 'AI Tattoo Try-On',
    description: 'Preview a tattoo on your skin.',
    emoji: '🖋️',
    promptPlaceholder: 'fine-line dragon on the forearm, black ink',
    defaultPrompt:
      'Add a realistic tattoo to this person: natural skin integration, believable shading and placement, photorealistic, keep everything else unchanged.',
  },
  {
    ...EDIT,
    id: 'makeup',
    title: 'AI Makeup Try-On',
    description: 'Try a professional makeup look.',
    emoji: '💄',
    promptPlaceholder: 'soft glam, warm tones, natural flawless skin',
    defaultPrompt:
      'Apply elegant professional makeup to this person: natural flawless look, enhanced features, soft glam, keep identity faithful, photorealistic.',
  },
  {
    id: 'photo-to-life',
    title: 'Photo to Life (animate)',
    description: 'Any photo → a short animated video.',
    emoji: '🪄',
    output: 'video',
    endpoint: 'generateVideo',
    model: 'bytedance/seedance-v1-pro-fast/image-to-video',
    imageField: 'image',
    cost: 5,
    promptPlaceholder: 'gentle smile, hair in the breeze, slow cinematic push-in',
    defaultPrompt:
      'The subject comes to life with subtle natural motion: gentle smile, soft head movement, hair and clothing moving slightly, slow cinematic camera push-in, stable and realistic.',
    atlasCost: '$0.009',
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
