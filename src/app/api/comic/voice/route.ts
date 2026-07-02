import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitVoice, VOICE_MODEL, COMIC_COSTS, COMIC_TEMPLATE_ID } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 1000) : '';
  const voiceKey = typeof body.voiceKey === 'string' ? body.voiceKey.slice(0, 20) : 'narrator';
  if (text.length < 1) return NextResponse.json({ error: 'text_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, COMIC_COSTS.voice, 'generate', COMIC_TEMPLATE_ID + ':voice');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitVoice(text, voiceKey);
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.voice, 'refund', COMIC_TEMPLATE_ID + ':voice');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COMIC_TEMPLATE_ID + ':voice',
      model: VOICE_MODEL,
      prompt: text,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COMIC_COSTS.voice,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing' });
}
