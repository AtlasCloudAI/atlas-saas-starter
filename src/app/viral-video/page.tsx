import { Flame } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function ViralVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="viral-video"
      title="病毒特效视频"
      subtitle="上传人物或商品参考图，套用 AI Hug、开箱、转场、会说话梗图等高传播视频模板。"
      icon={<Flame className="h-6 w-6" />}
      defaultPrompt="Use the uploaded reference subject consistently. Create a viral short-form video: fast hook in the first second, dynamic camera movement, expressive motion, native sound effects and music, vertical framing, polished social media style."
      examples={[
        {
          title: 'AI Hug',
          note: '适合情感向合成视频。',
          prompt:
            'Use the uploaded person references consistently. Create an emotional AI hug video: two people walk toward each other and share a warm natural hug, soft cinematic lighting, gentle background music, realistic motion, vertical social video.',
        },
        {
          title: '商品开箱',
          note: '商品/手办/盲盒视频模板。',
          prompt:
            'Use the uploaded product reference consistently. A viral unboxing video: the box opens on a rotating display table, dramatic reveal, product sparkles subtly, fast camera push-in, satisfying sound effects, upbeat music, vertical ecommerce style.',
        },
        {
          title: '会说话梗图',
          note: '适合 meme 和评论区传播。',
          prompt:
            'Use the uploaded image as the main meme subject. Animate it as if it is reacting and talking to the camera with exaggerated but clean expression, comedic timing, punchy sound effects, short viral vertical format.',
        },
      ]}
    />
  );
}
