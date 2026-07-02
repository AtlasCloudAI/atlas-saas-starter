import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemplate } from '@/config/templates';
import { submitGen } from '@/lib/atlas';
import { deductCredits, grantCredits } from '@/lib/credits';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { templateId, prompt, image, images } = await req.json().catch(() => ({}));
  const t = getTemplate(templateId);
  if (!t) return NextResponse.json({ error: 'unknown_template' }, { status: 400 });
  const inputImages = Array.isArray(images)
    ? images.filter((x: unknown) => typeof x === 'string' && x.startsWith('data:image/')).slice(0, t.maxImages || 1)
    : typeof image === 'string' && image.startsWith('data:image/')
      ? [image]
      : [];
  if (inputImages.length === 0) return NextResponse.json({ error: 'image_required' }, { status: 400 });
  if (inputImages.length > (t.maxImages || 1)) return NextResponse.json({ error: 'too_many_images' }, { status: 400 });
  if (inputImages.join('').length > 8_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  const finalPrompt = (prompt?.trim?.() || t.defaultPrompt) as string;

  // Charge first so a user can't fire many free jobs in parallel.
  try {
    await deductCredits(session.user.id, t.cost, 'generate', templateId);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitGen({
      endpoint: t.endpoint,
      model: t.model,
      prompt: finalPrompt,
      images: inputImages,
      imageField: t.imageField,
      extra: t.extra,
    });
  } catch (e) {
    await grantCredits(session.user.id, t.cost, 'refund', templateId); // refund on submit failure
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId,
      model: t.model,
      prompt: finalPrompt,
      inputImage: inputImages[0],
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: t.cost,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
