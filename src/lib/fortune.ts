import { atlasChat, type ChatMessage } from './atlas';

export const FORTUNE_MODEL = 'qwen/qwen3.5-397b-a17b';
export const FORTUNE_COST = 2;

export function cleanFortuneText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 1200) : fallback;
}

export async function generateFortuneReport(input: {
  mode: string;
  name: string;
  birth: string;
  question: string;
  image?: string;
}) {
  const content: ChatMessage['content'] = [
    {
      type: 'text',
      text: `Create a polished entertainment-style AI mystic report in Chinese.
Mode: ${input.mode}
Name/nickname: ${input.name || '未填写'}
Birth info: ${input.birth || '未填写'}
Question/focus: ${input.question || '综合分析'}

Requirements:
- This is for entertainment and self-reflection, not medical/legal/financial advice.
- Be specific, warm, and shareable.
- Include: 1) opening verdict, 2) personality/energy pattern, 3) current opportunity, 4) relationship/work/money notes, 5) next 30 days action list, 6) one short social-media share line.
- If an image is provided, use it only for visual vibe/style interpretation, avoid claiming scientific face-reading certainty.
- 900-1400 Chinese characters. No markdown fences.`,
    },
  ];
  if (input.image) content.push({ type: 'image_url', image_url: { url: input.image } });

  return atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a tasteful Chinese-language entertainment astrologer and creative copywriter. Keep claims framed as playful reflection. Do not make deterministic guarantees.',
      },
      { role: 'user', content },
    ],
    FORTUNE_MODEL,
  );
}
