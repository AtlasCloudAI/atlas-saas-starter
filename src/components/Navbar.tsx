'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/me');
      if (r.ok) setCredits((await r.json()).credits);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else setCredits(null);
  }, [session, refresh]);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener('atlas:credits', h);
    return () => window.removeEventListener('atlas:credits', h);
  }, [refresh]);

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          🎬 Atlas Video Studio
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/studio" className="hover:text-brand">
            Studio
          </Link>
          <Link href="/pricing" className="hover:text-brand">
            Pricing
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-brand">
                My videos
              </Link>
              <span className="rounded-full bg-brand/10 px-3 py-1 font-medium text-brand">
                {credits ?? '·'} credits
              </span>
              <button onClick={() => signOut()} className="text-neutral-500 hover:text-neutral-900">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="rounded-lg bg-brand px-4 py-2 font-medium text-white"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
