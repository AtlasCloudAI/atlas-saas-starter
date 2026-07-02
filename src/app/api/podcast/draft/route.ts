import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { draftPodcastScript, normalizeLanguage, normalizeMode, normalizeTone } from '@/lib/podcast';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const source = typeof body.source === 'string' ? body.source.trim() : '';
  const images = Array.isArray(body.images)
    ? body.images.filter((x: unknown) => typeof x === 'string' && x.startsWith('data:image/')).slice(0, 6)
    : typeof body.image === 'string' && body.image.startsWith('data:image/')
      ? [body.image]
      : [];
  const videoContext = typeof body.videoContext === 'string' ? body.videoContext.trim().slice(0, 4000) : '';
  const language = normalizeLanguage(body.language);
  const tone = normalizeTone(body.tone);
  const mode = normalizeMode(body.mode);

  if (source.length < 30 && images.length === 0 && !videoContext)
    return NextResponse.json({ error: 'source_too_short' }, { status: 400 });
  if (source.length > 12000) return NextResponse.json({ error: 'source_too_long' }, { status: 400 });
  if (videoContext.length > 4000) return NextResponse.json({ error: 'video_context_too_long' }, { status: 400 });
  if (images.join('').length > 7_500_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  try {
    const script = await draftPodcastScript({ source, images, videoContext, language, tone, mode });
    return NextResponse.json({ script });
  } catch (e) {
    return NextResponse.json({ error: 'draft_failed', detail: String(e) }, { status: 502 });
  }
}
