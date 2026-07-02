'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  AlertCircle,
  BookOpenText,
  CheckCircle2,
  Download,
  GraduationCap,
  ImageIcon,
  Loader2,
  Mic2,
  Sparkles,
  UserRound,
  Video,
  Wand2,
} from 'lucide-react';

const COSTS = { plan: 3, slide: 12, audio: 6, avatar: 20 };
const TEACHER_PROMPT =
  'Photorealistic friendly female instructor looking straight at the camera, upper body, smart casual, soft studio/office background blurred, natural light, professional online-course presenter.';

type Slot = { status: 'idle' | 'processing' | 'done' | 'failed'; url?: string };
type Quiz = { q: string; options: string[]; answer: string };
type Lesson = { title: string; script: string; imagePrompt: string; quiz: Quiz };
type Plan = { title: string; lessons: Lesson[] };
type LessonAssets = { slide: Slot; audio: Slot; video: Slot };

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
      if (n > 240) { clearInterval(t); reject(new Error('timeout')); return; }
      try {
        const c = await (await fetch(`/api/creations/${id}`)).json();
        if (c.status === 'completed') { clearInterval(t); resolve((Array.isArray(c.outputs) ? c.outputs : [])[0] || ''); }
        else if (c.status === 'failed') { clearInterval(t); reject(new Error('failed')); }
      } catch { /* keep polling */ }
    }, 3000);
  });
}
function errText(code: string) {
  if (code === 'insufficient_credits') return '积分不足,请到定价页充值。';
  if (code === 'topic_required') return '请填写课程主题或粘贴材料。';
  if (code === 'plan_failed') return '课程方案生成失败,请重试。';
  return `出错了:${code}`;
}

