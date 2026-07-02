import { submitRawGen } from './atlas';

export const REFERENCE_VIDEO_MODEL = 'bytedance/seedance-2.0-fast/reference-to-video';
export const REFERENCE_VIDEO_COST = 14;

export function normalizeReferenceVideoKind(value: unknown) {
  const kind = typeof value === 'string' ? value : 'reference-video';
  return kind.replace(/[^a-z0-9-]/gi, '').slice(0, 48) || 'reference-video';
}

export async function submitReferenceVideo({
  prompt,
  images,
  ratio,
  duration,
  resolution,
}: {
  prompt: string;
  images: string[];
  ratio: string;
  duration: number;
  resolution: string;
}) {
  return submitRawGen('generateVideo', {
    model: REFERENCE_VIDEO_MODEL,
    prompt,
    reference_images: images,
    duration,
    resolution,
    ratio,
    generate_audio: true,
    bitrate_mode: 'standard',
    watermark: false,
  });
}
