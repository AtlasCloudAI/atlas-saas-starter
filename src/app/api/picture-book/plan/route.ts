import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  PICTURE_BOOK_PLAN_COST,
  PICTURE_BOOK_PLAN_TEMPLATE_ID,
  buildFallbackPictureBookPlan,
  cleanPictureBookField,
  draftPictureBookPlan,
  normalizePictureBookPageCount,
} from '@/lib/picture-book';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const input = {
    childName: cleanPictureBookField(body.childName, '小星', 40),
    age: cleanPictureBookField(body.age, '5-7 岁', 40),
    storySeed: cleanPictureBookField(body.storySeed, '一个孩子帮助一颗发光的小种子找到家的温暖故事', 600),
    lesson: cleanPictureBookField(body.lesson, '学会倾听、合作和分享', 220),
    style: cleanPictureBookField(body.style, 'soft watercolor, warm picture-book style', 180),
    pageCount: normalizePictureBookPageCount(body.pageCount),
    language: cleanPictureBookField(body.language, 'Chinese', 40),
    hasChildPhoto: Boolean(body.hasChildPhoto),
  };
  if (input.storySeed.length < 8) return NextResponse.json({ error: 'story_seed_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, PICTURE_BOOK_PLAN_COST, 'generate', PICTURE_BOOK_PLAN_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await draftPictureBookPlan(input);
    return NextResponse.json({ plan });
  } catch (e) {
    await grantCredits(session.user.id, PICTURE_BOOK_PLAN_COST, 'refund', PICTURE_BOOK_PLAN_TEMPLATE_ID);
    return NextResponse.json({
      plan: buildFallbackPictureBookPlan(input),
      fallback: true,
      warning: 'llm_unavailable_refunded',
      detail: String(e),
    });
  }
}