export default function CourseStudioPage() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [language, setLanguage] = useState('中文');
  const [lessons, setLessons] = useState(3);
  const [withTeacher, setWithTeacher] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [teacher, setTeacher] = useState<Slot>({ status: 'idle' });
  const [assets, setAssets] = useState<LessonAssets[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const est = plan
    ? COSTS.plan + (withTeacher ? COSTS.slide : 0) + plan.lessons.length * (COSTS.slide + COSTS.audio + (withTeacher ? COSTS.avatar : 0))
    : COSTS.plan;

  async function genPlan() {
    if (!session) return signIn('google');
    if (topic.trim().length < 2 && material.trim().length < 20) return setErr('请填写课程主题或粘贴材料。');
    setErr(null);
    setBusy('plan');
    try {
      const j = await postJson('/api/course/plan', { topic, material, language, lessons });
      setPlan(j.plan);
      setAssets(j.plan.lessons.map(() => ({ slide: { status: 'idle' }, audio: { status: 'idle' }, video: { status: 'idle' } })));
      setTeacher({ status: 'idle' });
      window.dispatchEvent(new Event('atlas:credits'));
    } catch (e) {
      setErr(errText(e instanceof Error ? e.message : 'failed'));
    }
    setBusy(null);
  }

  function setLesson(i: number, key: keyof LessonAssets, slot: Slot) {
    setAssets((a) => a.map((x, idx) => (idx === i ? { ...x, [key]: slot } : x)));
  }

  async function genCourse() {
    if (!plan) return;
    setErr(null);
    setBusy('kit');
    try {
      // 讲师开关:先生成一张讲师肖像(所有节共用)
      let teacherUrl = '';
      if (withTeacher) {
        setTeacher({ status: 'processing' });
        const tj = await postJson('/api/course/slide', { prompt: TEACHER_PROMPT, aspectRatio: '3:4' });
        teacherUrl = await pollCreation(tj.id);
        setTeacher({ status: 'done', url: teacherUrl });
      }
      window.dispatchEvent(new Event('atlas:credits'));

      await Promise.all(
        plan.lessons.map(async (l, i) => {
          // 配图
          setLesson(i, 'slide', { status: 'processing' });
          const sj = await postJson('/api/course/slide', { prompt: l.imagePrompt, aspectRatio: '16:9' });
          const slideUrl = await pollCreation(sj.id).catch(() => '');
          setLesson(i, 'slide', slideUrl ? { status: 'done', url: slideUrl } : { status: 'failed' });
          // 口播音频
          setLesson(i, 'audio', { status: 'processing' });
          const aj = await postJson('/api/sku/ugc', { script: l.script });
          const audioUrl = await pollCreation(aj.id).catch(() => '');
          setLesson(i, 'audio', audioUrl ? { status: 'done', url: audioUrl } : { status: 'failed' });
          // 讲师视频(可选)
          if (withTeacher && teacherUrl && audioUrl) {
            setLesson(i, 'video', { status: 'processing' });
            try {
              const vj = await postJson('/api/sku/avatar', { actorImage: teacherUrl, audioUrl });
              const videoUrl = await pollCreation(vj.id);
              setLesson(i, 'video', { status: 'done', url: videoUrl });
            } catch {
              setLesson(i, 'video', { status: 'failed' });
            }
          }
        }),
      );
      window.dispatchEvent(new Event('atlas:credits'));
    } catch (e) {
      setErr(errText(e instanceof Error ? e.message : 'failed'));
    }
    setBusy(null);
  }

  const dl = (url: string) => `/api/download?url=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <GraduationCap className="h-6 w-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">AI 课程工厂</h1>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">⭐ 精品</span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            主题或材料 → 大纲/讲稿 → 每节配图 + 口播 +(可选)数字人讲师 + 测验。分节生成,音画按节同步。
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        说明:本页分节生成课程素材(配图 / 口播 / 讲师视频 / 测验),可分别预览下载。<b>拼成一条完整成片</b>(片头+分栏+拼接)由后端渲染,是紧接的下一步。
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* 左:输入 */}
        <section className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">1</span>
              课程主题 / 材料
            </h2>
            <label className="mb-1.5 block text-sm font-medium">主题(一句话)</label>
            <input
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPlan(null); }}
              placeholder="如:手冲咖啡入门 / 新员工安全培训"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <label className="mb-1.5 mt-4 block text-sm font-medium">或粘贴材料(可选,课程会严格基于它)</label>
            <textarea
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setPlan(null); }}
              rows={5}
              placeholder="粘贴一段文档 / 手册 / 文章,AI 会基于它生成课程(比凭空更可靠)"
              className="w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">语言</span>
                <input value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-500">节数</span>
                <select value={lessons} onChange={(e) => setLessons(Number(e.target.value))} className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                  {[2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v} 节</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <span className="flex items-center gap-2 text-sm font-medium"><UserRound className="h-4 w-4 text-brand-500" /> 加数字人讲师(口播出镜)</span>
              <input type="checkbox" checked={withTeacher} onChange={(e) => setWithTeacher(e.target.checked)} className="h-5 w-5 accent-brand-500" />
            </label>
            <button onClick={genPlan} disabled={busy !== null} className="btn-brand mt-4 w-full">
              {busy === 'plan' ? <><Loader2 className="h-4 w-4 animate-spin" /> 生成大纲中…</> : <><Wand2 className="h-4 w-4" /> 生成课程方案 · {COSTS.plan} 积分</>}
            </button>
            {err && <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" /> {err}</p>}
          </div>

          {plan && (
            <div className="card space-y-3 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">2</span>
                方案确认
              </h2>
              <div className="text-sm font-semibold">{plan.title}</div>
              <ol className="list-inside list-decimal space-y-1 text-sm text-neutral-600">
                {plan.lessons.map((l, i) => <li key={i}>{l.title}</li>)}
              </ol>
              <div className="rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                将生成:{plan.lessons.length} 节配图 + {plan.lessons.length} 段口播{withTeacher ? ` + 讲师肖像 + ${plan.lessons.length} 段讲师视频` : '(无讲师)'} + 测验。
              </div>
              <button onClick={genCourse} disabled={busy !== null} className="btn-brand w-full">
                {busy === 'kit' ? <><Loader2 className="h-4 w-4 animate-spin" /> 生成课程素材中…{withTeacher ? '(含讲师视频,较久)' : ''}</> : <><Sparkles className="h-4 w-4" /> 生成课程素材 · 约 {est} 积分</>}
              </button>
            </div>
          )}
        </section>

        {/* 右:课程素材 */}
        <section className="space-y-5">
          {!plan && (
            <div className="card flex min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center text-neutral-300">
              <BookOpenText className="h-10 w-10" />
              <p className="text-sm">左侧填主题/材料并生成方案,这里会长出逐节课程素材。</p>
            </div>
          )}

          {plan && withTeacher && (
            <div className="card flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {teacher.status === 'done' && teacher.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teacher.url} alt="teacher" className="h-full w-full object-cover" />
                ) : teacher.status === 'processing' ? <Loader2 className="h-5 w-5 animate-spin text-brand-400" /> : <UserRound className="h-6 w-6 text-neutral-300" />}
              </div>
              <div className="text-sm text-neutral-600">数字人讲师(所有节共用同一形象)</div>
            </div>
          )}

          {plan && plan.lessons.map((l, i) => {
            const a = assets[i] || { slide: { status: 'idle' }, audio: { status: 'idle' }, video: { status: 'idle' } };
            return (
              <div key={i} className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">第 {i + 1} 节</span> {l.title}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 配图 */}
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="flex aspect-video items-center justify-center bg-neutral-100">
                      {a.slide.status === 'done' && a.slide.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.slide.url} alt="slide" className="h-full w-full object-cover" />
                      ) : a.slide.status === 'processing' ? <Loader2 className="h-6 w-6 animate-spin text-brand-400" /> : a.slide.status === 'failed' ? <AlertCircle className="h-6 w-6 text-red-400" /> : <ImageIcon className="h-6 w-6 text-neutral-300" />}
                    </div>
                    {a.slide.status === 'done' && a.slide.url && <a href={dl(a.slide.url)} className="flex items-center justify-center gap-1 py-1.5 text-xs text-brand-600"><Download className="h-3.5 w-3.5" /> 配图</a>}
                  </div>
                  {/* 讲师视频 or 占位 */}
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="flex aspect-video items-center justify-center bg-neutral-100">
                      {withTeacher ? (
                        a.video.status === 'done' && a.video.url ? <video src={a.video.url} controls className="h-full w-full object-cover" />
                          : a.video.status === 'processing' ? <div className="flex flex-col items-center gap-1 text-neutral-400"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /><span className="text-xs">讲师视频~6min</span></div>
                            : a.video.status === 'failed' ? <AlertCircle className="h-6 w-6 text-red-400" /> : <Video className="h-6 w-6 text-neutral-300" />
                      ) : <span className="text-xs text-neutral-300">无讲师(纯配图+旁白)</span>}
                    </div>
                    {a.video.status === 'done' && a.video.url && <a href={dl(a.video.url)} className="flex items-center justify-center gap-1 py-1.5 text-xs text-brand-600"><Download className="h-3.5 w-3.5" /> 讲师视频</a>}
                  </div>
                </div>
                {/* 口播音频 */}
                <div className="mt-3 flex items-center gap-3">
                  <Mic2 className="h-4 w-4 shrink-0 text-brand-500" />
                  {a.audio.status === 'done' && a.audio.url ? <audio src={a.audio.url} controls className="h-9 w-full" />
                    : a.audio.status === 'processing' ? <span className="flex items-center gap-1 text-xs text-neutral-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> 口播生成中</span>
                      : a.audio.status === 'failed' ? <span className="text-xs text-red-500">口播失败</span> : <span className="text-xs text-neutral-300">口播音频</span>}
                </div>
                {/* 讲稿 + 测验 */}
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-xs font-medium text-neutral-500">讲稿 & 测验</summary>
                  <p className="mt-2 leading-6 text-neutral-600">{l.script}</p>
                  {l.quiz?.q && (
                    <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-xs">
                      <div className="font-medium">{l.quiz.q}</div>
                      <ul className="mt-1 space-y-0.5 text-neutral-600">{l.quiz.options.map((o, j) => <li key={j} className={o.startsWith(l.quiz.answer) ? 'font-semibold text-green-700' : ''}>{o}</li>)}</ul>
                    </div>
                  )}
                </details>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
