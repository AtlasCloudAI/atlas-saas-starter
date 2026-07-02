import { Sofa } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function VirtualStagingPage() {
  return (
    <SingleImageGenerationApp
      templateId="virtual-staging"
      title="AI 房产虚拟布置"
      subtitle="上传空房间照片，自动布置成更适合房源展示的样板间图。"
      icon={<Sofa className="h-6 w-6" />}
      examples={[
        {
          title: '北欧客厅',
          note: '适合 Zillow、贝壳、Airbnb 房源。',
          prompt: 'Keep the exact same room architecture, windows, floor and camera perspective. Add modern Scandinavian living room furniture, warm rug, neutral sofa, coffee table, plants, natural daylight, photorealistic real-estate listing.',
        },
        {
          title: '轻奢卧室',
          note: '空卧室变高转化样板间。',
          prompt: 'Keep the exact same room structure and perspective. Furnish it as a refined contemporary bedroom: queen bed, soft linen, warm bedside lamps, tasteful wall art, premium but realistic real-estate staging.',
        },
        {
          title: '民宿风格',
          note: '更适合短租封面图。',
          prompt: 'Keep the exact same room architecture. Add cozy boutique Airbnb styling: comfortable seating, warm lighting, small plants, wood accents, clean inviting decor, photorealistic.',
        },
      ]}
    />
  );
}
