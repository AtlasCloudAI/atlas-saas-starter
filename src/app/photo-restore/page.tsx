import { ImageUp } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function PhotoRestorePage() {
  return (
    <SingleImageGenerationApp
      templateId="photo-restore"
      title="AI 老照片修复"
      subtitle="修复划痕、破损、褪色和模糊老照片，适合家庭相册和节日纪念内容。"
      icon={<ImageUp className="h-6 w-6" />}
      examples={[
        {
          title: '黑白照上色',
          note: '自然上色，不改人脸。',
          prompt: 'Restore this old photo: repair scratches and dust, naturally colorize if black-and-white, recover facial detail, keep the original people, clothing, pose and composition unchanged.',
        },
        {
          title: '破损修复',
          note: '补裂痕、污渍、折痕。',
          prompt: 'Carefully restore the damaged photo. Remove cracks, stains, fold marks and fading. Preserve the exact original identity, expression, clothing and background. Natural archival photo restoration.',
        },
        {
          title: '全家福增强',
          note: '让家庭旧照更清晰。',
          prompt: 'Enhance this family photo: improve sharpness and exposure, restore natural color, reduce noise and blur, keep every person recognizable and do not add or remove anyone.',
        },
      ]}
    />
  );
}
