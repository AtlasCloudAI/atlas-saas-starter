import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  MEDIA_TOOL_COSTS,
  TALKING_PHOTO_MODEL,
  VIDEO_EDIT_MODEL,
  VIDEO_UPSCALE_MODEL,
  normalizeMediaToolKind,
  submitTalkingPhoto,
  submitVideoEdit,
  submitVideoUpscale,
} from '@/lib/media-tools';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = normalizeMediaToolKind(body.kind);
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1600) : '';
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';
  const audio = typeof body.audio === 'string' && body.audio.startsWith('data:audio/') ? body.audio : '';
  const video = typeof body.video === 'string' && body.video.startsWith('data:video/') ? body.video : '';

  if (kind === 'talking-photo' && (!image || !audio)) return NextResponse.json({ error: 'image_audio_required' }, { status: 400 });
  if ((kind === 'video-edit' || kind === 'video-upscale') && !video) return NextResponse.json({ error: 'video_required' }, { status: 400 });
  if (kind === 'video-edit' && prompt.length < 8) return NextResponse.json({ error: 'prompt_too_short' }, { status: 400 });
  if ((image + audio + video).length > 30_000_000) return NextResponse.json({ error: 'media_too_large' }, { status: 400 });

  const cost = MEDIA_TOOL_COSTS[kind];
  try {
    await deductCredits(session.user.id, cost, 'generate', kind);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    if (kind === 'talking-photo') res = await submitTalkingPhoto({ image, audio, prompt });
    else if (kind === 'video-edit') res = await submitVideoEdit({ video, prompt });
    else res = await submitVideoUpscale(video);
  } catch (e) {
    await grantCredits(session.user.id, cost, 'refund', kind);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const model = kind === 'talking-photo' ? TALKING_PHOTO_MODEL : kind === 'video-edit' ? VIDEO_EDIT_MODEL : VIDEO_UPSCALE_MODEL;
  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: kind,
      model,
      prompt: prompt || kind,
      inputImage: image || null,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
