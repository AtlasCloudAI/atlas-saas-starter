import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  ECOMMERCE_SUITE_COST,
  buildFallbackEcommerceSuitePlan,
  cleanEcommerceField,
  draftEcommerceSuite,
} from '@/lib/ecommerce-suite';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productName = cleanEcommerceField(body.productName, 'Unnamed product', 120);
  const productUrl = cleanEcommerceField(body.productUrl, '', 400);
  const marketplace = cleanEcommerceField(body.marketplace, 'Amazon + Shopify + TikTok Shop', 160);
  const audience = cleanEcommerceField(body.audience, '跨境电商消费者', 600);
  const productFacts = cleanEcommerceField(body.productFacts, '', 1600);
  const constraints = cleanEcommerceField(body.constraints, '不得夸大功效，保持商品外观准确，主图不加随机文字。', 1200);
  const sourceImageCount = Math.max(0, Math.min(8, Number(body.sourceImageCount) || 0));

  if (productName.length < 2) return NextResponse.json({ error: 'product_required' }, { status: 400 });
  if (productFacts.length < 8) return NextResponse.json({ error: 'facts_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, ECOMMERCE_SUITE_COST, 'generate', 'ecommerce-suite');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await draftEcommerceSuite({
      productName,
      productUrl,
      marketplace,
      audience,
      productFacts,
      constraints,
      sourceImageCount,
    });
    return NextResponse.json({ plan });
  } catch (e) {
    await grantCredits(session.user.id, ECOMMERCE_SUITE_COST, 'refund', 'ecommerce-suite');
    const plan = buildFallbackEcommerceSuitePlan({
      productName,
      productUrl,
      marketplace,
      audience,
      productFacts,
      constraints,
      sourceImageCount,
    });
    return NextResponse.json({ plan, fallback: true, warning: 'llm_unavailable_refunded', detail: String(e) });
  }
}
