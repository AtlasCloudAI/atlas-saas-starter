import { Gem } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function WeddingPage() {
  return (
    <SingleImageGenerationApp
      templateId="wedding"
      title="AI 婚纱写真"
      subtitle="上传单人或情侣照片，生成婚纱、旅拍、纪念日风格大片。"
      icon={<Gem className="h-6 w-6" />}
      examples={[
        {
          title: '海边婚纱',
          note: '黄金时刻旅拍风格。',
          prompt: 'Keep the exact same face and identity. Elegant wedding attire on a quiet beach during golden hour, soft wind, cinematic romantic lighting, premium wedding photography, photorealistic.',
        },
        {
          title: '花园仪式',
          note: '柔和、适合纪念日。',
          prompt: 'Keep the exact same face and identity. Romantic garden wedding photoshoot, elegant formal wedding outfit, floral arch, soft natural light, dreamy but realistic professional photography.',
        },
        {
          title: '教堂大片',
          note: '更庄重的婚礼风。',
          prompt: 'Keep the exact same face and identity. Classic cathedral wedding portrait, refined formal wedding attire, dramatic window light, elegant composition, photorealistic editorial wedding photo.',
        },
      ]}
    />
  );
}
