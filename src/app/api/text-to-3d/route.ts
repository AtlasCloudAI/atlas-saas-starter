import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  TEXT_TO_3D_COST,
  TEXT_TO_3D_MODEL,
  TEXT_TO_3D_TEMPLATE_ID,
  normalizeGenerateType,
  normalizeText3DFaceCount,
  submitTextTo3D,
} from '@/lib/text-to-3d';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1800) : '';
  const pbr = body.pbr !== false;
  const faceCount = normalizeText3DFaceCount(body.faceCount);
  const generateType = normalizeGenerateType(body.generateType);

  if (prompt.length < 12) return NextResponse.json({ error: 'prompt_too_short' }, { status: 400 });

  try {
    await deductCredits(session.user.id, TEXT_TO_3D_COST, 'generate', TEXT_TO_3D_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitTextTo3D({ prompt, pbr, faceCount, generateType });
  } catch (e) {
    await grantCredits(session.user.id, TEXT_TO_3D_COST, 'refund', TEXT_TO_3D_TEMPLATE_ID);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: TEXT_TO_3D_TEMPLATE_ID,
      model: TEXT_TO_3D_MODEL,
      prompt: `${prompt}\n\n3D settings: ${generateType}, PBR ${pbr ? 'on' : 'off'}, face_count ${faceCount}`,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: TEXT_TO_3D_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
