import { Crown } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PetPortraitPage() {
  return (
    <SingleImageGenerationApp
      templateId="pet-portrait"
      title="AI 宠物肖像"
      subtitle="上传宠物照片，生成油画、王室、公仔风格肖像，适合宠物礼品和社交分享。"
      icon={<Crown className="h-6 w-6" />}
      examples={[
        { title: '王室油画', note: '最适合做礼物。', prompt: 'Keep the exact same pet, identical breed, fur markings, colors and face. Turn it into a regal Renaissance oil painting portrait with royal robe, ornate background, painterly brushwork.' },
        { title: '圣诞头像', note: '节日传播素材。', prompt: 'Keep the exact same pet and fur markings. Create a cozy Christmas portrait, tasteful red scarf, warm lights, festive background, realistic painterly style, charming expression.' },
        { title: '潮玩公仔感', note: '后续可接图生 3D。', prompt: 'Keep the exact same pet and markings. Transform it into a cute collectible toy portrait, clean studio background, soft vinyl texture, adorable but recognizable, high-quality product render style.' },
      ]}
    />
  );
}
