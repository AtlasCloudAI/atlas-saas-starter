import { Flame } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function MemeVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="meme-video"
      title="AI 梗图开口视频"
      subtitle="上传梗图、宠物、人物或名画参考图，生成会说话、有音效、适合短视频平台传播的 meme 视频。"
      icon={<Flame className="h-6 w-6" />}
      defaultPrompt="Animate the uploaded meme subject as a short talking reaction video. Keep the subject recognizable, add expressive mouth and face motion, comedic timing, punchy sound effects, simple subtitles area, vertical social format."
      examples={[
        { title: '名画吐槽', note: '低风险、有传播感。', prompt: 'Animate the uploaded painting or portrait as if it is delivering a sarcastic short line to camera, subtle mouth movement, comedic pause, tasteful sound effect, vertical meme video.' },
        { title: '宠物开会', note: '宠物内容转发率高。', prompt: 'The uploaded pet appears to talk seriously like a tiny boss in a meeting, cute mouth movement, preserve fur markings, comedic timing, light office ambience.' },
        { title: '评论区反应', note: '适合做热点跟评短视频。', prompt: 'A fast reaction meme video: the uploaded face reacts with surprise, then talks directly to camera, punchy zoom, clean captions area, short viral sound effect.' },
      ]}
    />
  );
}
