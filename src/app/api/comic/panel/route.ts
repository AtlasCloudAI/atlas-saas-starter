import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitPanelImage, PANEL_MODEL, CHAR_MODEL, COMIC_COSTS, COMIC_TEMPLATE_ID, type ComicPanel } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const p = (body.panel ?? {}) as Record<string, unknown>;
  const style = typeof body.style === 'string' ? body.style.slice(0, 20) : 'anime';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio.slice(0, 10) : '16:9';
  const charRefUrls: string[] = Array.isArray(body.charRefUrls)
    ? body.charRefUrls.filter((x: unknown) => typeof x === 'string' && x.startsWith('http')).slice(0, 3)
    : [];
  const charNames: string[] = Array.isArray(body.charNames)
    ? body.charNames.map((x: unknown) => String(x).slice(0, 40)).slice(0, 3)
    : [];
  const sceneRefUrl = typeof body.sceneRefUrl === 'string' && body.sceneRefUrl.startsWith('http') ? body.sceneRefUrl : undefined;

  const panel: ComicPanel = {
    index: Number(p.index) || 0,
    sceneId: p.sceneId ? String(p.sceneId).slice(0, 40) : undefined,
    sceneDesc: String(p.sceneDesc || '').slice(0, 200),
    imagePrompt: String(p.imagePrompt || '').slice(0, 700),
    cameraShot: String(p.cameraShot || '').slice(0, 40),
    shotSize: String(p.shotSize || 'medium shot').slice(0, 40),
    characterIds: [],
    speakerId: undefined,
    line: p.line ? String(p.line).slice(0, 120) : undefined,
    caption: String(p.caption || '').slice(0, 120),
    motion: String(p.motion || 'subtle natural motion').slice(0, 300),
  };
  if (panel.imagePrompt.length < 5) return NextResponse.json({ error: 'panel_prompt_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, COMIC_COSTS.panel, 'generate', COMIC_TEMPLATE_ID + ':panel');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitPanelImage(panel, charRefUrls, charNames, sceneRefUrl, style, aspectRatio);
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.panel, 'refund', COMIC_TEMPLATE_ID + ':panel');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COMIC_TEMPLATE_ID + ':panel',
      model: charRefUrls.length ? PANEL_MODEL : CHAR_MODEL,
      prompt: panel.imagePrompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COMIC_COSTS.panel,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing', panelIndex: panel.index });
}
