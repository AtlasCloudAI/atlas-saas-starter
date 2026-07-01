'use client';

import Link from 'next/link';
import { TEMPLATES } from '@/config/templates';
import { useI18n } from '@/i18n/provider';
import { ArrowRight, Sparkles, Zap, DollarSign, Percent } from 'lucide-react';

export default function Home() {
  const { t, appText } = useI18n();

  const STATS = [
    { icon: Zap, value: '~$0.01–0.04', label: t('home.statCost') },
    { icon: DollarSign, value: '$0.50–1+', label: t('home.statCharge') },
    { icon: Percent, value: '~95%', label: t('home.statMargin') },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* hero */}
      <section className="relative pt-6 text-center sm:pt-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" /> {TEMPLATES.length} {t('home.badge')}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            {t('home.titlePre')} <span className="gradient-text">{t('home.titleHl')}</span>{' '}
            {t('home.titlePost')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-brand">
              {t('home.tryStudio')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost">
              {t('home.seePricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="grid gap-5 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <div key={s.label} className="card animate-fade-up p-6 text-center" style={{ animationDelay: `${i * 80}ms` }}>
            <s.icon className="mx-auto h-6 w-6 text-brand-500" />
            <div className="gradient-text mt-3 text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* apps */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {TEMPLATES.length} {t('home.appsTitle')}
        </h2>
        <p className="mt-2 text-center text-neutral-500">{t('home.appsSubtitle')}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl, i) => {
            const a = appText(tpl.id);
            return (
              <Link
                key={tpl.id}
                href={`/studio?t=${tpl.id}`}
                className="card group animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition duration-300 group-hover:scale-110">
                    {tpl.emoji}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                    {tpl.output === 'video' ? '→ video' : '→ image'}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{a.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition duration-300 group-hover:opacity-100">
                  {t('home.tryIt')} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="card overflow-hidden bg-brand-gradient p-10 text-center text-white shadow-glow sm:p-14">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('home.ctaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">{t('home.ctaSubtitle')}</p>
        <Link
          href="/studio"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-white/90"
        >
          {t('home.ctaBtn')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
