import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitDemoVideo, VIDEO_MODEL, SKU_COSTS, SKU_TEMPLATE_ID } from '@/lib/sku-suite';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productUrl = typeof body.productUrl === 'string' ? body.productUrl : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1500) : '';

  if (!productUrl.startsWith('http')) return NextResponse.json({ error: 'product_url_required' }, { status: 400 });
  if (prompt.length < 10) return NextResponse.json({ error: 'prompt_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, SKU_COSTS.video, 'generate', SKU_TEMPLATE_ID + ':video');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitDemoVideo(productUrl, prompt);
  } catch (e) {
    await grantCredits(session.user.id, SKU_COSTS.video, 'refund', SKU_TEMPLATE_ID + ':video');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: SKU_TEMPLATE_ID + ':video',
      model: VIDEO_MODEL,
      prompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: SKU_COSTS.video,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing' });
}
