import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  VIDEO_LOCALIZE_COST,
  cleanVideoText,
  localizeVideoTranscript,
  normalizeTargetLanguage,
  toSrt,
} from '@/lib/video-localize';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const transcript = cleanVideoText(body.transcript);
  const targetLanguage = normalizeTargetLanguage(body.targetLanguage);
  const audience = cleanVideoText(body.audience, 800) || 'short-form social media viewers';
  const tone = cleanVideoText(body.tone, 400) || 'natural, concise, creator-friendly';
  const notes = cleanVideoText(body.notes, 1200);
  if (transcript.length < 12) return NextResponse.json({ error: 'transcript_too_short' }, { status: 400 });

  try {
    await deductCredits(session.user.id, VIDEO_LOCALIZE_COST, 'generate', 'video-localize');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const result = await localizeVideoTranscript({ transcript, targetLanguage, audience, tone, notes });
    return NextResponse.json({ ...result, srt: toSrt(result.segments), cost: VIDEO_LOCALIZE_COST });
  } catch (e) {
    await grantCredits(session.user.id, VIDEO_LOCALIZE_COST, 'refund', 'video-localize');
    return NextResponse.json({ error: 'localize_failed', detail: String(e) }, { status: 502 });
  }
}
