import Link from 'next/link';
import { TEMPLATES } from '@/config/templates';
import { ArrowRight, Sparkles, Zap, DollarSign, Percent } from 'lucide-react';

const STATS = [
  { icon: Zap, value: '~$0.01–0.04', label: 'Atlas cost / generation' },
  { icon: DollarSign, value: '$0.50–1+', label: 'what you charge' },
  { icon: Percent, value: '~95%', label: 'gross margin' },
];

export default function Home() {
  return (
    <div className="space-y-20 sm:space-y-28">
      {/* hero */}
      <section className="relative pt-6 text-center sm:pt-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" /> {TEMPLATES.length} ready-to-sell AI apps
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Launch your own <span className="gradient-text">AI media SaaS</span> in an afternoon
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Open-source, Stripe-ready, one-click deploy. You bring the brand, Atlas Cloud powers the
            AI, you keep the revenue.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-brand">
              Try the studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="grid gap-5 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="card animate-fade-up p-6 text-center"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <s.icon className="mx-auto h-6 w-6 text-brand-500" />
            <div className="gradient-text mt-3 text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* apps */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {TEMPLATES.length} apps, ready to brand &amp; sell
        </h2>
        <p className="mt-2 text-center text-neutral-500">
          Each one: upload a photo, get a result. Charge per generation.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t, i) => (
            <Link
              key={t.id}
              href={`/studio?t=${t.id}`}
              className="card group animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition duration-300 group-hover:scale-110">
                  {t.emoji}
                </span>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                  {t.output === 'video' ? '→ video' : '→ image'}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{t.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition duration-300 group-hover:opacity-100">
                Try it <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card overflow-hidden bg-brand-gradient p-10 text-center text-white shadow-glow sm:p-14">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your brand. Your Stripe. Your profit.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          Fork it, add your keys, deploy to Vercel. Atlas Cloud handles the AI — you keep 100% of
          what you charge.
        </p>
        <Link
          href="/studio"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-white/90"
        >
          Start creating <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
