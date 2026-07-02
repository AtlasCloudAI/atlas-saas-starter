import { Shield } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function GuardianPortraitPage() {
  return (
    <TextImageGenerationApp
      kind="guardian-portrait"
      title="AI 守护天使肖像"
      subtitle="生成圣像、守护天使、信仰肖像等情感类图像，适合礼品和纪念场景。"
      icon={<Shield className="h-6 w-6" />}
      defaultPrompt="A serene guardian angel portrait, warm golden light, gentle protective expression, elegant white and gold robes, soft clouds, devotional painting style, tasteful and peaceful, no text."
      examples={[
        { title: '守护天使', note: '温暖纪念感。', prompt: 'Serene guardian angel portrait, warm golden light, gentle protective presence, soft clouds, elegant robes, peaceful devotional painting, no text.' },
        { title: '圣像风格', note: '更传统。', prompt: 'Tasteful sacred icon style portrait, gold leaf background, calm compassionate expression, rich symbolic details, elegant devotional art, no text.' },
        { title: '家庭祝福', note: '适合节日礼品。', prompt: 'A warm family blessing angel illustration, soft luminous atmosphere, protective hands, gentle hopeful mood, painterly devotional gift art, no text.' },
      ]}
    />
  );
}
