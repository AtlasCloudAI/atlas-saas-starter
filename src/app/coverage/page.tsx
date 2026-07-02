import Link from 'next/link';
import { appIdeasCoverage, coverageSummary } from '@/config/appIdeasCoverage';

const statusText = {
  ready: '已实现入口',
  mvp: 'MVP/方案型',
  gap: '缺口',
} as const;

const statusClass = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  mvp: 'border-amber-200 bg-amber-50 text-amber-700',
  gap: 'border-red-200 bg-red-50 text-red-700',
} as const;

export default function CoveragePage() {
  return (
    <div className="space-y-8">
      <section className="border-b border-neutral-200 pb-6">
        <p className="text-sm font-semibold text-brand-600">APP_IDEAS coverage audit</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">功能覆盖审计</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">
          这页把 APP_IDEAS.md 里的玩法映射到当前本地应用路由，用来判断哪些已经有可运行入口，哪些还只是方案型 MVP，哪些需要后续接真实第三方闭环。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['总玩法', coverageSummary.total],
          ['已实现入口', coverageSummary.ready],
          ['MVP/方案型', coverageSummary.mvp],
          ['缺口', coverageSummary.gap],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-500">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="grid grid-cols-[120px_minmax(220px,1.3fr)_minmax(180px,1fr)_110px_minmax(260px,1.4fr)] gap-0 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <div>领域</div>
          <div>玩法</div>
          <div>本地路由</div>
          <div>状态</div>
          <div>证据 / 下一步</div>
        </div>
        <div className="divide-y divide-neutral-100">
          {appIdeasCoverage.map((item) => (
            <div
              key={`${item.area}-${item.idea}`}
              className="grid grid-cols-[120px_minmax(220px,1.3fr)_minmax(180px,1fr)_110px_minmax(260px,1.4fr)] gap-0 px-4 py-4 text-sm"
            >
              <div className="font-medium text-neutral-500">{item.area}</div>
              <div className="pr-4 font-semibold leading-6">{item.idea}</div>
              <div className="flex flex-wrap gap-2 pr-4">
                {item.routes.map((route) => (
                  <Link
                    key={route}
                    href={route}
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {route}
                  </Link>
                ))}
              </div>
              <div>
                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClass[item.status]}`}>
                  {statusText[item.status]}
                </span>
              </div>
              <div className="space-y-2 pr-2 text-xs leading-5 text-neutral-600">
                <p>{item.evidence}</p>
                <p className="text-neutral-400">下一步：{item.next}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
