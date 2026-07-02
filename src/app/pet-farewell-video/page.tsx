import { Rainbow } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function PetFarewellVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="pet-farewell-video"
      title="AI 宠物告别视频"
      subtitle="上传宠物参考图，生成温柔克制的回头、奔跑、告别纪念短视频。"
      icon={<Rainbow className="h-6 w-6" />}
      defaultPrompt="Use the uploaded pet reference. Create a respectful memorial video: the same pet gently walks through warm light, briefly looks back, peaceful atmosphere, soft music, preserve markings and personality, no exaggerated fantasy or identity changes."
      examples={[
        { title: '回头告别', note: '适合纪念短片。', prompt: 'The uploaded pet gently walks on a sunlit path, looks back once with a calm expression, soft warm light, peaceful music, preserve exact fur markings and identity.' },
        { title: '彩虹桥', note: '情感礼品风。', prompt: 'A tasteful rainbow bridge memorial video: the same pet sits in soft golden light, subtle tail movement, gentle ambience, respectful emotional tone, no cartoon distortion.' },
        { title: '相册片头', note: '适合剪进纪念合集。', prompt: 'The uploaded pet photo becomes a soft living memory: subtle head movement, warm film texture, gentle camera push-in, calm piano mood, realistic and respectful.' },
      ]}
    />
  );
}
