import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import { FORTUNE_COST, cleanFortuneText, generateFortuneReport } from '@/lib/fortune';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const mode = cleanFortuneText(body.mode, '综合命运报告');
  const name = cleanFortuneText(body.name);
  const birth = cleanFortuneText(body.birth);
  const question = cleanFortuneText(body.question, '最近 30 天我应该注意什么？');
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : undefined;
  if (!birth && !question && !image) return NextResponse.json({ error: 'input_required' }, { status: 400 });
  if ((image || '').length > 5_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  try {
    await deductCredits(session.user.id, FORTUNE_COST, 'generate', 'fortune');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const report = await generateFortuneReport({ mode, name, birth, question, image });
    return NextResponse.json({ report });
  } catch (e) {
    await grantCredits(session.user.id, FORTUNE_COST, 'refund', 'fortune');
    return NextResponse.json({ error: 'fortune_failed', detail: String(e) }, { status: 502 });
  }
}
