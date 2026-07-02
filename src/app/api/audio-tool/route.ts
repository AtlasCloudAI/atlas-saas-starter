import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  AUDIOBOOK_MODEL,
  AUDIO_TOOL_COST,
  SOUNDSCAPE_MODEL,
  cleanAudioText,
  normalizeAudioKind,
  submitAudiobook,
  submitSoundscape,
} from '@/lib/audio-tools';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = normalizeAudioKind(body.kind);
  const text = cleanAudioText(body.text);
  const languageCode = typeof body.languageCode === 'string' ? body.languageCode.slice(0, 12) : 'zh';
  if (text.length < 12) return NextResponse.json({ error: 'text_too_short' }, { status: 400 });

  try {
    await deductCredits(session.user.id, AUDIO_TOOL_COST, 'generate', kind);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = kind === 'audiobook' ? await submitAudiobook(text, languageCode) : await submitSoundscape(text);
  } catch (e) {
    await grantCredits(session.user.id, AUDIO_TOOL_COST, 'refund', kind);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: kind,
      model: kind === 'audiobook' ? AUDIOBOOK_MODEL : SOUNDSCAPE_MODEL,
      prompt: text,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: AUDIO_TOOL_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
