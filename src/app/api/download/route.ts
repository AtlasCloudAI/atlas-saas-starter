// Proxy download: browsers ignore the `download` attribute on cross-origin
// links, so we stream the file through our own origin with an attachment
// header to force a real download.
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return new Response('missing url', { status: 400 });

  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    return new Response('bad url', { status: 400 });
  }
  // SSRF guard: only proxy Atlas media hosts.
  if (!/(^|\.)aliyuncs\.com$|(^|\.)atlascloud\.ai$/.test(host)) {
    return new Response('forbidden', { status: 403 });
  }

  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok || !r.body) return new Response('upstream error', { status: 502 });

  const ct = r.headers.get('content-type') || 'application/octet-stream';
  const pathExt = new URL(url).pathname.split('.').pop()?.toLowerCase();
  const ext = pathExt && /^[a-z0-9]{2,5}$/.test(pathExt)
    ? pathExt
    : ct.includes('video')
    ? 'mp4'
    : ct.includes('audio') || ct.includes('mpeg')
      ? 'mp3'
    : ct.includes('png')
      ? 'png'
      : ct.includes('webp')
        ? 'webp'
        : 'jpg';

  return new Response(r.body, {
    headers: {
      'Content-Type': ct,
      'Content-Disposition': `attachment; filename="atlas-creation.${ext}"`,
      'Cache-Control': 'no-store',
    },
  });
}
