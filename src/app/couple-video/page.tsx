import { HeartHandshake } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function CoupleVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="couple-video"
      title="AI 异地情侣合体视频"
      subtitle="上传两个人的参考图，生成纪念日、拥抱、同框旅行感的情侣短视频。"
      icon={<HeartHandshake className="h-6 w-6" />}
      defaultPrompt="Use the uploaded two-person references. Create a warm long-distance couple reunion video: both people appear naturally in the same scene, walk toward each other, gentle hug, romantic but realistic lighting, preserve identities, vertical social video."
      examples={[
        { title: '纪念日拥抱', note: '适合礼物。', prompt: 'Two people from the uploaded references meet at golden hour and share a gentle hug, warm romantic lighting, realistic motion, preserve both identities, respectful emotional tone.' },
        { title: '旅行同框', note: '适合异地情侣。', prompt: 'The two uploaded people appear together in a cozy travel street scene, walking side by side, natural smiles, cinematic handheld movement, warm vacation mood.' },
        { title: '节日祝福', note: '适合生日/周年。', prompt: 'A sweet couple greeting video: both people from the references stand together with soft lights, subtle hand-holding, natural expressions, gentle celebratory atmosphere.' },
      ]}
    />
  );
}
