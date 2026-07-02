import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  STRATEGY_PLAN_COST,
  cleanPlanField,
  generateStrategyPlan,
  normalizePlanKind,
} from '@/lib/strategy-plan';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = normalizePlanKind(body.kind);
  const brief = cleanPlanField(body.brief);
  const audience = cleanPlanField(body.audience, '中小商家 / 创作者 / 工作室', 800);
  const constraints = cleanPlanField(body.constraints, '', 1200);
  if (brief.length < 8) return NextResponse.json({ error: 'brief_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, STRATEGY_PLAN_COST, 'generate', kind);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  try {
    const plan = await generateStrategyPlan({ kind, brief, audience, constraints });
    return NextResponse.json({ plan });
  } catch (e) {
    await grantCredits(session.user.id, STRATEGY_PLAN_COST, 'refund', kind);
    return NextResponse.json({ error: 'plan_failed', detail: String(e) }, { status: 502 });
  }
}
