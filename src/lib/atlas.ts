/**
 * Atlas Cloud generation client.
 *
 * Submit async task -> poll until completed. Never long-poll inside one
 * serverless request: submitGen returns { id, getUrl } immediately, and the
 * client polls /api/creations/[id] which calls pollOnce once per request.
 *
 * The browser User-Agent header is required to get past Cloudflare (err 1010).
 *
 * NOTE on input-image field names — they differ by model:
 *   - image-edit (seedream/qwen .../edit): plural `images`
 *   - seedance image-to-video:            singular `image`
 * so each template declares its own `imageField`.
 */
const BASE = process.env.ATLASCLOUD_BASE || 'https://api.atlascloud.ai/api/v1';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function apiKey(): string {
  const k = process.env.ATLASCLOUD_API_KEY;
  if (!k) throw new Error('ATLASCLOUD_API_KEY is not set');
  return k;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(path: string, payload: Record<string, unknown>, retries = 5): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey()}`,
          'Content-Type': 'application/json',
          'User-Agent': UA,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      if (res.ok) return res.json();
      const body = await res.text();
      if (res.status < 500) throw new Error(`Atlas ${res.status}: ${body}`);
      lastErr = new Error(`Atlas ${res.status}: ${body}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(2000 * (i + 1));
  }
  throw lastErr;
}

export async function submitRawGen(
  endpoint: 'generateImage' | 'generateVideo' | 'generateAudio',
  payload: Record<string, unknown>,
): Promise<SubmitResult> {
  const resp = await post(`/model/${endpoint}`, payload);
  if (Number(resp.code) !== 200) throw new Error(`Atlas submit failed: ${JSON.stringify(resp)}`);
  const d = resp.data;
  return { id: d.id, getUrl: d?.urls?.get || `${BASE}/model/prediction/${d.id}` };
}

async function get(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}`, 'User-Agent': UA },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Atlas poll ${res.status}: ${await res.text()}`);
  return res.json();
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; extension: string } {
  const match = dataUrl.match(/^data:([^;,]+)(;base64)?,(.*)$/);
  if (!match) throw new Error('invalid data url');
  const mime = match[1];
  const body = match[3];
  const bytes = match[2]
    ? Buffer.from(body, 'base64')
    : Buffer.from(decodeURIComponent(body), 'utf8');
  const extension =
    mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : mime.includes('mp4')
          ? 'mp4'
          : mime.includes('mpeg') || mime.includes('mp3')
            ? 'mp3'
            : mime.includes('wav')
              ? 'wav'
              : mime.includes('webm')
                ? 'webm'
                : mime.includes('quicktime')
                  ? 'mov'
                  : 'bin';
  return { blob: new Blob([bytes], { type: mime }), extension };
}

export async function uploadMedia(dataUrl: string, filenamePrefix = 'media'): Promise<string> {
  const { blob, extension } = dataUrlToBlob(dataUrl);
  const form = new FormData();
  form.append('file', blob, `${filenamePrefix}.${extension}`);
  const res = await fetch(`${BASE}/model/uploadMedia`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'User-Agent': UA,
    },
    body: form,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Atlas upload ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.data?.download_url || data?.data?.url || data?.download_url || data?.url;
  if (typeof url !== 'string' || !url) throw new Error(`Atlas upload returned no URL: ${JSON.stringify(data)}`);
  return url;
}

export interface GenInput {
  endpoint: 'generateImage' | 'generateVideo' | 'generateAudio';
  model: string;
  prompt?: string;
  /** audio generation text prompt */
  text?: string;
  /** input image (http url or data: URI) */
  image?: string;
  /** multiple input images (http urls or data: URIs) */
  images?: string[];
  /** which payload key the model expects the input image under */
  imageField?: 'image' | 'images';
  /** extra model params, e.g. { duration: 5, resolution: '720p' } */
  extra?: Record<string, unknown>;
}

export interface SubmitResult {
  id: string;
  getUrl: string;
}

export async function submitGen(input: GenInput): Promise<SubmitResult> {
  const payload: Record<string, unknown> = { model: input.model };
  if (input.prompt) payload.prompt = input.prompt;
  if (input.text) payload.text = input.text;
  if (input.images?.length) {
    const field = input.imageField || 'images';
    payload[field] = field === 'images' ? input.images : input.images[0];
  } else if (input.image) {
    const field = input.imageField || 'images';
    payload[field] = field === 'images' ? [input.image] : input.image;
  }
  Object.assign(payload, input.extra || {});

  return submitRawGen(input.endpoint, payload);
}

export type AtlasStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PollResult {
  status: AtlasStatus;
  outputs: string[];
  error?: string;
  raw: any;
}

/** One poll request against the task's get URL. Safe for serverless. */
export async function pollOnce(getUrl: string): Promise<PollResult> {
  const r = await get(getUrl);
  const d = r?.data ?? r;
  const rawStatus = String(d?.status ?? 'processing').toLowerCase();
  const status: AtlasStatus =
    rawStatus === 'completed' || rawStatus === 'succeeded' || rawStatus === 'success'
      ? 'completed'
      : rawStatus === 'failed' || rawStatus === 'error' || rawStatus === 'canceled' || rawStatus === 'cancelled'
        ? 'failed'
        : rawStatus === 'pending' || rawStatus === 'starting' || rawStatus === 'queued'
          ? 'pending'
          : 'processing';
  const outputs = Array.isArray(d?.outputs)
    ? d.outputs
    : Array.isArray(d?.output)
      ? d.output
      : typeof d?.output === 'string'
        ? [d.output]
        : [];
  return {
    status,
    outputs,
    error: d?.error,
    raw: d,
  };
}

const LLM_BASE = process.env.ATLASCLOUD_LLM_BASE || 'https://api.atlascloud.ai/v1';
export const DEFAULT_CHAT_MODEL = process.env.ATLASCLOUD_CHAT_MODEL || 'bytedance/doubao-seed-2.1-turbo-260628';
const CHAT_TIMEOUT_MS = Number(process.env.ATLASCLOUD_CHAT_TIMEOUT_MS || 45000);

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
}

export async function atlasChat(
  messages: ChatMessage[],
  model = DEFAULT_CHAT_MODEL,
  maxTokens = 900,
  timeoutMs = CHAT_TIMEOUT_MS,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${LLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        stream: false,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Atlas chat ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Atlas chat returned empty content');
    return content.trim();
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Atlas chat timed out after ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
