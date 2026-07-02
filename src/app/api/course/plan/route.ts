import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import { planCourse, COURSE_COSTS, COURSE_TEMPLATE_ID } from '@/lib/course';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 300) : '';
  const material = typeof body.material === 'string' ? body.material.trim().slice(0, 8000) : '';
  const language = typeof body.language === 'string' && body.language.trim() ? body.language.trim().slice(0, 40) : '中文';
  const lessons = Math.max(2, Math.min(6, Number(body.lessons) || 3));

  if (topic.length < 2 && material.length < 20)
    return NextResponse.json({ error: 'topic_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, COURSE_COSTS.plan, 'generate', COURSE_TEMPLATE_ID + ':plan');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await planCourse({ topic, material, language, lessons });
    if (!plan.lessons.length) throw new Error('empty plan');
    return NextResponse.json({ plan });
  } catch (e) {
    await grantCredits(session.user.id, COURSE_COSTS.plan, 'refund', COURSE_TEMPLATE_ID + ':plan');
    return NextResponse.json({ error: 'plan_failed', detail: String(e) }, { status: 502 });
  }
}
