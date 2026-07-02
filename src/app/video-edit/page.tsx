import { Wand2 } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function VideoEditPage() {
  return (
    <MediaVideoToolApp
      kind="video-edit"
      title="AI 视频编辑"
      subtitle="上传短视频，用一句话修改场景、风格、光线、广告版本，适合素材 A/B 变体和爆款续命。"
      icon={<Wand2 className="h-6 w-6" />}
      defaultPrompt="Make this video look like a premium social ad: brighter product lighting, cleaner background, more cinematic camera feel, keep the main subject and motion consistent."
      examples={[
        { title: '广告高级化', note: '普通素材变投放质感。', prompt: 'Turn this into a premium ecommerce ad: clean background, brighter product lighting, tasteful reflections, sharper product focus, keep the subject and motion consistent.' },
        { title: '夜景电影感', note: '风格化变体。', prompt: 'Re-style the video as a cinematic night scene with neon reflections, moody contrast, realistic lighting, keep the main subject and action unchanged.' },
        { title: '节日版本', note: '快速做营销变体。', prompt: 'Create a tasteful holiday campaign version: warm festive lights, subtle decoration, premium brand feel, keep the product and original composition recognizable.' },
      ]}
    />
  );
}
