import { BriefcaseBusiness } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function HeadshotPage() {
  return (
    <SingleImageGenerationApp
      templateId="headshot"
      title="AI 职业头像"
      subtitle="上传自拍或生活照，生成适合 LinkedIn、官网团队页、简历和销售名片的专业头像。"
      icon={<BriefcaseBusiness className="h-6 w-6" />}
      examples={[
        {
          title: '科技公司头像',
          note: '灰色影棚背景，深色西装，自然微笑。',
          prompt: 'Keep the exact same face and identity. Tailored navy business suit, clean grey studio backdrop, soft professional lighting, confident natural smile, photorealistic corporate headshot.',
        },
        {
          title: '创始人主页',
          note: '更有亲和力，适合个人品牌。',
          prompt: 'Keep the exact same face and identity. Modern founder portrait, smart casual black blazer, warm neutral studio background, approachable expression, premium editorial lighting, photorealistic.',
        },
        {
          title: '销售名片照',
          note: '干净、高信任感、头像裁切友好。',
          prompt: 'Keep the exact same face and identity. Professional sales profile photo, white shirt, dark blazer, bright clean background, trustworthy expression, centered composition, photorealistic.',
        },
      ]}
    />
  );
}
