import { BadgeCheck } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function BrandCampaignPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="brand-campaign"
      title="AI 品牌连续广告"
      subtitle="上传品牌、产品、角色参考图，生成同一视觉体系下的连载带货/品牌剧情短片。"
      icon={<BadgeCheck className="h-6 w-6" />}
      defaultPrompt="Use the uploaded brand/product/character references. Create a vertical episodic brand ad with consistent colors, recurring character identity, product hero moments, a clear hook in the first second, natural spoken lines, cinematic but social-native pacing."
      examples={[
        { title: '连续剧情种草', note: '适合新品首发。', prompt: 'A recurring creator character discovers the uploaded product in a daily-life problem scene, clear 1-second hook, product close-up, natural dialogue, ending with a soft call to action.' },
        { title: '品牌世界观', note: '适合高客单品牌。', prompt: 'Build a consistent brand mini-world around the uploaded references: premium lighting, same palette, repeated visual motif, elegant product reveal, cinematic social ad.' },
        { title: '三段式投放', note: '适合 A/B 测试。', prompt: 'Create a direct-response ad structure: pain point, product demonstration, proof moment, fast pacing, readable composition for mobile feed.' },
      ]}
    />
  );
}
