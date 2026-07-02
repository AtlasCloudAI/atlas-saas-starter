import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import { submitCharacterRef, CHAR_MODEL, COMIC_COSTS, COMIC_TEMPLATE_ID, type ComicCharacter } from '@/lib/comic';

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const c = (body.character ?? {}) as Record<string, unknown>;
  const style = typeof body.style === 'string' ? body.style.slice(0, 20) : 'anime';
  const refPrompt = typeof c.refPrompt === 'string' ? c.refPrompt.slice(0, 600) : '';
  if (refPrompt.length < 5) return NextResponse.json({ error: 'character_required' }, { status: 400 });

  const character: ComicCharacter = {
    id: String(c.id || 'c').slice(0, 40),
    name: String(c.name || '角色').slice(0, 40),
    gender: (['male', 'female', 'other'].includes(c.gender as string) ? c.gender : 'other') as ComicCharacter['gender'],
    refPrompt,
    brief: String(c.brief || '').slice(0, 120),
  };

  try {
    await deductCredits(session.user.id, COMIC_COSTS.character, 'generate', COMIC_TEMPLATE_ID + ':character');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res = await submitCharacterRef(character, style);
  } catch (e) {
    await grantCredits(session.user.id, COMIC_COSTS.character, 'refund', COMIC_TEMPLATE_ID + ':character');
    return NextResponse.json({ error: 'submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: COMIC_TEMPLATE_ID + ':character',
      model: CHAR_MODEL,
      prompt: character.refPrompt,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: COMIC_COSTS.character,
    },
  });
  return NextResponse.json({ id: creation.id, status: 'processing', characterId: character.id });
}
