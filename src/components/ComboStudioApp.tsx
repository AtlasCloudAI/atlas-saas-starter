'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Clipboard, Download, FileJson, Route, ShieldCheck, WandSparkles } from 'lucide-react';

type PresetId = 'product-launch' | 'podcast-social' | 'commerce-3d' | 'short-drama' | 'virtual-host';

type PipelineStep = {
  title: string;
  route: string;
  capability: 'image' | 'audio' | 'video' | '3d' | 'llm' | 'publish';
  input: string;
  output: string;
  qa: string;
  fallback: string;
};

const presets: {
  id: PresetId;
  title: string;
  note: string;
  audience: string;
  defaultAsset: string;
  defaultGoal: string;
  steps: PipelineStep[];
}[] = [
  {
    id: 'product-launch',
    title: '商品带货成片',
    note: '商品图到卖点脚本、口播视频、发布包。',
    audience: '跨境卖家、品牌增长团队、MCN',
    defaultAsset: '便携式桌面补光灯，3 张产品图和 1 段卖点说明',
    defaultGoal: '生成 3 条竖版带货素材，覆盖抖音、小红书和 TikTok',
    steps: [
      { title: '商品图精修', route: '/product-photo', capability: 'image', input: '产品原图、品牌调性、使用场景', output: '干净主图和生活方式场景图', qa: '产品形态、Logo、材质不能被改错', fallback: '产品主体失真时改用更短 prompt 重新生成' },
      { title: '卖点脚本', route: '/product-recommendation', capability: 'llm', input: '产品图、卖点、目标人群', output: '口播脚本、标题、风险提示', qa: '避免绝对化功效承诺', fallback: '卖点不足时回到人工补充参数/评价' },
      { title: '口播视频', route: '/sales-video', capability: 'video', input: '脚本、产品图、主播风格', output: '竖版口播/解说视频', qa: '首秒出现产品或使用结果', fallback: '先出音频再用社媒视频合成兜底' },
      { title: '发布包', route: '/social-publisher', capability: 'publish', input: '最终视频、产品名、平台', output: '标题、正文、标签、封面提示、JSON', qa: '平台比例和字幕安全区正确', fallback: '按平台手动复制发布文案' },
    ],
  },
  {
    id: 'podcast-social',
    title: '图文解说播客',
    note: '图片/文章到播客音频，再合成社媒视频。',
    audience: '知识博主、课程团队、资讯账号',
    defaultAsset: '一篇行业分析文章、4 张配图和 3 个重点观点',
    defaultGoal: '生成 1 集双主持播客，并导出可发布的竖版社媒视频',
    steps: [
      { title: '图片解说', route: '/image-explainer', capability: 'llm', input: '多张图片、说明目标、受众', output: '解说稿和重点结构', qa: '不要编造图片中不存在的信息', fallback: '改为纯文字摘要，不引用视觉细节' },
      { title: '播客脚本/音频', route: '/podcast', capability: 'audio', input: '文章、图片解说稿、主持人风格', output: '双主持脚本、MP3、社媒视频', qa: '脚本有开场、冲突、总结和 CTA', fallback: '先生成脚本，人工确认后再生成音频' },
      { title: '配乐音效', route: '/soundscape', capability: 'audio', input: '内容情绪和频道调性', output: '循环 BGM 或片头音效', qa: '不盖过人声、不模仿版权旋律', fallback: '禁用 BGM，只保留人声' },
      { title: '发布包', route: '/social-publisher', capability: 'publish', input: '音频/社媒视频、主题、人群', output: '多平台标题、正文、标签、封面提示', qa: '标题不能过度承诺', fallback: '仅导出 JSON 给运营手动发布' },
    ],
  },
  {
    id: 'commerce-3d',
    title: '3D 商品/实体交付',
    note: '商品图到 3D、AR 展示和 POD 订单清单。',
    audience: 'POD 商家、3D 打印工作室、电商品牌',
    defaultAsset: '宠物纪念摆件照片、尺寸要求和预算',
    defaultGoal: '生成 3D 预览、AR 展示说明和可报价生产清单',
    steps: [
      { title: '图生 3D', route: '/image-to-3d', capability: '3d', input: '主体清晰的参考图', output: 'GLB/STL/USDZ 候选资产', qa: '检查主体完整、底座、薄壁和贴图', fallback: '改用文字生 3D 或降低复杂度' },
      { title: '3D 打印下单', route: '/pod-order', capability: '3d', input: '3D 文件、尺寸、材质、授权', output: '报价、质检、客户确认文本', qa: '确认授权和易损结构', fallback: '人工报价，不直接进入生产' },
      { title: 'AR 商品嵌入', route: '/ar-commerce', capability: 'llm', input: '3D 文件、商品页平台', output: 'model-viewer/Shopify/Quick Look 接入方案', qa: '尺寸和真实比例需校准', fallback: '只提供旋转视频预览' },
      { title: '发布包', route: '/social-publisher', capability: 'publish', input: '3D 预览视频和订单卖点', output: '社媒发布素材包', qa: '说明效果图与实体存在误差', fallback: '输出客户确认文本，不公开发布' },
    ],
  },
  {
    id: 'short-drama',
    title: '短剧/IP 连载',
    note: '设定、分镜、视频和多语言发布串联。',
    audience: '短剧团队、虚拟 IP、剧情号',
    defaultAsset: '原创角色设定、3 张参考图和第一集梗概',
    defaultGoal: '生成第一集预告、后续 5 集大纲和出海字幕包',
    steps: [
      { title: '剧集设定', route: '/showrunner', capability: 'llm', input: '世界观、角色、目标平台', output: '角色圣经、分集大纲、制作清单', qa: '角色动机和冲突必须清楚', fallback: '先缩小成 3 集短系列' },
      { title: '分镜工作台', route: '/storyboard', capability: 'image', input: '每集大纲、角色参考', output: '镜头图、镜头表、画面风格', qa: '角色外观保持一致', fallback: '关键镜头人工锁定参考图' },
      { title: '短剧视频', route: '/short-drama', capability: 'video', input: '角色参考图、镜头 prompt、台词', output: '带声短剧片段', qa: '动作、对白和镜头衔接不过跳', fallback: '先生成无声镜头再配音' },
      { title: '视频本地化', route: '/video-translate', capability: 'llm', input: '转写/SRT、目标语言、受众', output: '字幕、配音稿、标题、QA 清单', qa: '梗和文化点不能直译', fallback: '只导出字幕和标题，不做口型同步' },
    ],
  },
  {
    id: 'virtual-host',
    title: '虚拟主播直播素材',
    note: '虚拟主播人设、口播视频、直播话术和发布包。',
    audience: '无人直播团队、教育培训、品牌客服',
    defaultAsset: '一个美妆品牌、20 个 SKU 卖点和主播人设',
    defaultGoal: '生成直播间循环讲解素材、互动话术和切片发布包',
    steps: [
      { title: '虚拟主播人设', route: '/virtual-influencer', capability: 'video', input: '人设、品牌调性、参考图', output: '虚拟主播素材', qa: '人设稳定、不过度拟真真人', fallback: '改用原创卡通主播' },
      { title: '口播带货视频', route: '/virtual-model-ad', capability: 'video', input: '商品图、话术、主播风格', output: '口播/展示广告视频', qa: '商品信息和价格不能错', fallback: '先生成音频和静态图视频' },
      { title: '直播间运营', route: '/live-room', capability: 'llm', input: '商品、FAQ、直播节奏', output: '循环脚本、互动问答、场控清单', qa: '敏感问题有转人工/拒答策略', fallback: '人工导播审核后上线' },
      { title: '发布包', route: '/social-publisher', capability: 'publish', input: '直播切片、卖点、平台', output: '短视频标题、正文、标签和封面提示', qa: '避免夸大疗效/收入承诺', fallback: '只导出内部素材清单' },
    ],
  },
];

