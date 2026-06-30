'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getTemplate } from '@/config/templates';

interface Creation {
  id: string;
  templateId: string;
  status: string;
  outputs?: string[] | null;
  prompt: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Creation[]>([]);

  async function load() {
    const r = await fetch('/api/creations');
    if (r.ok) setItems((await r.json()).creations);
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

  if (status === 'loading') return <p>Loading…</p>;
  if (!session)
    return (
      <button onClick={() => signIn('google')} className="rounded-lg bg-brand px-4 py-2 text-white">
        Sign in to see your creations
      </button>
    );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My creations</h1>
      {items.length === 0 ? (
        <p className="text-neutral-500">Nothing yet. Head to the studio to make something.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const out = getTemplate(c.templateId)?.output ?? 'image';
            return (
              <div key={c.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                {c.status === 'completed' && c.outputs?.[0] ? (
                  out === 'video' ? (
                    <video src={c.outputs[0]} controls loop className="w-full rounded-lg" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.outputs[0]} alt="" className="w-full rounded-lg" />
                  )
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
                    {c.status === 'failed' ? 'Failed (refunded)' : 'Generating…'}
                  </div>
                )}
                <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{c.prompt}</p>
                {c.status === 'completed' && c.outputs?.[0] && (
                  <a
                    href={`/api/download?url=${encodeURIComponent(c.outputs[0])}`}
                    className="mt-2 inline-block text-xs font-medium text-brand underline"
                  >
                    ⬇ Download
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
