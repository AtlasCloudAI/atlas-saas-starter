'use client';

import { ReactNode, useMemo, useState } from 'react';
import { ClipboardList, Copy, Download, HeartHandshake, ShieldCheck } from 'lucide-react';

type Mode = 'hug' | 'memorial' | 'talking-photo' | 'child-self';

const modes: Record<Mode, { label: string; consent: string; risk: string }> = {
  hug: { label: '拥抱/重逢', consent: '已取得所有在世人物授权；逝者内容由近亲或合法权利人确认。', risk: '避免亲吻、误导性身份冒充和强烈刺激文案。' },
  memorial: { label: '纪念复现', consent: '逝者照片、声音和留言由近亲或权利人授权，仅用于纪念表达。', risk: '明确标注 AI 生成，不伪造真实遗言或现实承诺。' },
  'talking-photo': { label: '老照片开口', consent: '已确认肖像、音频和文字脚本来源合法。', risk: '脚本必须温和克制，不制造未授权发言。' },
  'child-self': { label: '抱抱童年/未来自己', consent: '使用自己的照片或已获监护人授权的历史照片。', risk: '避免医疗、心理治疗或强暗示承诺。' },
};

export function ConsentWorkflowShell({ mode, children }: { mode: Mode; children: ReactNode }) {
  const [authorized, setAuthorized] = useState(true);
  const [aiLabel, setAiLabel] = useState(true);
  const [gentle, setGentle] = useState(true);
  const [noImpersonation, setNoImpersonation] = useState(true);

  const manifest = useMemo(() => ({
    app: 'sensitive-media-consent',
    scenario: modes[mode].label,
    consentRequirement: modes[mode].consent,
    riskControl: modes[mode].risk,
    checklist: {
      authorized,
      aiLabel,
      gentle,
      noImpersonation,
    },
    exportNote: '生成前请保存该授权清单；发布时需保留 AI 生成说明。',
  }), [aiLabel, authorized, gentle, mode, noImpersonation]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">{modes[mode].label}授权与发布安全</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">{modes[mode].consent}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['授权确认', authorized, setAuthorized],
              ['AI 生成标注', aiLabel, setAiLabel],
              ['温和克制表达', gentle, setGentle],
              ['不冒充真实发言', noImpersonation, setNoImpersonation],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
                {label as string}
              </label>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-600">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
            {modes[mode].risk}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">授权 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="sensitive-media-consent.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[240px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </section>

      {children}
    </div>
  );
}
