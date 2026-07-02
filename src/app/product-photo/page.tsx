'use client';

import { Package } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function ProductPhotoPage() {
  return (
    <SingleImageGenerationApp
      templateId="product-photo"
      title="AI 商品图"
      subtitle="上传一张商品图，生成干净、高级、可用于电商详情页和广告的商业棚拍图。"
      icon={<Package className="h-6 w-6" />}
      examples={[
        {
          title: '高级棚拍',
          note: '适合电商主图，干净背景和柔和阴影。',
          prompt: 'Keep the exact same product. Put it on a premium marble podium with soft studio lighting, clean light gray background, realistic shadow, luxury e-commerce hero shot.',
        },
        {
          title: '生活方式图',
          note: '适合社媒种草和详情页场景图。',
          prompt: 'Keep the exact same product. Place it in a warm realistic lifestyle scene, natural daylight, tasteful props, premium editorial product photography.',
        },
        {
          title: '广告主视觉',
          note: '适合投放素材和活动 banner。',
          prompt: 'Keep the exact same product. Create a bold advertising hero image with dynamic lighting, clean composition, premium commercial look, no extra text.',
        },
      ]}
    />
  );
}
