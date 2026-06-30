import Link from 'next/link';
import { TEMPLATES } from '@/config/templates';

const STATS: [string, string][] = [
  ['~$0.01–0.04', 'Atlas cost per generation'],
  ['$0.50–1+', 'what you can charge'],
  ['~95%', 'gross margin'],
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="pt-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Launch your own AI media SaaS
          <br />
          in an afternoon
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          Open-source, Stripe-ready, one-click deploy to Vercel. You bring the brand, Atlas Cloud
          powers the AI, you keep the revenue.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/studio" className="rounded-lg bg-brand px-6 py-3 font-medium text-white">
            Try the studio
          </Link>
          <Link href="/pricing" className="rounded-lg border border-neutral-300 px-6 py-3 font-medium">
            See pricing
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {STATS.map(([a, b]) => (
          <div key={b} className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
            <div className="text-3xl font-bold text-brand">{a}</div>
            <div className="mt-1 text-sm text-neutral-500">{b}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{TEMPLATES.length} ready-to-sell apps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/studio?t=${t.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="text-2xl">{t.emoji}</div>
              <div className="mt-2 font-medium">{t.title}</div>
              <div className="mt-1 text-sm text-neutral-500">{t.description}</div>
              <div className="mt-3 text-xs uppercase tracking-wide text-brand">
                {t.output === 'video' ? 'photo → video' : 'photo → image'} · {t.cost} credits
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
