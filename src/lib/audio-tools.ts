import { submitRawGen } from './atlas';

export const SOUNDSCAPE_MODEL = 'bytedance/seed-audio-1.0';
export const AUDIOBOOK_MODEL = 'elevenlabs/v3/text-to-speech';
export const AUDIO_TOOL_COST = 6;

export function normalizeAudioKind(value: unknown) {
  if (value === 'voice-meme') return 'voice-meme';
  return value === 'audiobook' ? 'audiobook' : 'soundscape';
}

export function cleanAudioText(value: unknown, max = 4000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function submitSoundscape(text: string) {
  return submitRawGen('generateAudio', {
    model: SOUNDSCAPE_MODEL,
    text,
    format: 'mp3',
    sample_rate: 44100,
    speech_rate: 5,
    pitch_rate: 0,
    loudness_rate: 5,
  });
}

export async function submitAudiobook(text: string, languageCode = 'zh') {
  return submitRawGen('generateAudio', {
    model: AUDIOBOOK_MODEL,
    text,
    voice: 'JBFqnCBsd6RMkjVDRZzb',
    language_code: languageCode,
    stability: 0.55,
    apply_text_normalization: 'auto',
  });
}
