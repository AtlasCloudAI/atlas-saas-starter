import { atlasChat } from './atlas';
import { STRATEGY_PLAN_MODEL } from './strategy-plan';

export const VIDEO_LOCALIZE_COST = 3;

export type LocalizedSegment = {
  index: number;
  start: string;
  end: string;
  source: string;
  target: string;
  voiceDirection: string;
};

export type VideoLocalizationResult = {
  targetLanguage: string;
  titleOptions: string[];
  segments: LocalizedSegment[];
  voiceScript: string;
  qaChecklist: string[];
};

export function cleanVideoText(value: unknown, max = 7000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function normalizeTargetLanguage(value: unknown) {
  const allowed = new Set(['English', 'Spanish', 'Japanese', 'Portuguese', 'French', 'German', 'Arabic']);
  return typeof value === 'string' && allowed.has(value) ? value : 'English';
}

function jsonFromText(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text.match(/\{[\s\S]*\}/)?.[0] || text;
  return JSON.parse(candidate);
}

function padSegment(segment: Partial<LocalizedSegment>, index: number): LocalizedSegment {
  return {
    index,
    start: typeof segment.start === 'string' && segment.start ? segment.start : `00:00:${String((index - 1) * 4).padStart(2, '0')},000`,
    end: typeof segment.end === 'string' && segment.end ? segment.end : `00:00:${String(index * 4).padStart(2, '0')},000`,
    source: typeof segment.source === 'string' ? segment.source : '',
    target: typeof segment.target === 'string' ? segment.target : '',
    voiceDirection: typeof segment.voiceDirection === 'string' ? segment.voiceDirection : 'Natural, clear, synced to the original pacing.',
  };
}

export function normalizeLocalizationResult(raw: unknown, targetLanguage: string): VideoLocalizationResult {
  const obj = typeof raw === 'object' && raw ? (raw as Record<string, unknown>) : {};
  const rawSegments = Array.isArray(obj.segments) ? obj.segments : [];
  const segments = rawSegments
    .map((segment, index) => padSegment(segment as Partial<LocalizedSegment>, index + 1))
    .filter((segment) => segment.source || segment.target);
  const titleOptions = Array.isArray(obj.titleOptions)
    ? obj.titleOptions.filter((item): item is string => typeof item === 'string').slice(0, 5)
    : [];
  const voiceScript =
    typeof obj.voiceScript === 'string' && obj.voiceScript.trim()
      ? obj.voiceScript.trim()
      : segments.map((segment) => segment.target).join('\n');
  const qaChecklist = Array.isArray(obj.qaChecklist)
    ? obj.qaChecklist.filter((item): item is string => typeof item === 'string').slice(0, 10)
    : [];
  return {
    targetLanguage,
    titleOptions: titleOptions.length ? titleOptions : [`Localized ${targetLanguage} short video`],
    segments,
    voiceScript,
    qaChecklist: qaChecklist.length
      ? qaChecklist
      : [
          'Check subtitle line length on mobile.',
          'Verify product claims remain accurate.',
          'Confirm names, numbers, and URLs are unchanged.',
        ],
  };
}

export function toSrt(segments: LocalizedSegment[]) {
  return segments
    .map((segment, index) => `${index + 1}\n${segment.start} --> ${segment.end}\n${segment.target}`)
    .join('\n\n');
}

export async function localizeVideoTranscript(input: {
  transcript: string;
  targetLanguage: string;
  audience: string;
  tone: string;
  notes: string;
}) {
  const content = await atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior short-form video localization producer. Return only valid JSON. Preserve timings, facts, brand claims, names, quantities, URLs, and disclaimers. Localize naturally instead of translating word-by-word.',
      },
      {
        role: 'user',
        content: `Localize this video transcript.

Target language: ${input.targetLanguage}
Audience/channel: ${input.audience}
Tone: ${input.tone}
Notes/glossary: ${input.notes}

Transcript with optional timestamps:
${input.transcript}

Return JSON with this exact shape:
{
  "targetLanguage": "${input.targetLanguage}",
  "titleOptions": ["..."],
  "segments": [
    {
      "index": 1,
      "start": "00:00:00,000",
      "end": "00:00:03,500",
      "source": "...",
      "target": "...",
      "voiceDirection": "..."
    }
  ],
  "voiceScript": "...",
  "qaChecklist": ["..."]
}

Rules:
- If timestamps are present, keep them and normalize to SRT format HH:MM:SS,mmm.
- If timestamps are missing, create approximate 3-5 second segments.
- Keep each subtitle compact for mobile.
- Do not add unsupported product claims.
- No markdown fences, JSON only.`,
      },
    ],
    STRATEGY_PLAN_MODEL,
  );

  return normalizeLocalizationResult(jsonFromText(content), input.targetLanguage);
}
