import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitSceneImage, CHAR_MODEL, COMIC_COSTS, COMIC_TEMPLATE_ID, type ComicScene } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const s = (body.scene ?? {}) as Record<string, unknown>;
  const style = typeof body.style === 'string' ? body.style.slice(0, 20) : 'anime';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio.slice(0, 10) : '16:9';
  const refPrompt = typeof s.refPrompt === 'string' ? s.refPrompt.slice(0, 500) : '';
  if (refPrompt.length < 5) return NextResponse.json({ error: 'scene_required' }, { status: 400 });

  const scene: ComicScene = {
    id: String(s.id || 's').slice(0, 40),
    name: String(s.name || '场景').slice(0, 40),
    refPrompt,
  };

  try {
    await deductCredits(session.user.id, COMIC_COSTS.scene, 'generate', COMIC_TEMPLATE_ID + ':scene');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitSceneImage(scene, style, aspectRatio);
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.scene, 'refund', COMIC_TEMPLATE_ID + ':scene');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COMIC_TEMPLATE_ID + ':scene',
      model: CHAR_MODEL,
      prompt: scene.refPrompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COMIC_COSTS.scene,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing', sceneId: scene.id });
}
