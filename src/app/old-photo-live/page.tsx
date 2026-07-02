import { MessageCircleHeart } from 'lucide-react';
import { ConsentWorkflowShell } from '@/components/ConsentWorkflowShell';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function OldPhotoLivePage() {
  return (
    <ConsentWorkflowShell mode="memorial">
      <MediaVideoToolApp
        kind="talking-photo"
        title="AI 老照片开口"
        subtitle="上传老照片和纪念音频，生成温柔、克制、带口型的老照片说话视频。"
        icon={<MessageCircleHeart className="h-6 w-6" />}
        defaultPrompt="Respectful memorial talking-photo performance, preserve the original identity and dignity, subtle facial motion, accurate lip sync, stable camera, warm gentle delivery."
        examples={[
          { title: '纪念留言', note: '合规定位为纪念和告别。', prompt: 'Warm respectful memorial message, subtle smile, natural lip sync, preserve original photo identity and dignity, no exaggerated expression.' },
          { title: '家族节日祝福', note: '适合家庭场景。', prompt: 'Gentle family greeting performance, warm expression, accurate lip sync, subtle head movement, nostalgic soft lighting.' },
          { title: '老照片故事', note: '把家族故事做成短视频。', prompt: 'Nostalgic storytelling performance, calm voice delivery, subtle facial movement, old photo texture preserved, respectful framing.' },
        ]}
      />
    </ConsentWorkflowShell>
  );
}
