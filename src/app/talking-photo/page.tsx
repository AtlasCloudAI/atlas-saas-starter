import { MessageCircleHeart } from 'lucide-react';
import { ConsentWorkflowShell } from '@/components/ConsentWorkflowShell';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function TalkingPhotoPage() {
  return (
    <ConsentWorkflowShell mode="talking-photo">
      <MediaVideoToolApp
        kind="talking-photo"
        title="会说话的照片"
        subtitle="上传一张人像/宠物/名画和一段音频，生成开口说话的视频，适合老照片留言、宠物说话、数字人片段。"
        icon={<MessageCircleHeart className="h-6 w-6" />}
        defaultPrompt="Natural talking-head performance, keep the same identity, gentle facial motion, accurate lip sync, stable camera, warm emotional delivery."
        examples={[
          { title: '老照片留言', note: '温柔、克制的口型表演。', prompt: 'Warm emotional talking-head performance, natural lip sync, subtle facial expression, preserve the original photo identity and dignity, stable camera.' },
          { title: '宠物说话', note: '轻松社交传播。', prompt: 'Animate the pet as if speaking the uploaded audio, cute expressive mouth movement, preserve fur markings and face, fun social video style.' },
          { title: '数字人讲解', note: '适合课程/带货口播。', prompt: 'Professional presenter talking to camera, accurate lip sync, confident expression, clean stable framing, natural head movement.' },
        ]}
      />
    </ConsentWorkflowShell>
  );
}
