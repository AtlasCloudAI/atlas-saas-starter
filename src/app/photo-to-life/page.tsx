'use client';

import { WandSparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PhotoToLifePage() {
  return (
    <SingleImageGenerationApp
      templateId="photo-to-life"
      title="照片动起来"
      subtitle="上传一张照片，生成自然轻动效短视频，适合头像、宠物、商品和社媒素材。"
      icon={<WandSparkles className="h-6 w-6" />}
      examples={[
        {
          title: '自然人像',
          note: '轻微微笑、眨眼、慢推镜头。',
          prompt: 'Gentle smile, natural blinking, subtle head movement, hair moving slightly, slow cinematic push-in, stable and realistic.',
        },
        {
          title: '宠物动起来',
          note: '适合宠物头像和分享视频。',
          prompt: 'The pet gently blinks, breathes, tilts its head slightly, with soft natural motion and a slow warm camera push-in.',
        },
        {
          title: '产品展示',
          note: '适合商品短视频展示。',
          prompt: 'Subtle cinematic product motion, slow push-in, soft light movement, stable object, premium commercial video style.',
        },
      ]}
    />
  );
}
