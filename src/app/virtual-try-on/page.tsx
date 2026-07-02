import { Shirt } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function VirtualTryOnPage() {
  return (
    <SingleImageGenerationApp
      templateId="virtual-try-on"
      title="AI 试衣间"
      subtitle="上传人物图和服装图，把衣服真实穿到同一个人身上，适合电商试穿、穿搭内容和品牌导购。"
      icon={<Shirt className="h-6 w-6" />}
      examples={[
        {
          title: '通勤外套试穿',
          note: '人物图 + 西装外套商品图。',
          prompt: 'Use image 1 as the person and image 2 as the blazer. Dress the person in the exact blazer from image 2. Keep the same person, face, pose, body shape and background. Preserve garment color, buttons, collar, texture and silhouette. Photorealistic.',
        },
        {
          title: '连衣裙上身',
          note: '保留人物脸和身形，替换服装。',
          prompt: 'Use image 1 as the model and image 2 as the dress. Put the exact dress onto the model naturally, realistic fabric drape and folds, preserve the model identity and pose, keep the background unchanged, photorealistic fashion try-on.',
        },
        {
          title: '潮流 T 恤',
          note: '图案和文字要尽量保持。',
          prompt: 'Use image 2 as the T-shirt design and place it on the person in image 1. Preserve the printed graphic, color and fit. Keep the exact same person and scene, realistic lighting and fabric texture.',
        },
      ]}
    />
  );
}
