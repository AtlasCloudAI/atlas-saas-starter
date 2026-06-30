import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { grantCredits } from '@/lib/credits';

/**
 * Optional Atlas push callback (set WEBHOOK_URL when submitting to enable).
 * The primary status path is polling /api/creations/[id]; this just lets a
 * completed/failed result land faster if Atlas posts back. Experimental —
 * adjust the payload shape to match your Atlas callback contract.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const d = body?.data ?? body;
  const taskId = d?.id;
  const status = d?.status;
  if (!taskId || !status) return NextResponse.json({ received: true });

  const c = await prisma.creation.findFirst({ where: { taskId } });
  if (c && c.status !== 'completed' && c.status !== 'failed') {
    if (status === 'completed') {
      await prisma.creation.update({
        where: { id: c.id },
        data: { status: 'completed', outputs: Array.isArray(d.outputs) ? d.outputs : [] },
      });
    } else if (status === 'failed') {
      await prisma.creation.update({
        where: { id: c.id },
        data: { status: 'failed', error: d.error || 'generation failed' },
      });
      await grantCredits(c.userId, c.cost, 'refund', c.id);
    }
  }
  return NextResponse.json({ received: true });
}
