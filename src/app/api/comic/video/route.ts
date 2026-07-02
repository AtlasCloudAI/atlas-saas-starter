import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitPanelVideo, VIDEO_MODEL, COMIC_COSTS, COMIC_TEMPLATE_ID, type ComicPanel } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const panelImageUrl = typeof body.panelImageUrl === 'string' ? body.panelImageUrl : '';
  const p = (body.panel ?? {}) as Record<string, unknown>;
  const withAudio = typeof body.withAudio === 'boolean' ? body.withAudio : undefined;
  const duration = Math.max(3, Math.min(10, Number(body.duration) || 5));

  if (!panelImageUrl.startsWith('http')) return NextResponse.json({ error: 'panel_image_required' }, { status: 400 });

  const panel: ComicPanel = {
    index: Number(p.index) || 0,
    sceneDesc: '',
    imagePrompt: '',
    cameraShot: '',
    shotSize: 'medium shot',
    characterIds: [],
    line: p.line ? String(p.line).slice(0, 120) : undefined,
    caption: '',
    motion: String(p.motion || 'subtle natural motion, gentle camera move').slice(0, 300),
  };

  try {
    await deductCredits(session.user.id, COMIC_COSTS.video, 'generate', COMIC_TEMPLATE_ID + ':video');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitPanelVideo(panelImageUrl, panel, { withAudio, duration });
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.video, 'refund', COMIC_TEMPLATE_ID + ':video');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COMIC_TEMPLATE_ID + ':video',
      model: VIDEO_MODEL,
      prompt: panel.motion,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COMIC_COSTS.video,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing', panelIndex: panel.index });
}
