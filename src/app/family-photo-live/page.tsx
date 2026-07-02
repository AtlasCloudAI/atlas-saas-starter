import { MessageCircleHeart } from 'lucide-react';
import { ConsentWorkflowShell } from '@/components/ConsentWorkflowShell';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function FamilyPhotoLivePage() {
  return (
    <ConsentWorkflowShell mode="memorial">
      <ReferenceVideoGenerationApp
        kind="family-photo-live"
        title="AI 全家福动起来"
        subtitle="上传老照片或全家福参考图，生成温柔克制的节日纪念短视频。"
        icon={<MessageCircleHeart className="h-6 w-6" />}
        defaultPrompt="Animate the uploaded old family photo gently. Keep everyone recognizable and respectful: subtle smiles, tiny head movement, warm light, nostalgic ambience, no identity changes, no exaggerated motion."
        examples={[
          { title: '节日问候', note: '适合春节/生日。', prompt: 'A restored family photo gently comes alive with warm festive light, subtle smiles, soft camera push-in, respectful nostalgic mood, no new people added.' },
          { title: '全家福相册', note: '适合家庭纪念。', prompt: 'Animate the uploaded family portrait like a living album page: tiny natural movements, warm film texture, gentle ambience, preserve exact faces and clothing.' },
          { title: '老屋回忆', note: '适合长辈礼物。', prompt: 'The uploaded old family photo gains soft warm light and slight natural motion, nostalgic home atmosphere, calm emotional tone, realistic and respectful.' },
        ]}
      />
    </ConsentWorkflowShell>
  );
}
