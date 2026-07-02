import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  IMAGE_TO_3D_COST,
  IMAGE_TO_3D_MODEL,
  IMAGE_TO_3D_TEMPLATE_ID,
  normalizeFaceCount,
  submitImageTo3D,
} from '@/lib/image-to-3d';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';
  const pbr = body.pbr !== false;
  const faceCount = normalizeFaceCount(body.faceCount);

  if (!image) return NextResponse.json({ error: 'image_required' }, { status: 400 });
  if (image.length > 6_500_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  try {
    await deductCredits(session.user.id, IMAGE_TO_3D_COST, 'generate', IMAGE_TO_3D_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitImageTo3D({ image, pbr, faceCount });
  } catch (e) {
    await grantCredits(session.user.id, IMAGE_TO_3D_COST, 'refund', IMAGE_TO_3D_TEMPLATE_ID);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: IMAGE_TO_3D_TEMPLATE_ID,
      model: IMAGE_TO_3D_MODEL,
      prompt: `Image to 3D · PBR ${pbr ? 'on' : 'off'} · face_count ${faceCount}`,
      inputImage: image,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: IMAGE_TO_3D_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
