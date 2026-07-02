'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getTemplate } from '@/config/templates';
import { useI18n } from '@/i18n/provider';
import Link from 'next/link';
import { Download, ImageOff, Loader2, Mic2, Sparkles } from 'lucide-react';

interface Creation {
  id: string;
  templateId: string;
  status: string;
  outputs?: string[] | null;
  prompt: string;
  createdAt: string;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[40vh] items-center justify-center">{children}</div>;
}

const AUDIO_TEMPLATE_IDS = new Set(['podcast-factory', 'bedtime-story', 'audio-drama', 'soundscape', 'audiobook', 'voice-agent']);
const FILE_TEMPLATE_IDS = new Set(['image-to-3d', 'text-to-3d']);
const VIDEO_TEMPLATE_IDS = new Set([
  'short-drama',
  'viral-video',
  'dynamic-comic',
  'virtual-influencer',
  'talking-photo',
  'video-edit',
  'video-upscale',
]);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { t, appText } = useI18n();
  const [items, setItems] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch('/api/creations');
    if (r.ok) setItems((await r.json()).creations);
    setLoading(false);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  useEffect(() => {
    const pending = items.filter((i) => i.status === 'processing' || i.status === 'pending');
    if (pending.length === 0) return;
    const id = setInterval(async () => {
      await Promise.all(pending.map((i) => fetch(`/api/creations/${i.id}`).catch(() => null)));
      load();
    }, 5000);
    return () => clearInterval(id);
  }, [items]);

  if (status === 'loading') return <Center><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></Center>;
  if (!session)
    return (
      <Center>
        <div className="text-center">
          <p className="mb-4 text-neutral-500">{t('dashboard.signInSee')}</p>
          <button onClick={() => signIn('google')} className="btn-brand">{t('common.signIn')}</button>
        </div>
      </Center>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Sparkles className="h-6 w-6 text-brand-400" />
          </span>
          <p className="text-neutral-500">{t('dashboard.empty')}</p>
          <Link href="/podcast" className="btn-brand">{t('dashboard.createFirst')}</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const tpl = getTemplate(c.templateId);
            const out =
              tpl?.output ??
              (AUDIO_TEMPLATE_IDS.has(c.templateId)
                ? 'audio'
                : FILE_TEMPLATE_IDS.has(c.templateId)
                  ? 'file'
                  : VIDEO_TEMPLATE_IDS.has(c.templateId)
                    ? 'video'
                    : 'image');
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-neutral-50">
                  {c.status === 'completed' && c.outputs?.[0] ? (
                    out === 'video' ? (
                      <video src={c.outputs[0]} controls loop className="h-full w-full object-contain" />
                    ) : out === 'audio' ? (
                      <div className="w-full space-y-4 p-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                          <Mic2 className="h-8 w-8" />
                        </div>
                        <audio src={c.outputs[0]} controls className="w-full" />
                      </div>
                    ) : out === 'file' ? (
                      <div className="flex flex-col items-center gap-3 text-neutral-400">
                        <Sparkles className="h-8 w-8 text-brand-500" />
                        <span className="text-xs">3D assets ready</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.outputs[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                    )
                  ) : c.status === 'failed' ? (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <ImageOff className="h-6 w-6" />
                      <span className="text-xs">{t('dashboard.failed')}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                      <span className="text-xs">{t('dashboard.generating')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="flex items-center gap-1.5 truncate text-xs text-neutral-500">
                    {tpl?.emoji ? <span>{tpl.emoji}</span> : <Mic2 className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{appText(c.templateId).title}</span>
                  </span>
                  {c.status === 'completed' && c.outputs?.[0] && (
                    <a
                      href={`/api/download?url=${encodeURIComponent(c.outputs[0])}`}
                      title={t('studio.download')}
                      className="shrink-0 text-neutral-400 transition hover:text-brand-600"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
