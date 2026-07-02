import { submitRawGen, uploadMedia } from './atlas';

export const TALKING_PHOTO_MODEL = 'atlascloud/infinitetalk';
export const VIDEO_EDIT_MODEL = 'alibaba/wan-2.7/video-edit';
export const VIDEO_UPSCALE_MODEL = 'atlascloud/video-upscaler';

export const MEDIA_TOOL_COSTS = {
  'talking-photo': 12,
  'video-edit': 16,
  'video-upscale': 10,
} as const;

export type MediaToolKind = keyof typeof MEDIA_TOOL_COSTS;

export function normalizeMediaToolKind(value: unknown): MediaToolKind {
  if (value === 'video-edit' || value === 'video-upscale') return value;
  return 'talking-photo';
}

export async function submitTalkingPhoto({ image, audio, prompt }: { image: string; audio: string; prompt: string }) {
  const [imageUrl, audioUrl] = await Promise.all([uploadMedia(image, 'talking-photo-image'), uploadMedia(audio, 'talking-photo-audio')]);
  return submitRawGen('generateVideo', {
    model: TALKING_PHOTO_MODEL,
    image: imageUrl,
    audio: audioUrl,
    prompt,
    resolution: '720p',
  });
}

export async function submitVideoEdit({ video, prompt }: { video: string; prompt: string }) {
  const videoUrl = await uploadMedia(video, 'video-edit-input');
  return submitRawGen('generateVideo', {
    model: VIDEO_EDIT_MODEL,
    prompt,
    video: videoUrl,
    resolution: '720P',
    duration: 5,
    prompt_extend: true,
    watermark: false,
  });
}

export async function submitVideoUpscale(video: string) {
  const videoUrl = await uploadMedia(video, 'video-upscale-input');
  return submitRawGen('generateVideo', {
    model: VIDEO_UPSCALE_MODEL,
    video: videoUrl,
    target_resolution: '1080p',
  });
}
