import { Sparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function ArtPortraitPage() {
  return (
    <SingleImageGenerationApp
      templateId="art-portrait"
      title="AI 名画穿越肖像"
      subtitle="把自拍变成博物馆油画、文艺复兴肖像或世界名画风格写真，同时保持本人身份。"
      icon={<Sparkles className="h-6 w-6" />}
      examples={[
        { title: '文艺复兴肖像', note: '安全、审美感强，适合传播和礼品化。', prompt: 'Renaissance oil painting portrait, elegant period costume, dramatic chiaroscuro light, museum quality, keep the exact same face and identity' },
        { title: '珍珠耳环风格', note: '适合近景半身头像。', prompt: 'classical Vermeer-inspired portrait, pearl earring, dark painterly background, soft window light, museum painting texture, keep exact identity' },
        { title: '浮世绘穿越', note: '适合做一组多风格海报。', prompt: 'Edo-era ukiyo-e inspired portrait, refined kimono, delicate linework, tasteful Japanese print texture, keep the exact same face structure' },
      ]}
    />
  );
}
