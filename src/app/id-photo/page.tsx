import { Badge } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function IdPhotoPage() {
  return (
    <SingleImageGenerationApp
      templateId="id-photo"
      title="AI 证件照"
      subtitle="上传自拍，生成白底、正面、均匀光线的证件照风格图片，适合简历和资料照预处理。"
      icon={<Badge className="h-6 w-6" />}
      examples={[
        { title: '白底护照照', note: '正面、均匀光线。', prompt: 'Keep the exact same face and identity. Passport-style ID photo, pure white background, front-facing head and shoulders, neutral expression, even lighting, realistic skin texture, no accessories.' },
        { title: '简历头像', note: '比正式证件照更自然。', prompt: 'Keep the exact same face and identity. Clean resume ID portrait, light grey background, neat clothing, front-facing, natural expression, realistic document photo style.' },
        { title: '签证预处理', note: '保脸，不改五官。', prompt: 'Keep the exact same face and identity. Visa-style document photo, plain white background, centered face, neutral expression, no shadow, no retouching that changes facial features.' },
      ]}
    />
  );
}
