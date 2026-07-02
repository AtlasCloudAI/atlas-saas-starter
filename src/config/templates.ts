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
  maxImages?: number;
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
  model: 'google/nano-banana-2-lite/edit-developer',
  imageField: 'images' as const,
  cost: 10,
  atlasCost: '$0.028',
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
    id: 'id-photo',
    title: 'AI ID Photo',
    description: 'Selfie -> compliant passport-style ID photo.',
    emoji: '🪪',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'white background, passport photo, neutral expression',
    defaultPrompt: `${LOCK} Create a passport-style ID photo of the same person: plain pure white background, front-facing head and shoulders, neutral expression, even lighting, no accessories, realistic skin texture, official document photo style. Do not change identity.`,
  },
  {
    ...KEEP,
    id: 'dating-photo',
    title: 'AI Dating Profile Photo',
    description: 'Selfie -> realistic high-trust dating profile photo.',
    emoji: '💘',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'candid cafe portrait, natural smile, realistic skin texture',
    defaultPrompt: `${LOCK} Transform into an authentic dating profile photo: candid outdoor cafe setting, natural smile, realistic skin texture with pores, flattering but not over-retouched, believable lifestyle photography. Keep identity exact.`,
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
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'marble podium, soft studio shadows, beige backdrop',
    defaultPrompt:
      'Keep the EXACT same product — identical shape, color, label, text and design, do not alter the product itself. Only place it in a clean professional e-commerce studio scene: soft realistic shadows, premium minimal backdrop, even commercial lighting, hero product shot.',
  },
  {
    id: 'amazon-listing',
    title: 'AI Amazon Listing Image',
    description: 'Product photo -> marketplace-compliant main image.',
    emoji: '🛒',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'pure white background, product fills 85%, no text',
    defaultPrompt:
      'Keep the EXACT same product, label, text, shape, material and color. Create an Amazon-compliant main listing image: pure white background #FFFFFF, product centered and filling about 85% of the frame, sharp edges, realistic shadow, no extra text, no watermark, no props.',
  },
  {
    id: 'food-photo',
    title: 'AI Food Photo',
    description: 'Phone food photo -> professional menu image.',
    emoji: '🍜',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'professional menu photo, steam, appetizing colors',
    defaultPrompt:
      'Keep the EXACT same dish, plating, ingredients and portion size. Enhance into professional food photography for a menu: appetizing color, soft studio light, subtle steam, shallow depth of field, clean table styling, realistic and not misleading.',
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
    id: 'virtual-try-on',
    title: 'AI Virtual Try-On',
    description: 'Person + clothing image → try-on result.',
    emoji: '👗',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    maxImages: 2,
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'put the clothing from image 2 onto the person in image 1',
    defaultPrompt:
      'Use image 1 as the person and image 2 as the garment. Put the exact garment from image 2 onto the person in image 1. Keep the same person, pose, face, body shape and background. Preserve the clothing design, color, pattern and texture. Photorealistic fashion try-on.',
  },
  {
    id: 'jewelry-try-on',
    title: 'AI Jewelry Try-On',
    description: 'Person/hand + jewelry image -> realistic try-on.',
    emoji: '💎',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    maxImages: 2,
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'place the ring/necklace from image 2 on image 1',
    defaultPrompt:
      'Use image 1 as the person/hand/neck/ear reference and image 2 as the jewelry. Place the exact jewelry from image 2 onto the correct body position in image 1. Preserve metal color, gemstone color, shape, scale, reflections and design. Keep the person/hand unchanged. Photorealistic jewelry try-on.',
  },
  {
    id: 'future-baby',
    title: 'AI Future Baby',
    description: 'Two parent photos -> future baby portrait.',
    emoji: '👶',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    maxImages: 2,
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'newborn baby, naturally blends features of both parents',
    defaultPrompt:
      'Use image 1 and image 2 as the two parents. Generate a photorealistic future baby portrait that naturally blends facial features from both parents. Warm studio lighting, soft blanket, cute natural expression. Do not copy either adult face directly; create a believable baby.',
  },
  {
    id: 'couple-photo',
    title: 'AI Couple Photo',
    description: 'Two separate photos -> one realistic couple photo.',
    emoji: '💑',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    maxImages: 2,
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'romantic city date photo, holding hands',
    defaultPrompt:
      'Use image 1 and image 2 as two separate people. Create one realistic couple photo with both people together, preserving each person’s identity, face, hairstyle and body type. Romantic city date setting, natural pose, holding hands, realistic lighting, not artificial.',
  },
  {
    id: 'home-renovation',
    title: 'AI Home Renovation',
    description: 'Room photo -> renovated before/after concept.',
    emoji: '🏠',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'modern warm renovation, new kitchen cabinets, wood floor',
    defaultPrompt:
      'Keep the EXACT same room layout, walls, windows, doors and camera perspective. Renovate the interior into a modern warm design with updated materials, lighting, cabinetry/furniture and decor. Preserve room structure, realistic contractor visualization, photorealistic.',
  },
  {
    ...KEEP,
    id: 'fitness-transform',
    title: 'AI Fitness Transformation',
    description: 'Body photo -> realistic goal physique visualization.',
    emoji: '💪',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: '12-week lean athletic transformation, gym lighting',
    defaultPrompt: `${LOCK} Create a realistic fitness goal visualization of the same person after consistent training: leaner athletic physique, healthy posture, gym or studio lighting, realistic skin texture, no extreme body distortion. Keep identity exact and make the transformation believable.`,
  },
  {
    id: 'pet-farewell',
    title: 'AI Pet Farewell Portrait',
    description: 'Pet photo -> rainbow bridge memorial portrait.',
    emoji: '🌈',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'rainbow bridge memorial portrait, warm light',
    defaultPrompt:
      'Keep the EXACT same pet — identical breed, fur markings, color and face. Create a tasteful rainbow bridge memorial portrait: warm golden light, soft clouds, gentle peaceful atmosphere, subtle rainbow glow, comforting but not kitschy, high-quality framed portrait style.',
  },
  {
    id: 'pet-human',
    title: 'AI Pet Human',
    description: 'Pet photo -> humanized character portrait.',
    emoji: '🐶',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'turn this pet into a stylish human character',
    defaultPrompt:
      'Turn the uploaded pet into a stylish human character portrait while preserving the pet’s recognizable personality, fur colors, markings and facial expression as design cues. Photorealistic editorial portrait, tasteful outfit, warm studio lighting, no cartoon distortion.',
  },
  {
    ...KEEP,
    id: 'yearbook',
    title: 'AI Yearbook',
    description: 'Selfie → retro yearbook portrait set.',
    emoji: '📸',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: '1990s yearbook, denim jacket, flash photo',
    defaultPrompt: `${LOCK} Transform the photo into a nostalgic 1990s yearbook portrait: classic school portrait lighting, clean backdrop, retro outfit, soft film texture, photorealistic. Keep identity exact.`,
  },
  {
    ...KEEP,
    id: 'past-life',
    title: 'Past Life Portrait',
    description: 'Selfie → cinematic past-life portrait.',
    emoji: '🔮',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'ancient scholar, moonlit palace, cinematic',
    defaultPrompt: `${LOCK} Reimagine the same person as a cinematic past-life portrait. Keep the exact face and identity, change only clothing, setting and era. Rich historical costume, dramatic lighting, photorealistic editorial portrait.`,
  },
  {
    ...KEEP,
    id: 'anime-transform',
    title: 'AI Anime Transform',
    description: 'Selfie -> anime / Ghibli-inspired portrait.',
    emoji: '🌿',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'warm hand-painted anime portrait, countryside background',
    defaultPrompt: `${LOCK} Transform the same person into a warm hand-painted anime-inspired portrait: soft natural colors, expressive eyes, cozy countryside background, gentle cinematic light, high-quality illustration. Keep identity recognizable and do not copy any specific copyrighted character.`,
  },
  {
    id: 'sticker-meme',
    title: 'AI Sticker Meme Pack',
    description: 'Selfie or pet photo -> expressive sticker/meme image.',
    emoji: '💬',
    output: 'image',
    endpoint: 'generateImage',
    model: 'alibaba/qwen-image/edit-plus-20251215',
    imageField: 'images',
    cost: 8,
    atlasCost: '$0.021',
    promptPlaceholder: 'crying laughing sticker, bold outline, transparent-style background',
    defaultPrompt:
      'Turn the uploaded person or pet into an expressive social sticker/meme image. Preserve the recognizable face, identity or fur markings. Use a clean cutout sticker style, bold outline, exaggerated but tasteful expression, simple transparent-looking background, no watermark.',
  },
  {
    ...KEEP,
    id: 'art-portrait',
    title: 'AI Museum Portrait',
    description: 'Selfie -> famous-painting-inspired portrait.',
    emoji: '🎨',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'Renaissance oil painting, pearl earring, museum portrait',
    defaultPrompt: `${LOCK} Restyle the same person as a museum-quality classical portrait: Renaissance oil painting texture, elegant period costume, dramatic painterly light, tasteful composition. Keep the exact identity and facial structure.`,
  },
  {
    ...KEEP,
    id: 'looksmax',
    title: 'AI Looksmax Scan',
    description: 'Selfie -> realistic glow-up visualization.',
    emoji: '📈',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'natural glow-up, better grooming, sharper lighting',
    defaultPrompt: `${LOCK} Create a realistic glow-up visualization of the same person: better grooming, cleaner skin, healthier posture, flattering natural lighting, improved styling, no plastic surgery look, no identity change. Keep it believable and photorealistic.`,
  },
  {
    ...KEEP,
    id: 'time-machine',
    title: 'AI Time Machine',
    description: 'Selfie -> older/younger timeline portrait.',
    emoji: '⏳',
    extra: { aspect_ratio: '3:4' },
    promptPlaceholder: 'age this person to 70, realistic wrinkles, same identity',
    defaultPrompt: `${LOCK} Create a realistic time-machine portrait of the same person. Change only age and styling: show a believable older or younger version with accurate skin, hair and facial aging details. Preserve the same bone structure and identity, photorealistic.`,
  },
  {
    id: 'photo-to-life',
    title: 'Photo to Life (animate)',
    description: 'Any photo → a short animated video.',
    emoji: '🪄',
    output: 'video',
    endpoint: 'generateVideo',
    model: 'bytedance/seedance-2.0-mini/image-to-video',
    imageField: 'image',
    cost: 5,
    atlasCost: '$0.045',
    extra: { duration: 5, resolution: '720p', ratio: 'adaptive', generate_audio: true },
    promptPlaceholder: 'gentle smile, hair in the breeze, slow push-in',
    defaultPrompt:
      'The subject comes to life with subtle natural motion: gentle smile, soft head movement, hair and clothing moving slightly, slow cinematic camera push-in, stable and realistic.',
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
