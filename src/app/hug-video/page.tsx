import { HeartHandshake } from 'lucide-react';
import { ConsentWorkflowShell } from '@/components/ConsentWorkflowShell';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function HugVideoPage() {
  return (
    <ConsentWorkflowShell mode="hug">
      <ReferenceVideoGenerationApp
        kind="hug-video"
        title="AI 拥抱/重逢视频"
        subtitle="上传 1-2 张人物参考图，生成拥抱、重逢、情侣同框等带声情感短视频。"
        icon={<HeartHandshake className="h-6 w-6" />}
        defaultPrompt="Use the uploaded people as identity references. Create a warm reunion video: the two people gently walk toward each other and hug naturally, soft emotional lighting, subtle camera push-in, gentle background music, respectful and realistic."
        examples={[
          { title: '温暖重逢', note: '适合亲人/朋友情感向视频。', prompt: 'Two people from the references meet again and share a warm natural hug, soft golden-hour light, gentle piano music, realistic body motion, respectful emotional tone, vertical social video.' },
          { title: '情侣拥抱', note: '情侣合体照的动态升级。', prompt: 'A romantic couple reunion: the two referenced people smile, move closer and hug softly, cinematic street light, subtle music, natural motion, no exaggerated action.' },
          { title: '童年自己相遇', note: '一张或多张参考图都可尝试。', prompt: 'Create an emotional meeting with the younger self concept, gentle hug, nostalgic warm light, soft film grain, tender music, stable vertical framing.' },
        ]}
      />
    </ConsentWorkflowShell>
  );
}
