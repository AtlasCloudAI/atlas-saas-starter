import { Scissors } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function HairstylePage() {
  return (
    <SingleImageGenerationApp
      templateId="hairstyle"
      title="AI 发型试戴"
      subtitle="在不改变脸和背景的前提下预览新发型、新发色。"
      icon={<Scissors className="h-6 w-6" />}
      examples={[
        { title: '法式短波波', note: '自然通勤感。', prompt: 'Keep the exact same face and identity. Only change the hairstyle to a French bob with soft natural waves, dark brown color, realistic hairline and volume. Keep clothing and background unchanged.' },
        { title: '长卷发', note: '更适合写真。', prompt: 'Keep the exact same face and identity. Only change the hairstyle to long loose glossy waves, natural black hair, realistic volume and strands, keep everything else unchanged, photorealistic.' },
        { title: '浅棕挑染', note: '试发色不翻车。', prompt: 'Keep the exact same face and identity. Only change the hair color to warm light brown with subtle highlights, keep hairstyle shape natural, keep clothing and background unchanged, photorealistic.' },
      ]}
    />
  );
}
