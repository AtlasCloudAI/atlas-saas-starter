import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitSlide, SLIDE_MODEL, COURSE_COSTS, COURSE_TEMPLATE_ID } from '@/lib/course';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1200) : '';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio.slice(0, 10) : '16:9';
  if (prompt.length < 5) return NextResponse.json({ error: 'prompt_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, COURSE_COSTS.slide, 'generate', COURSE_TEMPLATE_ID + ':slide');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitSlide(prompt, aspectRatio);
  } catch (e) {
    await grantCredits(session.user.id, COURSE_COSTS.slide, 'refund', COURSE_TEMPLATE_ID + ':slide');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COURSE_TEMPLATE_ID + ':slide',
      model: SLIDE_MODEL,
      prompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COURSE_COSTS.slide,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing' });
}
