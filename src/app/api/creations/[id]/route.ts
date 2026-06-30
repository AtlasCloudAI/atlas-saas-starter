import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pollOnce } from '@/lib/atlas';
import { grantCredits } from '@/lib/credits';

// Polled by the client. Each call advances the task status at most once.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const c = await prisma.creation.findUnique({ where: { id: params.id } });
  if (!c || c.userId !== session.user.id)
    return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Terminal states: nothing more to do.
  if (c.status === 'completed' || c.status === 'failed' || !c.getUrl)
    return NextResponse.json({ id: c.id, status: c.status, outputs: c.outputs, error: c.error });

  try {
    const p = await pollOnce(c.getUrl);
    if (p.status === 'completed') {
      const u = await prisma.creation.update({
        where: { id: c.id },
        data: { status: 'completed', outputs: p.outputs },
      });
      return NextResponse.json({ id: u.id, status: u.status, outputs: u.outputs });
    }
    if (p.status === 'failed') {
      await prisma.creation.update({
        where: { id: c.id },
        data: { status: 'failed', error: p.error || 'generation failed' },
      });
      await grantCredits(c.userId, c.cost, 'refund', c.id); // refund a failed job
      return NextResponse.json({ id: c.id, status: 'failed', error: p.error });
    }
    return NextResponse.json({ id: c.id, status: 'processing' });
  } catch {
    // Transient poll error — keep the client polling.
    return NextResponse.json({ id: c.id, status: 'processing' });
  }
}
