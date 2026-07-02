import { Camera } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function YearbookPage() {
  return (
    <SingleImageGenerationApp
      templateId="yearbook"
      title="AI 年鉴复古写真"
      subtitle="自拍一键生成 90s 年鉴、毕业照、复古证件照风格，适合社交传播。"
      icon={<Camera className="h-6 w-6" />}
      examples={[
        {
          title: '90s 年鉴',
          note: '经典校册头像风格。',
          prompt: 'Keep the exact same face and identity. 1990s American high school yearbook portrait, denim jacket, clean blue-grey backdrop, soft flash photography, nostalgic film texture, photorealistic.',
        },
        {
          title: '复古毕业照',
          note: '更正式、更适合分享。',
          prompt: 'Keep the exact same face and identity. Retro graduation portrait, classic gown-inspired outfit, soft studio backdrop, tasteful 1990s school photography, photorealistic.',
        },
        {
          title: 'Y2K 证件感',
          note: '带一点时尚杂志感。',
          prompt: 'Keep the exact same face and identity. Early 2000s Y2K portrait, simple white tee, glossy flash, clean studio background, nostalgic editorial yearbook style, photorealistic.',
        },
      ]}
    />
  );
}
