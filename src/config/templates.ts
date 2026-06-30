/**
 * Video templates for the studio. Each template binds a REAL Atlas Cloud
 * video model id to a creative preset. Swap models / add templates freely —
 * browse the full catalog at https://api.atlascloud.ai/api/v1/models
 *
 * `cost` is in your in-app credits (see config/pricing.ts). Atlas's actual
 * per-generation cost is a few cents, so every template is high-margin.
 */
export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** t2v = text only; i2v = needs an input image (used as first frame) */
  kind: 't2v' | 'i2v';
  /** real Atlas model id passed straight to generateVideo */
  model: string;
  /** credits charged per generation */
  cost: number;
  promptPlaceholder: string;
  defaultPrompt: string;
  /** extra model params merged into the API payload */
  extra?: Record<string, unknown>;
  /** preview clip (Atlas CDN) if available */
  sampleVideo?: string;
}

const V = { duration: 5, resolution: '720p', seed: -1 };

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  // ── text-to-video ──
  {
    id: 'anime-mv',
    title: 'Anime Music Video',
    description: 'Turn a one-line idea into a vivid anime clip.',
    emoji: '🎬',
    kind: 't2v',
    model: 'bytedance/seedance-v1-pro-fast/text-to-video',
    cost: 5,
    promptPlaceholder: 'A girl with silver hair running through neon Tokyo at night, rain, cinematic',
    defaultPrompt:
      'A girl with silver hair running through neon-lit Tokyo streets at night, light rain, reflections, dynamic camera, anime style, cinematic',
    extra: { ...V },
    sampleVideo: 'https://static.atlascloud.ai/uploads/models/3d151d2c-7325-446f-a394-a2befa620542.mp4',
  },
  {
    id: 'cinematic-trailer',
    title: 'Cinematic Trailer',
    description: 'Hollywood-grade establishing shots from a prompt.',
    emoji: '🍿',
    kind: 't2v',
    model: 'bytedance/seedance-v1.5-pro/text-to-video-fast',
    cost: 8,
    promptPlaceholder: 'Aerial shot over a futuristic desert city at golden hour, sandstorm approaching',
    defaultPrompt:
      'Sweeping aerial shot over a futuristic desert city at golden hour, a sandstorm approaching on the horizon, epic scale, volumetric light, cinematic color grade',
    extra: { ...V },
  },
  {
    id: 'product-spotlight',
    title: 'Product Spotlight',
    description: 'Slick rotating hero shot for any product.',
    emoji: '✨',
    kind: 't2v',
    model: 'pixverse/v6/text-to-video',
    cost: 10,
    promptPlaceholder: 'A sleek matte-black smartwatch rotating on a glossy podium, studio lighting',
    defaultPrompt:
      'A sleek matte-black smartwatch slowly rotating on a glossy reflective podium, soft studio lighting, shallow depth of field, premium commercial look',
    extra: { duration: 5, resolution: '720p' },
  },

  // ── image-to-video ──
  {
    id: 'photo-to-life',
    title: 'Photo to Life',
    description: 'Animate any photo into a living moment.',
    emoji: '🪄',
    kind: 'i2v',
    model: 'bytedance/seedance-v1-pro-fast/image-to-video',
    cost: 5,
    promptPlaceholder: 'gentle natural motion, hair and clothes moving in the breeze',
    defaultPrompt:
      'Use the provided image as the first frame: subtle natural motion, hair and clothing moving gently in the breeze, soft ambient light shifting, eyes blinking naturally, stable cinematic shot',
    extra: { ...V, camera_fixed: false },
    sampleVideo: 'https://static.atlascloud.ai/uploads/models/8ec476e6-a083-4ec0-b97f-fab5ab84f157.mp4',
  },
  {
    id: 'product-360',
    title: 'Product 360 Spin',
    description: 'Spin a product photo into a 360° showcase.',
    emoji: '🔄',
    kind: 'i2v',
    model: 'alibaba/wan-2.6/image-to-video-flash',
    cost: 8,
    promptPlaceholder: 'the product rotates smoothly 360 degrees on a turntable',
    defaultPrompt:
      'Use the provided image as the first frame: the product rotates smoothly a full 360 degrees on a turntable, clean studio background, consistent lighting, premium commercial presentation',
    extra: { ...V },
  },
  {
    id: 'living-portrait',
    title: 'Living Portrait',
    description: 'Bring a portrait to life with subtle expression.',
    emoji: '🖼️',
    kind: 'i2v',
    model: 'bytedance/seedance-v1.5-pro/image-to-video-fast',
    cost: 8,
    promptPlaceholder: 'soft smile, a slow head turn toward the camera',
    defaultPrompt:
      'Use the provided image as the first frame: the person gives a soft natural smile and slowly turns their head toward the camera, gentle eye movement, realistic and stable, cinematic portrait lighting',
    extra: { ...V, camera_fixed: true },
  },
  {
    id: 'squish-it',
    title: 'Squish It',
    description: 'The viral squish effect on any subject.',
    emoji: '🫧',
    kind: 'i2v',
    model: 'atlascloud/wan-2.2-turbo/image-to-video',
    cost: 8,
    promptPlaceholder: 'the subject gets playfully squished and bounces back, fun and bouncy',
    defaultPrompt:
      'Use the provided image as the first frame: the subject is playfully squished and stretched like soft jelly, then bounces back to normal, fun bouncy motion, smooth and satisfying',
    extra: { ...V },
  },
  {
    id: 'dynamic-pan',
    title: 'Dynamic Pan',
    description: 'Add a dramatic cinematic camera move to a still.',
    emoji: '🎥',
    kind: 'i2v',
    model: 'pixverse/v6/image-to-video',
    cost: 10,
    promptPlaceholder: 'slow dramatic dolly-in with parallax, cinematic atmosphere',
    defaultPrompt:
      'Use the provided image as the first frame: a slow dramatic dolly-in with subtle parallax, atmospheric particles drifting, cinematic depth and mood',
    extra: { duration: 5, resolution: '720p' },
  },
];

export const getTemplate = (id: string) => VIDEO_TEMPLATES.find((t) => t.id === id);
