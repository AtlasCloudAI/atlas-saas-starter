import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  VOICE_AGENT_COST,
  VOICE_AGENT_MODEL,
  cleanAgentText,
  draftAgentReply,
  submitAgentAudio,
} from '@/lib/voice-agent';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const scenario = cleanAgentText(body.scenario, '电商售前客服', 80);
  const business = cleanAgentText(body.business, 'AI 商店', 120);
  const knowledge = cleanAgentText(body.knowledge, '', 2500);
  const message = cleanAgentText(body.message, '', 1000);
  if (message.length < 2) return NextResponse.json({ error: 'message_required' }, { status: 400 });

  try {
    await deductCredits(session.user.id, VOICE_AGENT_COST, 'generate', 'voice-agent');
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let answer: string;
  let res;
  try {
    answer = await draftAgentReply({ scenario, business, knowledge, message });
    res = await submitAgentAudio(answer);
  } catch (e) {
    await grantCredits(session.user.id, VOICE_AGENT_COST, 'refund', 'voice-agent');
    return NextResponse.json({ error: 'voice_agent_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId: 'voice-agent',
      model: VOICE_AGENT_MODEL,
      prompt: `Q: ${message}\nA: ${answer}`,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost: VOICE_AGENT_COST,
    },
  });

  return NextResponse.json({ id: creation.id, answer, status: 'processing' });
}
