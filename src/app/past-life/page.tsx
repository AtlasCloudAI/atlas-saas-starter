import { Sparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PastLifePage() {
  return (
    <SingleImageGenerationApp
      templateId="past-life"
      title="AI 前世写真"
      subtitle="把自拍变成古代身份、奇幻角色或电影感前世肖像，适合算命/社交 UGC 引流。"
      icon={<Sparkles className="h-6 w-6" />}
      examples={[
        {
          title: '古代谋士',
          note: '历史感强，适合报告封面。',
          prompt: 'Keep the exact same face and identity. Reimagine this person as an ancient strategist in a moonlit palace library, elegant robes, cinematic lighting, highly detailed photorealistic portrait.',
        },
        {
          title: '骑士前世',
          note: '更强视觉冲击。',
          prompt: 'Keep the exact same face and identity. Transform into a noble medieval knight portrait, detailed armor, castle courtyard, dramatic sunset, cinematic editorial photography, photorealistic.',
        },
        {
          title: '东方公主',
          note: '适合小红书风格。',
          prompt: 'Keep the exact same face and identity. Elegant ancient Eastern royal portrait, silk costume, ornate hair accessories, lantern-lit garden, soft cinematic lighting, photorealistic.',
        },
      ]}
    />
  );
}
