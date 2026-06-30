/**
 * The 5 launch scenarios. Each binds a REAL Atlas Cloud model (verified
 * working 2026-06-30) to a creative preset. All 5 take ONE uploaded image.
 *
 *   image-edit  → generateImage, input under `images` (seedream .../edit)
 *   i2v         → generateVideo, input under `image`  (seedance i2v)
 *
 * `cost` is in your in-app credits (config/pricing.ts). Atlas's real per-run
 * cost is a few cents, so every scenario is high-margin.
 */
export interface Template {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** what the user gets back (drives UI: <img> vs <video>) */
  output: 'image' | 'video';
  endpoint: 'generateImage' | 'generateVideo';
  model: string;
  /** payload key for the uploaded image (differs per model) */
  imageField: 'image' | 'images';
  /** credits charged per generation */
  cost: number;
  promptPlaceholder: string;
  defaultPrompt: string;
  extra?: Record<string, unknown>;
  /** real Atlas per-run cost, for the README money math */
  atlasCost: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'headshot',
    title: 'AI Professional Headshot',
    description: 'Turn a selfie into a studio-grade corporate headshot.',
    emoji: '👔',
    output: 'image',
    endpoint: 'generateImage',
    model: 'bytedance/seedream-v4.5/edit',
    imageField: 'images',
    cost: 8,
    promptPlaceholder: 'navy business suit, soft window light, friendly confident smile',
    defaultPrompt:
      'Transform this person into a professional corporate headshot: tasteful business attire, clean neutral studio background, soft professional lighting, confident friendly expression, sharp focus, photorealistic.',
    atlasCost: '$0.036',
  },
  {
    id: 'product-photo',
    title: 'AI Product Photo',
    description: 'Drop any product into a clean premium studio scene.',
    emoji: '📦',
    output: 'image',
    endpoint: 'generateImage',
    model: 'bytedance/seedream-v4.5/edit',
    imageField: 'images',
    cost: 8,
    promptPlaceholder: 'on a marble podium, soft studio shadows, minimal beige backdrop',
    defaultPrompt:
      'Place this product in a clean professional e-commerce studio scene: soft realistic shadows, premium minimal backdrop, even commercial lighting, crisp focus, hero product shot.',
    atlasCost: '$0.036',
  },
  {
    id: 'virtual-staging',
    title: 'AI Virtual Staging',
    description: 'Furnish an empty room for a real-estate listing.',
    emoji: '🛋️',
    output: 'image',
    endpoint: 'generateImage',
    model: 'bytedance/seedream-v4.5/edit',
    imageField: 'images',
    cost: 8,
    promptPlaceholder: 'modern Scandinavian living room, warm and inviting',
    defaultPrompt:
      'Furnish this empty room with tasteful modern furniture and decor: warm inviting staging, realistic interior design, natural lighting, photorealistic, real-estate listing quality. Keep the room architecture and windows unchanged.',
    atlasCost: '$0.036',
  },
  {
    id: 'wedding',
    title: 'AI Wedding Photoshoot',
    description: 'Turn a photo into a dreamy wedding shoot.',
    emoji: '💍',
    output: 'image',
    endpoint: 'generateImage',
    model: 'bytedance/seedream-v4.5/edit',
    imageField: 'images',
    cost: 8,
    promptPlaceholder: 'elegant white gown, golden-hour garden, cinematic bokeh',
    defaultPrompt:
      'Transform this into an elegant wedding photoshoot: formal wedding attire, romantic scenic background, soft cinematic golden-hour lighting, professional photography, photorealistic, keep the faces faithful.',
    atlasCost: '$0.036',
  },
  {
    id: 'photo-to-life',
    title: 'Photo to Life (animate)',
    description: 'Bring any photo to life as a short video.',
    emoji: '🪄',
    output: 'video',
    endpoint: 'generateVideo',
    model: 'bytedance/seedance-v1-pro-fast/image-to-video',
    imageField: 'image',
    cost: 5,
    promptPlaceholder: 'gentle smile, hair moving in the breeze, slow cinematic push-in',
    defaultPrompt:
      'The subject comes to life with subtle natural motion: gentle smile, soft head movement, hair and clothing moving slightly, slow cinematic camera push-in, stable and realistic.',
    atlasCost: '$0.009',
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
