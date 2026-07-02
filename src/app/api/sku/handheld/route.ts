import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { uploadMedia } from '@/lib/atlas';
import { submitHandheldActor, IMAGE_MODEL, SKU_COSTS, SKU_TEMPLATE_ID } from '@/lib/sku-suite';

export const maxDuration = 60;

// Composite the product into the actor's hands, so the UGC talking video shows it.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const actorImage = typeof body.actorImage === 'string' ? body.actorImage : '';
  const productUrl = typeof body.productUrl === 'string' ? body.productUrl : '';

  if (!actorImage || (!actorImage.startsWith('data:image/') && !actorImage.startsWith('http')))
    return NextResponse.json({ error: 'actor_image_required' }, { status: 400 });
  if (!productUrl.startsWith('http')) return NextResponse.json({ error: 'product_url_required' }, { status: 400 });
  if (actorImage.length > 8_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  let actorUrl: string;
  try {
    actorUrl = actorImage.startsWith('data:') ? await uploadMedia(actorImage, 'sku-actor') : actorImage;
  } catch (e) {
    return NextResponse.json({ error: 'upload_failed', detail: String(e) }, { status: 502 });
  }

  try {
    await deductCredits(session.user.id, SKU_COSTS.handheld, 'generate', SKU_TEMPLATE_ID + ':handheld');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitHandheldActor(actorUrl, productUrl);
  } catch (e) {
    await grantCredits(session.user.id, SKU_COSTS.handheld, 'refund', SKU_TEMPLATE_ID + ':handheld');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: SKU_TEMPLATE_ID + ':handheld',
      model: IMAGE_MODEL,
      prompt: 'handheld composite',
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: SKU_COSTS.handheld,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing' });
}
