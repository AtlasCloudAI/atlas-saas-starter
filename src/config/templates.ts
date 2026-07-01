/**
 * Launch scenarios. Each binds a REAL Atlas model (verified 2026-07-01) to a
 * creative preset. All take ONE uploaded image.
 *
 * IDENTITY PRESERVATION (verified): generic edit models + weak prompts REPLACE
 * the face on big edits (selfie -> studio headshot). Fix = nano-banana-pro
 * (Gemini, strongest consistency) + a STRONG "keep the exact same face" prompt.
 * So all people/subject apps use nano-banana-pro/edit-developer. Product/room
 * apps (identity less sensitive) stay on cheaper seedream/qwen.
 *
 *   image-edit  -> generateImage, input under `images`
 *   i2v         -> generateVideo, input under `image` (singular)
 *
 * `cost` is in in-app credits (config/pricing.ts). Atlas real cost noted per app.
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

// people / subject-preserving edits — needs the strongest identity model
const KEEP = {
  output: 'image' as const,
  endpoint: 'generateImage' as const,
  model: 'google/nano-banana-pro/edit-developer',
  imageField: 'images' as const,
  cost: 10,
  atlasCost: '$0.07',
};
// the shared "do not change the person" clause, verified to preserve identity
const LOCK =
  'Keep the EXACT same person and face — identical facial features, eyes, nose, mouth, face shape, jawline, skin tone and hair. Do NOT turn them into a different person.';

export const TEMPLATES: Template[] = [
  {
    ...KEEP,
    id: 'headshot',
    title: 'AI Professional Headshot',
    description: 'Selfie → studio-grade corporate headshot.',
    emoji: '👔',
    extra: { aspect_ratio: '1:1' },
    promptPlaceholder: 'navy suit, grey studio backdrop, confident smile',
    defaultPrompt: `${LOCK} Only change their clothing to a tailored business suit and the background to a clean professional studio backdrop with soft lighting. Front-facing corporate headshot of the same person, photorealistic.`,
  },
  {
    ...KEEP,
    id: 'wedding',
    title: 'AI Wedding Photoshoot',
    description: 'A photo → a dreamy wedding shoot.',
    emoji: '💍',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'white gown, golden-hour garden, cinematic',
    defaultPrompt: `${LOCK} Only change their outfit to elegant formal wedding attire and place them in a romantic scenic background (garden / beach / cathedral) with soft golden-hour lighting. Professional wedding photograph of the same person, photorealistic.`,
  },
  {
    ...KEEP,
    id: 'hairstyle',
    title: 'AI Hairstyle Try-On',
    description: 'See yourself with a new hairstyle.',
    emoji: '💇',
    promptPlaceholder: 'long wavy bob, warm brown',
    defaultPrompt: `${LOCK} Only change the HAIRSTYLE to a stylish modern cut (natural realistic hair, believable hairline and volume). Keep the clothing and background the same. Photorealistic.`,
  },
  {
    ...KEEP,
    id: 'tattoo',
    title: 'AI Tattoo Try-On',
    description: 'Preview a tattoo on your skin.',
    emoji: '🖋️',
    promptPlaceholder: 'fine-line dragon on the forearm',
    defaultPrompt: `${LOCK} Only ADD a realistic tattoo on the forearm with natural skin integration and believable shading. Change nothing else. Photorealistic.`,
  },
  {
    ...KEEP,
    id: 'makeup',
    title: 'AI Makeup Try-On',
    description: 'Try a professional makeup look.',
    emoji: '💄',
    promptPlaceholder: 'soft glam, warm tones',
    defaultPrompt: `${LOCK} Only APPLY tasteful professional soft-glam makeup (natural flawless skin, enhanced features). Keep the same hairstyle, clothing and background. Photorealistic.`,
  },
  {
    ...KEEP,
    id: 'photo-restore',
    title: 'AI Photo Restore',
    description: 'Old/damaged photo → restored & colorized.',
    emoji: '🖼️',
    promptPlaceholder: 'repair scratches, natural colors',
    defaultPrompt: `Restore this old photo: repair scratches, tears and damage, naturally colorize if black-and-white, recover fine detail and sharpness. ${LOCK} Keep the original pose, clothing and composition — only repair and enhance, do not add or remove people.`,
  },
  {
    ...KEEP,
    id: 'pet-portrait',
    title: 'AI Pet Portrait',
    description: 'Your pet → a regal Renaissance painting.',
    emoji: '🐾',
    promptPlaceholder: 'royal robe, golden crown, oil-painting',
    defaultPrompt:
      'Keep the EXACT same pet — identical breed, fur color, markings and face, clearly recognizable as the same animal. Turn it into a regal Renaissance oil-painting portrait: royal attire, ornate classical background, painterly brushwork.',
  },
  {
    id: 'product-photo',
    title: 'AI Product Photo',
    description: 'Any product → clean premium studio scene.',
    emoji: '📦',
    output: 'image',
    endpoint: 'generateImage',
    model: 'bytedance/seedream-v4.5/edit',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.036',
    promptPlaceholder: 'marble podium, soft studio shadows, beige backdrop',
    defaultPrompt:
      'Keep the EXACT same product — identical shape, color, label, text and design, do not alter the product itself. Only place it in a clean professional e-commerce studio scene: soft realistic shadows, premium minimal backdrop, even commercial lighting, hero product shot.',
  },
  {
    id: 'virtual-staging',
    title: 'AI Virtual Staging',
    description: 'Empty room → furnished real-estate listing.',
    emoji: '🛋️',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'modern Scandinavian living room, warm',
    defaultPrompt:
      'Keep the EXACT same room architecture — identical walls, windows, doors, floor and camera perspective, do not change the structure. Only ADD tasteful modern furniture and decor for warm inviting real-estate staging, realistic interior design, natural lighting, photorealistic.',
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
    atlasCost: '$0.009',
    promptPlaceholder: 'gentle smile, hair in the breeze, slow push-in',
    defaultPrompt:
      'The subject comes to life with subtle natural motion: gentle smile, soft head movement, hair and clothing moving slightly, slow cinematic camera push-in, stable and realistic.',
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
