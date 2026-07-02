import { Wand2 } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function VideoExtendPage() {
  return (
    <MediaVideoToolApp
      kind="video-edit"
      title="AI 视频续写"
      subtitle="上传一段短视频，让模型按原画面、角色和镜头风格续写出新的可发布片段。"
      icon={<Wand2 className="h-6 w-6" />}
      defaultPrompt="Extend the video naturally for a few seconds. Preserve the same subject, camera motion, lighting and scene continuity. Add a satisfying ending shot suitable for social media."
      examples={[
        { title: '产品展示续写', note: '适合电商广告 A/B 素材。', prompt: 'Extend the product showcase with a smooth camera push-in, preserve product shape and logo, add a satisfying reveal ending and clean commercial lighting.' },
        { title: '剧情悬念续写', note: '适合短剧账号。', prompt: 'Continue the scene with a suspenseful micro-drama beat, preserve character identity and camera style, end on a strong cliffhanger.' },
        { title: '旅行镜头续写', note: '适合 B-roll 内容。', prompt: 'Extend the travel shot naturally, keep the same environment and color grade, add smooth cinematic motion and a calm ending.' },
      ]}
    />
  );
}
