import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import { uploadMedia } from '@/lib/atlas';
import { planSku, SKU_COSTS, SKU_TEMPLATE_ID } from '@/lib/sku-suite';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productImage = typeof body.productImage === 'string' ? body.productImage : '';
  const sellingPoints = typeof body.sellingPoints === 'string' ? body.sellingPoints.trim().slice(0, 2000) : '';
  const audience = typeof body.audience === 'string' ? body.audience.trim().slice(0, 500) : '';
  const platforms = typeof body.platforms === 'string' ? body.platforms.trim().slice(0, 200) : '';
  const language =
    typeof body.language === 'string' && body.language.trim() ? body.language.trim().slice(0, 40) : 'English';

  if (!productImage || (!productImage.startsWith('data:image/') && !productImage.startsWith('http')))
    return NextResponse.json({ error: 'product_image_required' }, { status: 400 });
  if (productImage.length > 8_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  let productUrl: string;
  try {
    productUrl = productImage.startsWith('data:') ? await uploadMedia(productImage, 'sku-product') : productImage;
  } catch (e) {
    return NextResponse.json({ error: 'upload_failed', detail: String(e) }, { status: 502 });
  }

  try {
    await deductCredits(session.user.id, SKU_COSTS.plan, 'generate', SKU_TEMPLATE_ID + ':plan');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await planSku({ productImageUrl: productUrl, sellingPoints, audience, platforms, language });
    return NextResponse.json({ plan, productUrl });
  } catch (e) {
    await grantCredits(session.user.id, SKU_COSTS.plan, 'refund', SKU_TEMPLATE_ID + ':plan');
    return NextResponse.json({ error: 'plan_failed', detail: String(e) }, { status: 502 });
  }
}
