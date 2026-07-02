import { Wand2 } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function AdVariantsPage() {
  return (
    <MediaVideoToolApp
      kind="video-edit"
      title="AI 广告 A/B 变体"
      subtitle="上传已有广告视频，用一句话生成不同 hook、卖点、CTA、背景或节奏的投放变体。"
      icon={<Wand2 className="h-6 w-6" />}
      defaultPrompt="Create an A/B test variant of this ad: keep the product accurate, make the first 2 seconds more attention-grabbing, tighten pacing, add clearer CTA space, preserve brand-safe style."
      examples={[
        { title: '痛点开场', note: '投放常用 hook。', prompt: 'Edit this ad into a pain-point hook variant: open with the user problem in the first second, keep product visuals accurate, faster pacing, clear CTA ending.' },
        { title: '价格对比', note: '适合电商转化。', prompt: 'Create a price-comparison ad variant, emphasize value and savings, preserve the product and claims, add a clean end-card area for offer text.' },
        { title: '高端质感', note: '适合品牌素材。', prompt: 'Create a premium brand variant: slower luxury pacing, cleaner lighting, refined camera movement, preserve product details, elegant CTA ending.' },
      ]}
    />
  );
}
