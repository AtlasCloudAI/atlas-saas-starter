import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  AUDIO_DRAMA_COST,
  AUDIO_DRAMA_TEMPLATE_ID,
  draftAudioDrama,
  normalizeDramaInput,
  submitAudioDrama,
} from '@/lib/audio-drama';
import { AUDIO_MODEL, cleanPodcastScript } from '@/lib/podcast';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = normalizeDramaInput(body.title, '午夜便利店', 60);
  const genre = normalizeDramaInput(body.genre, '悬疑治愈', 60);
  const characters = normalizeDramaInput(body.characters, '店员阿诚；深夜来买电池的神秘女孩林晚', 240);
  const premise = normalizeDramaInput(body.premise, '暴雨夜里，便利店的监控画面出现了十分钟前才会发生的事。', 320);
  const twist = normalizeDramaInput(body.twist, '女孩不是来求救的，她是在提醒店员避开即将发生的危险。', 240);
  const tone = normalizeDramaInput(body.tone, 'cinematic, tense, emotional, and polished', 100);
  const language = normalizeDramaInput(body.language, 'Chinese', 40);

  try {
    await deductCredits(session.user.id, AUDIO_DRAMA_COST, 'generate', AUDIO_DRAMA_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let script: string;
  let res;
  try {
    script = await draftAudioDrama({ title, genre, characters, premise, twist, tone, language });
    if (script.length < 80) throw new Error('drama script too short');
    res = await submitAudioDrama(script);
  } catch (e) {
    await grantCredits(session.user.id, AUDIO_DRAMA_COST, 'refund', AUDIO_DRAMA_TEMPLATE_ID);
    return NextResponse.json({ error: 'drama_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: AUDIO_DRAMA_TEMPLATE_ID,
      model: AUDIO_MODEL,
      prompt: cleanPodcastScript(script),
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: AUDIO_DRAMA_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing', script });
}
