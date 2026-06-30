import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemplate } from '@/config/templates';
import { submitVideo } from '@/lib/atlas';
import { deductCredits, grantCredits } from '@/lib/credits';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { templateId, prompt, image } = await req.json().catch(() => ({}));
  const t = getTemplate(templateId);
  if (!t) return NextResponse.json({ error: 'unknown_template' }, { status: 400 });
  if (t.kind === 'i2v' && !image)
    return NextResponse.json({ error: 'image_required' }, { status: 400 });

  const finalPrompt = (prompt?.trim?.() || t.defaultPrompt) as string;

  // Charge first so a user can't fire many free jobs in parallel.
  try {
    await deductCredits(session.user.id, t.cost, 'generate', templateId);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitVideo({
      model: t.model,
      prompt: finalPrompt,
      images: image ? [image] : undefined,
      extra: t.extra,
    });
  } catch (e) {
    // Refund if Atlas rejected the job outright.
    await grantCredits(session.user.id, t.cost, 'refund', templateId);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId,
      model: t.model,
      prompt: finalPrompt,
      inputImage: image || null,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: t.cost,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
