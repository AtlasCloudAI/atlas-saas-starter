'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  AlertCircle,
  BookOpen,
  Clapperboard,
  Download,
  Film,
  Loader2,
  MapPin,
  Users,
  Video,
  Wand2,
} from 'lucide-react';

const COSTS = { plan: 4, scene: 8, character: 8, panel: 10, video: 12, voice: 5 };

const STYLES: { key: string; label: string }[] = [
  { key: 'anime', label: '日系动漫' },
  { key: 'manhua', label: '国漫/国风' },
  { key: 'realistic', label: '写实电影' },
  { key: 'ink', label: '水墨' },
  { key: 'pixar', label: '3D 动画' },
];

type Slot = { status: 'idle' | 'processing' | 'done' | 'failed'; url?: string };
type Character = { id: string; name: string; gender: string; refPrompt: string; brief: string };
type Scene = { id: string; name: string; refPrompt: string };
type Panel = {
  index: number;
  sceneId?: string;
  sceneDesc: string;
  imagePrompt: string;
  cameraShot: string;
  shotSize: string;
  characterIds: string[];
  speakerId?: string;
  line?: string;
  caption: string;
  motion: string;
};
type ComicPlan = { title: string; logline: string; style: string; characters: Character[]; scenes: Scene[]; panels: Panel[] };

async function postJson(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'failed');
  return j;
}

