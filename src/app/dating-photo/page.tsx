import { Heart } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function DatingPhotoPage() {
  return (
    <SingleImageGenerationApp
      templateId="dating-photo"
      title="AI 约会资料照"
      subtitle="生成真实、不油腻、不像 AI 的约会头像场景，适合 Tinder、Hinge、小红书社交头像。"
      icon={<Heart className="h-6 w-6" />}
      examples={[
        { title: '咖啡馆抓拍', note: '真实社交头像。', prompt: 'Keep the exact same face and identity. Authentic dating profile photo in a cozy cafe, natural smile, realistic skin texture with pores, candid lifestyle photography, not over-retouched.' },
        { title: '户外徒步', note: '高信任感场景。', prompt: 'Keep the exact same face and identity. Candid outdoor hiking dating profile photo, natural daylight, casual athletic outfit, relaxed confident smile, realistic skin texture, not AI-looking.' },
        { title: '小酒馆', note: '更成熟的城市感。', prompt: 'Keep the exact same face and identity. Stylish evening wine bar portrait, smart casual outfit, warm ambient lighting, natural expression, realistic lifestyle dating profile photo.' },
      ]}
    />
  );
}
