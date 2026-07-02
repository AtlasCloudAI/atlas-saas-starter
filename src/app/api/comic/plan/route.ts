import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import { planComic, COMIC_COSTS, COMIC_TEMPLATE_ID } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const story = typeof body.story === 'string' ? body.story.trim().slice(0, 4000) : '';
  const style = typeof body.style === 'string' ? body.style.slice(0, 20) : 'anime';
  const language =
    typeof body.language === 'string' && body.language.trim() ? body.language.trim().slice(0, 40) : '中文';
  const panelCount = Math.max(4, Math.min(12, Number(body.panelCount) || 8));

  if (story.length < 10) return NextResponse.json({ error: 'story_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, COMIC_COSTS.plan, 'generate', COMIC_TEMPLATE_ID + ':plan');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await planComic({ story, style, language, panelCount });
    return NextResponse.json({ plan });
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.plan, 'refund', COMIC_TEMPLATE_ID + ':plan');
    return NextResponse.json({ error: 'plan_failed', detail: String(e) }, { status: 502 });
  }
}
