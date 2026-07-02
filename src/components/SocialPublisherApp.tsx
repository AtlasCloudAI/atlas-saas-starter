'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { CheckCircle2, Clipboard, Download, ImagePlus, Music, PlaySquare, Sparkles } from 'lucide-react';

type Platform = 'douyin' | 'xiaohongshu' | 'tiktok' | 'shorts' | 'reels';

const platforms: { id: Platform; label: string; ratio: string; caption: string; tags: string[] }[] = [
  { id: 'douyin', label: '抖音', ratio: '9:16', caption: '强 hook + 口语化 CTA', tags: ['#好物分享', '#测评', '#实用好物'] },
  { id: 'xiaohongshu', label: '小红书', ratio: '3:4 / 9:16', caption: '体验感标题 + 清单式正文', tags: ['#生活方式', '#真实体验', '#种草'] },
  { id: 'tiktok', label: 'TikTok', ratio: '9:16', caption: '英文短句 + fast hook', tags: ['#tiktokmademebuyit', '#finds', '#review'] },
  { id: 'shorts', label: 'YouTube Shorts', ratio: '9:16', caption: '搜索关键词 + 明确价值', tags: ['#shorts', '#review', '#howto'] },
  { id: 'reels', label: 'Instagram Reels', ratio: '9:16 / 1:1', caption: '轻量故事感 + 视觉标签', tags: ['#reels', '#lifestyle', '#creator'] },
];

function splitWords(value: string) {
  return value
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function SocialPublisherApp() {
  const [assetName, setAssetName] = useState('便携式桌面补光灯');
  const [audience, setAudience] = useState('独居租房、视频会议、短视频创作者');
  const [promise, setPromise] = useState('让桌面拍摄和视频会议看起来更干净、更专业');
  const [keywords, setKeywords] = useState('便携,显色自然,USB-C,不占空间,适合租房');
  const [selected, setSelected] = useState<Platform[]>(['douyin', 'xiaohongshu', 'tiktok']);
  const [generated, setGenerated] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [audioName, setAudioName] = useState('');

  function onImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 6);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    ).then((items) => setImages((prev) => [...prev, ...items].slice(0, 6)));
    event.target.value = '';
  }

  function onAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAudioName(file?.name || '');
    event.target.value = '';
  }

  const keywordList = useMemo(() => splitWords(keywords), [keywords]);
  const selectedPlatforms = platforms.filter((platform) => selected.includes(platform.id));
  const hook = `${assetName} 不是让你多买一个灯，而是把${promise}这件事变简单。`;

  const packages = selectedPlatforms.map((platform, index) => {
    const title =
      platform.id === 'xiaohongshu'
        ? `${assetName}真实使用：我最在意这 ${Math.min(keywordList.length || 3, 5)} 点`
        : `${index + 1}. ${assetName}: ${promise}`;
    const caption = [
      hook,
      `适合：${audience}`,
      keywordList.length ? `重点：${keywordList.join(' / ')}` : '',
      platform.caption,
      `CTA：想要我把素材拆成 ${platform.label} 版本，可以直接套这个结构发。`,
    ]
      .filter(Boolean)
      .join('\n');
    return {
      ...platform,
      title,
      caption,
      hashtags: [...platform.tags, ...keywordList.slice(0, 3).map((item) => `#${item.replace(/\s+/g, '')}`)],
      cover: `${assetName} 使用前后对比 + 3 个卖点短字，画面保留 20% 留白`,
      imageAudioRecipe: `用 ${Math.max(images.length, 1)} 张图片做轻微推拉镜头，叠加 ${audioName || '播客/解说音频'}，导出 ${platform.ratio} 静态图转短视频版本。`,
      checklist: [
        `导出 ${platform.ratio} 画幅，主文件命名 ${assetName}-${platform.id}-v1.mp4`,
        '首秒必须出现产品或结果，不用空镜开头',
        '图片+音频场景需要导出为 MP4/MOV，不能只上传独立音频',
        '字幕不遮挡产品主体，底部保留平台按钮区域',
        '正文避免绝对化承诺，保留真实体验语气',
      ],
    };
  });

  const manifest = {
    assetName,
    audience,
    promise,
    keywords: keywordList,
    sourceImages: images.length,
    sourceAudio: audioName || null,
    generatedAt: new Date().toISOString(),
    packages,
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <PlaySquare className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 社媒发布包</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              输入图片、音频或视频资产，直接产出多平台标题、正文、标签、封面提示、图音转视频方案和发布检查清单。
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">资产/产品名称</span>
            <input value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">目标人群</span>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">核心卖点/视频价值</span>
            <textarea value={promise} onChange={(e) => setPromise(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">关键词</span>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <div>
            <div className="mb-2 text-sm font-medium">平台</div>
            <div className="grid gap-2 sm:grid-cols-5">
              {platforms.map((platform) => (
                <label key={platform.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(platform.id)}
                    onChange={(e) => {
                      setSelected((current) =>
                        e.target.checked ? [...current, platform.id] : current.filter((item) => item !== platform.id),
                      );
                    }}
                  />
                  {platform.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-3 text-sm text-neutral-600 hover:border-brand-300 hover:text-brand-600">
              <ImagePlus className="h-4 w-4" />
              上传发布图片
              <input type="file" accept="image/*" multiple onChange={onImages} className="hidden" />
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-3 text-sm text-neutral-600 hover:border-brand-300 hover:text-brand-600">
              <Music className="h-4 w-4" />
              上传解说音频
              <input type="file" accept="audio/*" onChange={onAudio} className="hidden" />
            </label>
          </div>
          {(images.length > 0 || audioName) && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {images.map((src, index) => (
                    <div key={`${src.slice(0, 20)}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`发布图 ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {audioName && <p className="mt-3 flex items-center gap-2 text-xs text-neutral-600"><Music className="h-3.5 w-3.5" />{audioName}</p>}
            </div>
          )}
          <p className="rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-600">
            图音转短视频方案会把多张图片做轻微推拉镜头，叠加解说音频并导出 MP4/MOV，适配各平台上传规则。
          </p>
          <button onClick={() => setGenerated(true)} className="btn-brand w-full">
            <Sparkles className="h-4 w-4" /> 生成发布包
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">发布包结果</h2>
            {generated && (
              <button
                onClick={() => downloadFile('social-publisher-package.json', JSON.stringify(manifest, null, 2), 'application/json')}
                className="btn-ghost px-3 py-2 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> JSON
              </button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            {generated ? (
              packages.map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{item.label}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-xs text-neutral-500">{item.ratio}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{item.title}</p>
                  <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-5 text-neutral-600">{item.caption}</pre>
                  <p className="mt-3 text-xs text-brand-700">{item.hashtags.join(' ')}</p>
                  <p className="mt-3 text-xs leading-5 text-neutral-500">封面：{item.cover}</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">图音视频：{item.imageAudioRecipe}</p>
                  <ul className="mt-3 space-y-1 text-xs leading-5 text-neutral-500">
                    {item.checklist.map((check) => (
                      <li key={check} className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {check}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigator.clipboard.writeText(item.caption)} className="btn-ghost mt-3 w-full text-xs">
                    <Clipboard className="h-3.5 w-3.5" /> 复制正文
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400">
                生成后会显示每个平台的标题、正文、标签和检查清单。
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
