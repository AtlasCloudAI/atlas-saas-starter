import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { TEXT_IMAGE_COST, TEXT_IMAGE_MODEL, normalizeImageSize, normalizeTextImageKind, submitTextImage } from '@/lib/text-image';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1800) : '';
  const size = normalizeImageSize(body.size);
  const kind = normalizeTextImageKind(body.kind);
  if (prompt.length < 12) return NextResponse.json({ error: 'prompt_too_short' }, { status: 400 });

  try {
    await deductCredits(session.user.id, TEXT_IMAGE_COST, 'generate', kind);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitTextImage({ prompt, size });
  } catch (e) {
    await grantCredits(session.user.id, TEXT_IMAGE_COST, 'refund', kind);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: kind,
      model: TEXT_IMAGE_MODEL,
      prompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: TEXT_IMAGE_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
