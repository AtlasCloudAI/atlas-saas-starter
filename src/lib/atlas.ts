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

async function get(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}`, 'User-Agent': UA },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Atlas poll ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface GenInput {
  endpoint: 'generateImage' | 'generateVideo';
  model: string;
  prompt?: string;
  /** input image (http url or data: URI) */
  image?: string;
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
  if (input.image) payload[input.imageField || 'images'] = input.image;
  Object.assign(payload, input.extra || {});

  const resp = await post(`/model/${input.endpoint}`, payload);
  // Atlas returns code as a string ("200") on some endpoints — compare loosely.
  if (Number(resp.code) !== 200) throw new Error(`Atlas submit failed: ${JSON.stringify(resp)}`);
  const d = resp.data;
  return { id: d.id, getUrl: d?.urls?.get || `${BASE}/model/prediction/${d.id}` };
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
  const status = (d?.status ?? 'processing') as AtlasStatus;
  return {
    status,
    outputs: Array.isArray(d?.outputs) ? d.outputs : [],
    error: d?.error,
    raw: d,
  };
}
