import { submitRawGen } from './atlas';

export const TEXT_IMAGE_MODEL = 'openai/gpt-image-2-developer/text-to-image';
export const TEXT_IMAGE_COST = 4;

export function normalizeTextImageKind(value: unknown) {
  const kind = typeof value === 'string' ? value : 'text-image';
  return kind.replace(/[^a-z0-9-]/gi, '').slice(0, 48) || 'text-image';
}

export function normalizeImageSize(value: unknown) {
  const allowed = new Set(['1024x1024', '1024x768', '768x1024', '1536x1024', '1024x1536', '2048x1152', '1152x2048']);
  return typeof value === 'string' && allowed.has(value) ? value : '1024x1024';
}

export async function submitTextImage({ prompt, size }: { prompt: string; size: string }) {
  return submitRawGen('generateImage', {
    model: TEXT_IMAGE_MODEL,
    prompt,
    size,
    quality: 'medium',
    output_format: 'jpeg',
    moderation: 'low',
  });
}
