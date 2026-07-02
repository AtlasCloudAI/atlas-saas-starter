import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  REFERENCE_VIDEO_COST,
  REFERENCE_VIDEO_MODEL,
  normalizeReferenceVideoKind,
  submitReferenceVideo,
} from '@/lib/reference-video';

const RATIOS = new Set(['16:9', '4:3', '1:1', '3:4', '9:16', '21:9', 'adaptive']);
const RESOLUTIONS = new Set(['480p', '720p', '720p-SR', '1080p-SR', '1440p-SR']);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 2500) : '';
  const images = Array.isArray(body.images)
    ? body.images.filter((x: unknown) => typeof x === 'string' && x.startsWith('data:image/')).slice(0, 9)
    : [];
  const ratio = RATIOS.has(body.ratio) ? body.ratio : '9:16';
  const resolution = RESOLUTIONS.has(body.resolution) ? body.resolution : '720p';
  const rawDuration = Number(body.duration);
  const duration = Number.isFinite(rawDuration) && rawDuration >= 4 && rawDuration <= 15 ? Math.round(rawDuration) : 5;
  const kind = normalizeReferenceVideoKind(body.kind);

  if (prompt.length < 12) return NextResponse.json({ error: 'prompt_too_short' }, { status: 400 });
  if (images.length === 0) return NextResponse.json({ error: 'image_required' }, { status: 400 });
  if (images.join('').length > 10_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  try {
    await deductCredits(session.user.id, REFERENCE_VIDEO_COST, 'generate', kind);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitReferenceVideo({ prompt, images, ratio, duration, resolution });
  } catch (e) {
    await grantCredits(session.user.id, REFERENCE_VIDEO_COST, 'refund', kind);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: kind,
      model: REFERENCE_VIDEO_MODEL,
      prompt: `${prompt}\n\nVideo settings: ${duration}s, ${ratio}, ${resolution}, native audio on`,
      inputImage: images[0],
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: REFERENCE_VIDEO_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
