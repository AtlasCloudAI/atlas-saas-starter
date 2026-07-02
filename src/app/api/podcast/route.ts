import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  AUDIO_MODEL,
  PODCAST_COST,
  PODCAST_TEMPLATE_ID,
  cleanPodcastScript,
  draftPodcastScript,
  normalizeLanguage,
  normalizeMode,
  normalizeTone,
  submitPodcastAudio,
} from '@/lib/podcast';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const source = typeof body.source === 'string' ? body.source.trim() : '';
  const confirmedScript = typeof body.script === 'string' ? cleanPodcastScript(body.script) : '';
  const images = Array.isArray(body.images)
    ? body.images.filter((x: unknown) => typeof x === 'string' && x.startsWith('data:image/')).slice(0, 6)
    : typeof body.image === 'string' && body.image.startsWith('data:image/')
      ? [body.image]
      : [];
  const videoContext = typeof body.videoContext === 'string' ? body.videoContext.trim().slice(0, 4000) : '';
  const language = normalizeLanguage(body.language);
  const tone = normalizeTone(body.tone);
  const mode = normalizeMode(body.mode);

  if (!confirmedScript && source.length < 30 && images.length === 0 && !videoContext)
    return NextResponse.json({ error: 'source_too_short' }, { status: 400 });
  if (source.length > 12000) return NextResponse.json({ error: 'source_too_long' }, { status: 400 });
  if (videoContext.length > 4000) return NextResponse.json({ error: 'video_context_too_long' }, { status: 400 });
  if (images.join('').length > 7_500_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });
  if (confirmedScript && confirmedScript.length < 80)
    return NextResponse.json({ error: 'script_too_short' }, { status: 400 });

  try {
    await deductCredits(session.user.id, PODCAST_COST, 'generate', PODCAST_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let script: string;
  let res;

  try {
    script = confirmedScript || (await draftPodcastScript({ source, images, videoContext, language, tone, mode }));
    res = await submitPodcastAudio(script);
  } catch (e) {
    await grantCredits(session.user.id, PODCAST_COST, 'refund', PODCAST_TEMPLATE_ID);
    return NextResponse.json({ error: 'podcast_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: PODCAST_TEMPLATE_ID,
      model: AUDIO_MODEL,
      prompt: script,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: PODCAST_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing', script });
}