const capabilityClass: Record<PipelineStep['capability'], string> = {
  image: 'bg-sky-50 text-sky-700 border-sky-200',
  audio: 'bg-violet-50 text-violet-700 border-violet-200',
  video: 'bg-rose-50 text-rose-700 border-rose-200',
  '3d': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  llm: 'bg-amber-50 text-amber-700 border-amber-200',
  publish: 'bg-neutral-50 text-neutral-700 border-neutral-200',
};

function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ComboStudioApp() {
  const [presetId, setPresetId] = useState<PresetId>('product-launch');
  const preset = presets.find((item) => item.id === presetId) || presets[0];
  const [asset, setAsset] = useState(preset.defaultAsset);
  const [goal, setGoal] = useState(preset.defaultGoal);
  const [budget, setBudget] = useState('先用低成本图片/音频打样，付费后再生成高清视频或 3D');
  const [humanReview, setHumanReview] = useState(true);
  const [exported, setExported] = useState(false);

  function applyPreset(id: PresetId) {
    const next = presets.find((item) => item.id === id) || presets[0];
    setPresetId(id);
    setAsset(next.defaultAsset);
    setGoal(next.defaultGoal);
    setExported(false);
  }

  const manifest = useMemo(
    () => ({
      app: 'combo-studio',
      preset: preset.title,
      audience: preset.audience,
      asset,
      goal,
      budget,
      humanReview,
      steps: preset.steps,
      handoff: preset.steps.map((step, index) => ({
        order: index + 1,
        appRoute: step.route,
        input: step.input,
        expectedOutput: step.output,
        qualityGate: step.qa,
      })),
      generatedAt: new Date().toISOString(),
    }),
    [asset, budget, goal, humanReview, preset],
  );

  const operatorBrief = `组合工作流：${preset.title}
目标用户：${preset.audience}
素材：${asset}
目标：${goal}
预算策略：${budget}
人工审核：${humanReview ? '每一步进入下一步前必须确认' : '只在最终交付前确认'}

执行顺序：
${preset.steps.map((step, index) => `${index + 1}. ${step.title} ${step.route}
输入：${step.input}
输出：${step.output}
质检：${step.qa}
兜底：${step.fallback}`).join('\n\n')}`;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <WandSparkles className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 组合创意工作流</h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              把图片、视频、音频、3D、LLM 和发布应用串成可执行 pipeline，每一步都能跳转到当前系统里的应用。
            </p>
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-medium">Pipeline preset</div>
            <div className="grid gap-2 md:grid-cols-2">
              {presets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyPreset(item.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    presetId === item.id ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">输入素材</span>
            <textarea
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">交付目标</span>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-300 p-4 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">预算策略</span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
            <input type="checkbox" checked={humanReview} onChange={(e) => setHumanReview(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            每一步进入下一步前人工确认
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setExported(true)} className="btn-brand flex-1">
              <Route className="h-4 w-4" /> 生成 pipeline
            </button>
            <button onClick={() => navigator.clipboard.writeText(operatorBrief)} className="btn-ghost flex-1">
              <Clipboard className="h-4 w-4" /> 复制执行说明
            </button>
          </div>
        </div>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight">执行步骤</h2>
          <div className="mt-5 space-y-3">
            {preset.steps.map((step, index) => (
              <div key={step.route + step.title} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">{index + 1}</span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-xs text-neutral-500">{step.output}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${capabilityClass[step.capability]}`}>{step.capability}</span>
                </div>
                <div className="mt-4 grid gap-3 text-xs leading-5 text-neutral-600 md:grid-cols-2">
                  <div className="rounded-lg bg-neutral-50 p-3">输入：{step.input}</div>
                  <div className="rounded-lg bg-neutral-50 p-3">质检：{step.qa}</div>
                  <div className="rounded-lg bg-neutral-50 p-3 md:col-span-2">失败兜底：{step.fallback}</div>
                </div>
                <Link href={step.route} className="btn-ghost mt-3 w-full text-xs">
                  打开 {step.route}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Pipeline 交付包</h2>
            <button
              onClick={() => downloadFile('combo-studio-pipeline.json', JSON.stringify(manifest, null, 2))}
              className="btn-ghost px-3 py-2 text-xs"
            >
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {[
              `当前 preset：${preset.title}`,
              `目标用户：${preset.audience}`,
              `共 ${preset.steps.length} 个步骤，覆盖 ${Array.from(new Set(preset.steps.map((step) => step.capability))).join(' / ')}。`,
              humanReview ? '已启用人工确认闸口。' : '仅最终交付前人工确认。',
              '每一步都绑定当前本地应用路径，可直接跳转执行。',
            ].map((item) => (
              <div key={item} className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">
            {exported ? operatorBrief : '点击“生成 pipeline”后，这里会显示可复制的执行说明。'}
          </pre>
          {exported && (
            <button onClick={() => downloadFile('combo-studio-brief.txt', operatorBrief, 'text/plain')} className="btn-ghost mt-3 w-full text-xs">
              <Download className="h-3.5 w-3.5" /> 下载执行说明
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
