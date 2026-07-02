import { Crown } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PetHumanPage() {
  return (
    <SingleImageGenerationApp
      templateId="pet-human"
      title="AI 宠物拟人"
      subtitle="上传宠物照片，把毛孩子变成带有同款气质、毛色和表情线索的人类角色肖像。"
      icon={<Crown className="h-6 w-6" />}
      examples={[
        { title: '都市型男/女孩', note: '适合晒宠物性格反差。', prompt: 'turn this pet into a stylish young human character, preserve fur color and personality cues, urban fashion editorial portrait, warm studio light' },
        { title: '贵族肖像', note: '和宠物油画形成组合包。', prompt: 'humanized aristocratic portrait inspired by the pet, preserve markings as clothing color accents, elegant classical outfit, painterly light' },
        { title: '可爱店员', note: '适合宠物账号和品牌周边。', prompt: 'humanized cute cafe staff character inspired by this pet, friendly expression, preserve fur markings as outfit palette, photorealistic portrait' },
      ]}
    />
  );
}
