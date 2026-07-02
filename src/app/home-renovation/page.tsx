import { Hammer } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function HomeRenovationPage() {
  return (
    <SingleImageGenerationApp
      templateId="home-renovation"
      title="AI 装修可视化"
      subtitle="上传毛坯/旧房照片，生成装修后的 before/after 概念图。"
      icon={<Hammer className="h-6 w-6" />}
      examples={[
        { title: '现代暖木风', note: '适合客厅/卧室。', prompt: 'Keep the exact same room layout, windows, doors and camera perspective. Renovate into a warm modern wood interior, soft lighting, updated flooring, tasteful furniture and decor, photorealistic.' },
        { title: '厨房翻新', note: '用于装修签单。', prompt: 'Keep the exact same kitchen layout and camera angle. Renovate with modern cabinets, stone countertop, warm under-cabinet lighting, clean appliances, realistic contractor visualization.' },
        { title: '出租房改造', note: '低成本风格化。', prompt: 'Keep the exact room structure. Renovate into a bright budget-friendly rental apartment style, clean walls, simple furniture, warm lamps, practical storage, photorealistic.' },
      ]}
    />
  );
}
