import { atlasChat, submitRawGen } from './atlas';

export const VOICE_AGENT_MODEL = 'xai/tts-v1';
export const VOICE_AGENT_LLM_MODEL = 'qwen/qwen3.5-397b-a17b';
export const VOICE_AGENT_COST = 4;

export function cleanAgentText(value: unknown, fallback = '', max = 3000) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function draftAgentReply(input: {
  scenario: string;
  business: string;
  knowledge: string;
  message: string;
}) {
  return atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a concise voice customer-service agent. Answer in Chinese unless the user clearly uses another language. Be practical, polite, and short enough for spoken audio. If unsure, ask one clarifying question.',
      },
      {
        role: 'user',
        content: `Scenario: ${input.scenario}
Business: ${input.business}
Knowledge base / policy:
${input.knowledge || 'No extra knowledge base.'}

Customer says:
${input.message}

Return only the spoken reply. Keep it under 500 Chinese characters.`,
      },
    ],
    VOICE_AGENT_LLM_MODEL,
  );
}

export async function submitAgentAudio(text: string) {
  return submitRawGen('generateAudio', {
    model: VOICE_AGENT_MODEL,
    text,
    language: 'zh',
    voice_id: 'ara',
    codec: 'mp3',
    sample_rate: 24000,
    bit_rate: 64000,
    speed: 1,
    text_normalization: true,
    optimize_streaming_latency: 1,
  });
}
