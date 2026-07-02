import { Rainbow } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PetFarewellPage() {
  return (
    <SingleImageGenerationApp
      templateId="pet-farewell"
      title="AI 宠物告别肖像"
      subtitle="上传宠物照片，生成彩虹桥/天堂纪念肖像，适合相框、挂画和告别仪式。"
      icon={<Rainbow className="h-6 w-6" />}
      examples={[
        { title: '彩虹桥肖像', note: '温柔纪念风。', prompt: 'Keep the exact same pet, breed, fur markings and face. Rainbow bridge memorial portrait, warm golden light, soft clouds, subtle rainbow glow, peaceful comforting atmosphere, framed portrait style.' },
        { title: '天堂花园', note: '更治愈。', prompt: 'Keep the exact same pet and markings. Peaceful heavenly garden memorial portrait, soft flowers, warm sunlight, gentle expression, tasteful and comforting, high-quality portrait.' },
        { title: '相框挂画', note: '适合 POD。', prompt: 'Keep the exact same pet. Elegant memorial framed portrait style, soft neutral background, warm rim light, dignified and comforting, print-ready composition.' },
      ]}
    />
  );
}
