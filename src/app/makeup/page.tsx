import { Brush } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function MakeupPage() {
  return (
    <SingleImageGenerationApp
      templateId="makeup"
      title="AI 试妆"
      subtitle="上传自拍，预览通勤妆、晚宴妆、婚礼妆等真实妆效。"
      icon={<Brush className="h-6 w-6" />}
      examples={[
        { title: '通勤裸妆', note: '自然增强五官。', prompt: 'Keep the exact same face and identity. Apply natural everyday makeup: clean skin, soft brows, subtle eyeliner, warm nude lipstick, realistic texture. Keep hair, clothing and background unchanged.' },
        { title: '晚宴妆', note: '更强但不失真。', prompt: 'Keep the exact same face and identity. Apply elegant evening makeup: defined eyes, soft contour, tasteful highlight, classic red lipstick, photorealistic skin texture. Change nothing else.' },
        { title: '婚礼妆', note: '适合影楼入口。', prompt: 'Keep the exact same face and identity. Apply refined bridal makeup: luminous skin, soft rose tones, natural lashes, elegant lip color, realistic professional makeup. Keep everything else unchanged.' },
      ]}
    />
  );
}