function pollCreation(id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let n = 0;
    const t = setInterval(async () => {
      n += 1;
      if (n > 240) {
        clearInterval(t);
        reject(new Error('timeout'));
        return;
      }
      try {
        const c = await (await fetch(`/api/creations/${id}`)).json();
        if (c.status === 'completed') {
          clearInterval(t);
          resolve((Array.isArray(c.outputs) ? c.outputs : [])[0] || '');
        } else if (c.status === 'failed') {
          clearInterval(t);
          reject(new Error('failed'));
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  });
}

function errText(code: string) {
  if (code === 'insufficient_credits') return '积分不足,请到定价页充值。';
  if (code === 'story_required') return '请先填写一段剧情/故事。';
  if (code === 'plan_failed') return '脚本生成失败(模型未返回有效结果),请重试或换个描述。';
  return `出错了:${code}`;
}

export default function ComicStudioPage() {
  const { data: session } = useSession();
  const [story, setStory] = useState('');
  const [style, setStyle] = useState('anime');
  const [ratio, setRatio] = useState('16:9');
  const [panelCount, setPanelCount] = useState(8);
  const [language, setLanguage] = useState('中文');
  const [plan, setPlan] = useState<ComicPlan | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chars, setChars] = useState<Record<string, Slot>>({});
  const [scenes, setScenes] = useState<Record<string, Slot>>({});
  const [panelImgs, setPanelImgs] = useState<Record<number, Slot>>({});
  const [panelVids, setPanelVids] = useState<Record<number, Slot>>({});

  const allAssetsDone =
    !!plan &&
    plan.characters.length > 0 &&
    plan.characters.every((c) => chars[c.id]?.status === 'done') &&
    plan.scenes.every((s) => scenes[s.id]?.status === 'done');
  const allPanelsDone = !!plan && plan.panels.length > 0 && plan.panels.every((p) => panelImgs[p.index]?.status === 'done');

  async function genPlan() {
    if (!session) return signIn('google');
    if (story.trim().length < 10) return setErr('请先填写一段剧情/故事(至少 10 字)。');
    setErr(null);
    setBusy('plan');
    setPlan(null);
    setChars({});
    setScenes({});
    setPanelImgs({});
    setPanelVids({});
    try {
      const j = await postJson('/api/comic/plan', { story, style, language, panelCount });
      setPlan(j.plan);
      window.dispatchEvent(new Event('atlas:credits'));
    } catch (e) {
      setErr(errText(e instanceof Error ? e.message : 'failed'));
    }
    setBusy(null);
  }

  async function genAssets() {
    if (!plan) return;
    setErr(null);
    setBusy('assets');
    const jobs: Promise<unknown>[] = [];
    for (const c of plan.characters) {
      setChars((s) => ({ ...s, [c.id]: { status: 'processing' } }));
      jobs.push(
        postJson('/api/comic/character', { character: c, style })
          .then((j) => pollCreation(j.id))
          .then((url) => setChars((s) => ({ ...s, [c.id]: { status: 'done', url } })))
          .catch(() => setChars((s) => ({ ...s, [c.id]: { status: 'failed' } }))),
      );
    }
    for (const sc of plan.scenes) {
      setScenes((s) => ({ ...s, [sc.id]: { status: 'processing' } }));
      jobs.push(
        postJson('/api/comic/scene', { scene: sc, style, aspectRatio: ratio })
          .then((j) => pollCreation(j.id))
          .then((url) => setScenes((s) => ({ ...s, [sc.id]: { status: 'done', url } })))
          .catch(() => setScenes((s) => ({ ...s, [sc.id]: { status: 'failed' } }))),
      );
    }
    window.dispatchEvent(new Event('atlas:credits'));
    await Promise.all(jobs);
    setBusy(null);
  }

  async function genPanels() {
    if (!plan) return;
    setErr(null);
    setBusy('panels');
    const jobs = plan.panels.map((p) => {
      const ids = p.characterIds.filter((id) => chars[id]?.status === 'done');
      const charRefUrls = ids.map((id) => chars[id]!.url!).filter(Boolean);
      const charNames = ids.map((id) => plan.characters.find((c) => c.id === id)?.name || '').filter(Boolean);
      const sceneRefUrl = p.sceneId && scenes[p.sceneId]?.status === 'done' ? scenes[p.sceneId]!.url : undefined;
      setPanelImgs((s) => ({ ...s, [p.index]: { status: 'processing' } }));
      return postJson('/api/comic/panel', { panel: p, charRefUrls, charNames, sceneRefUrl, style, aspectRatio: ratio })
        .then((j) => pollCreation(j.id))
        .then((url) => setPanelImgs((s) => ({ ...s, [p.index]: { status: 'done', url } })))
        .catch(() => setPanelImgs((s) => ({ ...s, [p.index]: { status: 'failed' } })));
    });
    window.dispatchEvent(new Event('atlas:credits'));
    await Promise.all(jobs);
    setBusy(null);
  }

  async function genVideos() {
    if (!plan) return;
    setErr(null);
    setBusy('videos');
    const jobs = plan.panels.map((p) => {
      const img = panelImgs[p.index];
      if (img?.status !== 'done' || !img.url) return Promise.resolve();
      setPanelVids((s) => ({ ...s, [p.index]: { status: 'processing' } }));
      return postJson('/api/comic/video', {
        panelImageUrl: img.url,
        panel: { index: p.index, line: p.line, motion: p.motion },
        withAudio: !!p.line,
      })
        .then((j) => pollCreation(j.id))
        .then((url) => setPanelVids((s) => ({ ...s, [p.index]: { status: 'done', url } })))
        .catch(() => setPanelVids((s) => ({ ...s, [p.index]: { status: 'failed' } })));
    });
    window.dispatchEvent(new Event('atlas:credits'));
    await Promise.all(jobs);
    setBusy(null);
  }

  const dl = (url: string) => `/api/download?url=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Clapperboard className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 漫剧工厂</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            一段剧情 → 有电影镜头语言的连续漫剧:自动拆<b>角色库 + 场景库</b>,每格分镜喂同一套参考图
            <b>锁人物 + 锁场景一致</b>,专业分镜(景别切换/过肩/景深)+ 运镜,再逐格图生视频。gemini · nano-banana-pro · seedance-2.0。
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* —— 左:输入 —— */}
        <section className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">1</span>
              剧情 / 故事
            </h2>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={7}
              placeholder="粘一段小说片段,或写一句创意。例:深夜街角的面馆,一个疲惫的上班族女孩走进来,沉默的老板默默多加了一个荷包蛋…"
              className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <label className="mb-1.5 mt-4 block text-sm font-medium">画面风格</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    style === s.key ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">画幅</span>
                <div className="flex gap-2">
                  {['16:9', '9:16'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                        ratio === r ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {r === '16:9' ? '横屏 16:9' : '竖屏 9:16'}
                    </button>
                  ))}
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">分镜数 ({panelCount})</span>
                <input
                  type="range"
                  min={4}
                  max={12}
                  value={panelCount}
                  onChange={(e) => setPanelCount(Number(e.target.value))}
                  className="mt-2 w-full accent-brand-600"
                />
              </label>
            </div>
            <label className="mb-1.5 mt-3 block text-sm font-medium">台词/字幕语言</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <button onClick={genPlan} disabled={busy !== null} className="btn-brand mt-4 w-full">
              {busy === 'plan' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 正在拆解剧情 + 排专业分镜…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> 生成漫剧脚本 · {COSTS.plan} 积分
                </>
              )}
            </button>
            {err && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {err}
              </p>
            )}
          </div>

          {plan && (
            <div className="card space-y-3 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">2</span>
                制作流程
              </h2>
              <div className="text-sm">
                <div className="font-semibold">{plan.title}</div>
                <div className="text-xs text-neutral-500">{plan.logline}</div>
              </div>
              <div className="space-y-2">
                <button onClick={genAssets} disabled={busy !== null} className="btn-brand w-full">
                  {busy === 'assets' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  ① 建角色库 + 场景库 · {plan.characters.length * COSTS.character + plan.scenes.length * COSTS.scene} 积分
                </button>
                <button onClick={genPanels} disabled={busy !== null || !allAssetsDone} className="btn-brand w-full disabled:opacity-40">
                  {busy === 'panels' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                  ② 生成分镜图(锁人+锁景) · {plan.panels.length * COSTS.panel} 积分
                </button>
                <button onClick={genVideos} disabled={busy !== null || !allPanelsDone} className="btn-brand w-full disabled:opacity-40">
                  {busy === 'videos' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  ③ 分镜逐格出片(带运镜) · {plan.panels.length * COSTS.video} 积分
                </button>
              </div>
              <p className="rounded-lg bg-neutral-50 p-2.5 text-xs leading-5 text-neutral-500">
                角色库锁人物、场景库锁环境;分镜按所属场景喂图,跨格不崩。整片拼接可下载各段后合成(后端合成 worker 规划中)。
              </p>
            </div>
          )}
        </section>

        {/* —— 右:输出 —— */}
        <section className="space-y-5">
          {!plan && (
            <div className="card flex min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center text-neutral-300">
              <BookOpen className="h-10 w-10" />
              <p className="text-sm">左侧写一段剧情并生成脚本,这里会长出角色库、场景库和一整部分镜漫剧。</p>
            </div>
          )}

          {plan && (
            <>
              {/* 资产库:角色 + 场景 */}
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-brand-500" /> 角色库
                  <span className="ml-1 text-xs font-normal text-neutral-400">(跨格一致性来源)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {plan.characters.map((c) => {
                    const slot = chars[c.id] || { status: 'idle' };
                    return (
                      <div key={c.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                        <div className="flex aspect-[3/4] items-center justify-center bg-neutral-100">
                          {slot.status === 'done' && slot.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slot.url} alt={c.name} className="h-full w-full object-cover" />
                          ) : slot.status === 'processing' ? (
                            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                          ) : slot.status === 'failed' ? (
                            <AlertCircle className="h-6 w-6 text-red-400" />
                          ) : (
                            <Users className="h-6 w-6 text-neutral-300" />
                          )}
                        </div>
                        <div className="px-2.5 py-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-700">{c.name}</span>
                            {slot.status === 'done' && slot.url && (
                              <a href={dl(slot.url)} className="text-brand-600 hover:text-brand-700">
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {c.brief && <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-neutral-400">{c.brief}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {plan.scenes.length > 0 && (
                  <>
                    <h3 className="mb-3 mt-5 flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="h-4 w-4 text-brand-500" /> 场景库
                      <span className="ml-1 text-xs font-normal text-neutral-400">(锁环境一致)</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {plan.scenes.map((sc) => {
                        const slot = scenes[sc.id] || { status: 'idle' };
                        return (
                          <div key={sc.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                            <div className="flex aspect-video items-center justify-center bg-neutral-100">
                              {slot.status === 'done' && slot.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={slot.url} alt={sc.name} className="h-full w-full object-cover" />
                              ) : slot.status === 'processing' ? (
                                <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                              ) : slot.status === 'failed' ? (
                                <AlertCircle className="h-6 w-6 text-red-400" />
                              ) : (
                                <MapPin className="h-6 w-6 text-neutral-300" />
                              )}
                            </div>
                            <div className="flex items-center justify-between px-2.5 py-1.5">
                              <span className="text-xs font-semibold text-neutral-700">{sc.name}</span>
                              {slot.status === 'done' && slot.url && (
                                <a href={dl(slot.url)} className="text-brand-600 hover:text-brand-700">
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* 分镜 */}
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Film className="h-4 w-4 text-brand-500" /> 分镜(图 → 视频)
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {plan.panels.map((p) => {
                    const img = panelImgs[p.index] || { status: 'idle' };
                    const vid = panelVids[p.index] || { status: 'idle' };
                    const speaker = p.speakerId ? plan.characters.find((c) => c.id === p.speakerId)?.name : '';
                    return (
                      <div key={p.index} className="overflow-hidden rounded-xl border border-neutral-200">
                        <div className={`flex items-center justify-center bg-neutral-100 ${ratio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                          {vid.status === 'done' && vid.url ? (
                            <video src={vid.url} controls className="h-full w-full object-cover" />
                          ) : img.status === 'done' && img.url ? (
                            <div className="relative h-full w-full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={`panel ${p.index + 1}`} className="h-full w-full object-cover" />
                              {vid.status === 'processing' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                                </div>
                              )}
                            </div>
                          ) : img.status === 'processing' ? (
                            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                          ) : img.status === 'failed' || vid.status === 'failed' ? (
                            <AlertCircle className="h-6 w-6 text-red-400" />
                          ) : (
                            <span className="text-xs text-neutral-300">镜 {p.index + 1}</span>
                          )}
                        </div>
                        <div className="space-y-1 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-brand-600">
                              镜 {p.index + 1} · {p.cameraShot || p.shotSize}
                            </span>
                            {vid.status === 'done' && vid.url && (
                              <a href={dl(vid.url)} className="text-brand-600 hover:text-brand-700">
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">{p.sceneDesc}</p>
                          {p.line && (
                            <p className="text-xs font-medium text-neutral-700">
                              {speaker ? `${speaker}:` : ''}「{p.line}」
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
