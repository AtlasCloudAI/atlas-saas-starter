import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  BEDTIME_STORY_COST,
  BEDTIME_STORY_TEMPLATE_ID,
  draftBedtimeStory,
  normalizeStoryInput,
  submitBedtimeStoryAudio,
} from '@/lib/bedtime-story';
import { AUDIO_MODEL, cleanPodcastScript } from '@/lib/podcast';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const childName = normalizeStoryInput(body.childName, '小星星', 40);
  const age = normalizeStoryInput(body.age, '5 岁', 30);
  const theme = normalizeStoryInput(body.theme, '一只迷路的小月亮找到回家的路', 240);
  const lesson = normalizeStoryInput(body.lesson, '学会勇敢表达和向朋友求助', 160);
  const tone = normalizeStoryInput(body.tone, 'warm, sleepy, gentle, and imaginative', 100);
  const language = normalizeStoryInput(body.language, 'Chinese', 40);
  const caregiverName = normalizeStoryInput(body.caregiverName, '家长', 40);
  const relationship = normalizeStoryInput(body.relationship, '监护人', 60);
  const hasVoiceSample = Boolean(body.hasVoiceSample);
  const voiceConsent = Boolean(body.voiceConsent);
  const childSafe = body.childSafe !== false;
  const noPersonalData = body.noPersonalData !== false;
  const noScaryContent = body.noScaryContent !== false;
  if (hasVoiceSample && !voiceConsent) return NextResponse.json({ error: 'voice_consent_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, BEDTIME_STORY_COST, 'generate', BEDTIME_STORY_TEMPLATE_ID);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let script: string;
  let res;
  try {
    script = await draftBedtimeStory({
      childName,
      age,
      theme,
      lesson,
      tone,
      language,
      caregiverName,
      relationship,
      hasVoiceSample,
      childSafe,
      noPersonalData,
      noScaryContent,
    });
    if (script.length < 80) throw new Error('story script too short');
    res = await submitBedtimeStoryAudio(script);
  } catch (e) {
    await grantCredits(session.user.id, BEDTIME_STORY_COST, 'refund', BEDTIME_STORY_TEMPLATE_ID);
    return NextResponse.json({ error: 'story_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: BEDTIME_STORY_TEMPLATE_ID,
      model: AUDIO_MODEL,
      prompt: cleanPodcastScript(script),
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: BEDTIME_STORY_COST,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing', script });
}
