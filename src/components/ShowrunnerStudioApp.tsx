'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clapperboard, Copy, Download, ImagePlus, Library, ListChecks } from 'lucide-react';

type Genre = 'short-drama' | 'kids' | 'comedy' | 'brand';

const genres: Record<Genre, { label: string; tone: string; guardrail: string }> = {
  'short-drama': { label: '竖屏短剧', tone: '强钩子、高反转、每集末尾留悬念', guardrail: '避免低俗擦边和夸张仇恨冲突' },
  kids: { label: '儿童动画连载', tone: '温暖、安全、重复角色口头禅', guardrail: '需要监护人授权、无恐吓、无个人隐私' },
  comedy: { label: '轻喜剧栏目', tone: '生活化包袱、固定人设、节奏轻快', guardrail: '避免攻击真实个人或群体' },
  brand: { label: '品牌连续剧情', tone: '产品自然入镜、人物关系推动卖点', guardrail: '卖点必须可证明，不夸大疗效' },
};

export function ShowrunnerStudioApp() {
  const [genre, setGenre] = useState<Genre>('short-drama');
  const [seriesName, setSeriesName] = useState('楼下便利店的第 13 个夜班');
  const [premise, setPremise] = useState('一个刚毕业的女孩在便利店夜班遇到各种奇怪顾客，每一集都揭开城市里一个温柔的小秘密。');
  const [characters, setCharacters] = useState('林乔：新人夜班店员，细心但有点社恐；周野：常来买咖啡的外卖骑手，知道很多城市故事；老板：看似冷淡但很护短。');
  const [episodes, setEpisodes] = useState(10);
  const [refs, setRefs] = useState<string[]>([]);
  const [locked, setLocked] = useState(true);
  const [review, setReview] = useState(true);

  function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 8);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    ).then((items) => setRefs((prev) => [...prev, ...items].slice(0, 8)));
    event.target.value = '';
  }

  const bible = useMemo(() => {
    const names = characters
      .split(/[；;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
    return {
      title: seriesName,
      format: genres[genre].label,
      premise,
      tone: genres[genre].tone,
      guardrail: genres[genre].guardrail,
      characterLock: locked,
      reviewRequired: review,
      referenceImages: refs.length,
      characters: names.map((item, index) => ({
        id: `CHAR-${index + 1}`,
        description: item,
        consistencyPrompt: `${item}，same face, same outfit silhouette, consistent vertical short drama character design`,
      })),
    };
  }, [characters, genre, locked, premise, refs.length, review, seriesName]);

  const queue = useMemo(() => (
    Array.from({ length: episodes }, (_, index) => {
      const n = index + 1;
      return {
        episode: n,
        title: `第 ${n} 集：${n % 3 === 0 ? '反转' : n % 2 === 0 ? '误会' : '秘密'}之夜`,
        hook: n === 1 ? '她第一天上夜班，就收到一张写着自己名字的旧收据。' : `上集留下的问题在第 ${n} 集被重新解释，但新的线索出现。`,
        shots: ['3 秒强钩子近景', '人物关系推进', '关键物件特写', '悬念收尾'],
        videoPrompt: `${genres[genre].label}, vertical 9:16, episode ${n}, ${premise}, cinematic but production-friendly, consistent characters, clear emotional beat, ${genres[genre].tone}`,
      };
    })
  ), [episodes, genre, premise]);

  const manifest = useMemo(() => ({
    app: 'showrunner-studio',
    bible,
    productionQueue: queue,
    handoffRoutes: ['/short-drama', '/storyboard', '/account-matrix', genre === 'kids' ? '/kids-book' : '/brand-campaign'],
  }), [bible, genre, queue]);

  const json = JSON.stringify(manifest, null, 2);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Clapperboard className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Showrunner 连续内容台</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">把一个设定拆成角色圣经、分集队列、镜头提示词和账号排产资产。</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {(Object.keys(genres) as Genre[]).map((key) => (
            <button
              key={key}
              onClick={() => setGenre(key)}
              className={`rounded-lg border p-4 text-left transition ${genre === key ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <p className="text-sm font-semibold">{genres[key].label}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{genres[key].tone}</p>
            </button>
          ))}
        </div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">项目名</span>
              <input value={seriesName} onChange={(e) => setSeriesName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">集数</span>
              <input type="number" min={3} max={30} value={episodes} onChange={(e) => setEpisodes(Math.max(3, Math.min(30, Number(e.target.value) || 3)))} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">一句话设定</span>
            <textarea value={premise} onChange={(e) => setPremise(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">角色设定</span>
            <textarea value={characters} onChange={(e) => setCharacters(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-600 hover:border-brand-300 hover:text-brand-600">
              <ImagePlus className="h-4 w-4" />
              上传角色/场景参考
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              锁定角色一致性
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
              <input type="checkbox" checked={review} onChange={(e) => setReview(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
              审片清单
            </label>
          </div>

          {refs.length > 0 && (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
              {refs.map((src, index) => (
                <div key={`${src.slice(0, 20)}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`参考 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {queue.slice(0, 6).map((item) => (
            <div key={item.episode} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <CalendarDays className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-2 text-sm text-brand-700">{item.hook}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.shots.map((shot) => <span key={shot} className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{shot}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">角色圣经</h2>
          </div>
          <div className="mt-4 space-y-3">
            {bible.characters.map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs font-semibold text-neutral-500">{item.id}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold">执行路径</h2>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-neutral-600">
            {manifest.handoffRoutes.map((route) => <span key={route} className="rounded-lg bg-neutral-50 px-3 py-2">{route}</span>)}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold">项目 JSON</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(json)} className="btn-ghost px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />复制</button>
              <a href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`} download="showrunner-project.json" className="btn-ghost px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />下载</a>
            </div>
          </div>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-700">{json}</pre>
        </div>
      </aside>
    </div>
  );
}
