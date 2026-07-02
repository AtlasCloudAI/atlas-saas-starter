import { atlasChat, submitGen } from '@/lib/atlas';
import { AUDIO_MODEL, cleanPodcastScript, DRAFT_MODEL } from '@/lib/podcast';

export const BEDTIME_STORY_TEMPLATE_ID = 'bedtime-story';
export const BEDTIME_STORY_COST = 5;

export function normalizeStoryInput(value: unknown, fallback: string, max = 120): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function draftBedtimeStory(input: {
  childName: string;
  age: string;
  theme: string;
  lesson: string;
  tone: string;
  language: string;
  caregiverName?: string;
  relationship?: string;
  hasVoiceSample?: boolean;
  childSafe?: boolean;
  noPersonalData?: boolean;
  noScaryContent?: boolean;
}) {
  const story = await atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior children audio writer. Create safe, gentle, age-appropriate bedtime stories for audio. Avoid fear, violence, unsafe advice, brands, medical claims, or anything too stimulating. Do not include markdown fences.',
      },
      {
        role: 'user',
        content: `Write a production-ready Seed Audio script in ${input.language}.
Use @audio1 as the warm narrator and @audio2 as a small friendly character voice when useful.
Child name or main character: ${input.childName}
Age: ${input.age}
Theme: ${input.theme}
Lesson: ${input.lesson}
Tone: ${input.tone}
Caregiver / voice sample context: ${
          input.hasVoiceSample
            ? `${input.caregiverName || 'caregiver'} (${input.relationship || 'guardian'}) provided a voice sample for delivery records. Write as if a loving caregiver will read it, but do not include private details.`
            : 'Use a warm default narrator voice.'
        }

Requirements:
- 2-4 minutes when spoken.
- Calm opening, simple conflict, reassuring resolution.
- Include gentle pauses and one soft ending line for sleep.
- ${input.childSafe ? 'Strictly keep it child-safe, age-appropriate, reassuring and non-stimulating.' : 'Keep it gentle and age-appropriate.'}
- ${input.noPersonalData ? 'Do not mention real addresses, schools, phone numbers, exact schedules, or other personal data.' : 'Avoid unnecessary private details.'}
- ${input.noScaryContent ? 'Avoid scary threats, violence, monsters, danger, medical claims, or intense suspense.' : 'Avoid unsafe advice or graphic content.'}
- Keep it under 1900 characters.
- Return only the script.`,
      },
    ],
    DRAFT_MODEL,
  );
  return cleanPodcastScript(story);
}

export async function submitBedtimeStoryAudio(script: string) {
  return submitGen({
    endpoint: 'generateAudio',
    model: AUDIO_MODEL,
    text: cleanPodcastScript(script),
    extra: {
      format: 'mp3',
      sample_rate: 44100,
      speech_rate: 4,
      pitch_rate: 0,
      loudness_rate: 4,
      references: [{ speaker: 'zh_female_sophie_uranus_bigtts' }, { speaker: 'zh_male_taocheng_uranus_bigtts' }],
    },
  });
}
