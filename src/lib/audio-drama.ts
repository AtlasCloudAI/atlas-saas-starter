import { atlasChat, submitGen } from '@/lib/atlas';
import { AUDIO_MODEL, cleanPodcastScript, DRAFT_MODEL } from '@/lib/podcast';

export const AUDIO_DRAMA_TEMPLATE_ID = 'audio-drama';
export const AUDIO_DRAMA_COST = 6;

export function normalizeDramaInput(value: unknown, fallback: string, max = 180): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function draftAudioDrama(input: {
  title: string;
  genre: string;
  characters: string;
  premise: string;
  twist: string;
  tone: string;
  language: string;
}) {
  const script = await atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior audio drama producer. Write compact, production-ready audio drama scripts with clear roles, sound cues, pacing beats, and a satisfying ending. Keep it tasteful, non-graphic, and suitable for social audio. Do not include markdown fences.',
      },
      {
        role: 'user',
        content: `Write a short audio drama script in ${input.language}.
Title: ${input.title}
Genre: ${input.genre}
Characters: ${input.characters}
Premise: ${input.premise}
Twist or ending: ${input.twist}
Tone: ${input.tone}

Use @audio1 and @audio2 for the two main voices. If there are more characters, let the narrator introduce them briefly and keep dialogue practical for two voices.
Include short bracketed sound cues such as [rain outside], [phone vibration], [door opens], [soft music sting].
Requirements:
- 2-4 minutes when spoken.
- Strong opening hook in the first 2 lines.
- A clear conflict, one turn, and a resolved ending.
- Under 1900 characters.
- Return only the final script.`,
      },
    ],
    DRAFT_MODEL,
  );
  return cleanPodcastScript(script);
}

export async function submitAudioDrama(script: string) {
  return submitGen({
    endpoint: 'generateAudio',
    model: AUDIO_MODEL,
    text: cleanPodcastScript(script),
    extra: {
      format: 'mp3',
      sample_rate: 44100,
      speech_rate: 5,
      pitch_rate: 0,
      loudness_rate: 5,
      references: [{ speaker: 'zh_male_taocheng_uranus_bigtts' }, { speaker: 'zh_female_sophie_uranus_bigtts' }],
    },
  });
}
