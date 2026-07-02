import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitUgcAudio, TTS_MODEL, SKU_COSTS, SKU_TEMPLATE_ID } from '@/lib/sku-suite';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const script = typeof body.script === 'string' ? body.script.trim().slice(0, 2000) : '';
  if (script.length < 20) return NextResponse.json({ error: 'script_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, SKU_COSTS.ugcAudio, 'generate', SKU_TEMPLATE_ID + ':ugc-audio');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitUgcAudio(script);
  } catch (e) {
    await grantCredits(session.user.id, SKU_COSTS.ugcAudio, 'refund', SKU_TEMPLATE_ID + ':ugc-audio');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: SKU_TEMPLATE_ID + ':ugc-audio',
      model: TTS_MODEL,
      prompt: script,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: SKU_COSTS.ugcAudio,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing' });
}
