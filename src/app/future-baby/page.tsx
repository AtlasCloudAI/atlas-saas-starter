import { Baby } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function FutureBabyPage() {
  return (
    <SingleImageGenerationApp
      templateId="future-baby"
      title="AI 未来宝宝"
      subtitle="上传两位父母/情侣照片，生成自然融合特征的未来宝宝肖像。"
      icon={<Baby className="h-6 w-6" />}
      examples={[
        { title: '新生儿肖像', note: '温柔棚拍风。', prompt: 'Use image 1 and image 2 as parents. Generate a photorealistic newborn baby portrait that naturally blends facial features from both parents, soft blanket, warm studio light, cute peaceful expression.' },
        { title: '2 岁宝宝', note: '更适合分享。', prompt: 'Use image 1 and image 2 as parents. Generate a photorealistic 2-year-old toddler portrait blending both parents naturally, bright eyes, warm family photo style, soft natural light.' },
        { title: '亲子合照感', note: '可做纪念图。', prompt: 'Use image 1 and image 2 as parents. Generate a future baby portrait as if photographed in a warm family studio, naturally blending both parents features, realistic and wholesome.' },
      ]}
    />
  );
}
