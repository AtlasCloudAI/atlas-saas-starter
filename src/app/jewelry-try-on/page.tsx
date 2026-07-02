import { Diamond } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function JewelryTryOnPage() {
  return (
    <SingleImageGenerationApp
      templateId="jewelry-try-on"
      title="AI 珠宝试戴"
      subtitle="上传手部/人像图和珠宝图，把戒指、项链、耳环真实戴到正确位置。"
      icon={<Diamond className="h-6 w-6" />}
      examples={[
        { title: '戒指试戴', note: '手部 + 戒指图。', prompt: 'Use image 1 as the hand and image 2 as the ring. Place the exact ring on the ring finger with correct scale, perspective and metal reflections. Keep hand unchanged, photorealistic.' },
        { title: '项链试戴', note: '人像 + 项链图。', prompt: 'Use image 1 as the person and image 2 as the necklace. Place the exact necklace naturally on the neck/collarbone, preserve gemstone and metal details, match lighting, keep face unchanged.' },
        { title: '耳环试戴', note: '脸/耳部 + 耳环图。', prompt: 'Use image 1 as the person and image 2 as the earrings. Put the exact earrings on the ears with realistic scale, lighting and reflections, preserve the person identity and hair.' },
      ]}
    />
  );
}
