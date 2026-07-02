import { Dumbbell } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function FitnessVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="fitness-video"
      title="AI 健身变身视频"
      subtitle="上传当前照或目标体型参考，生成 before/after 激励短视频、训练账号素材和健身营销片。"
      icon={<Dumbbell className="h-6 w-6" />}
      defaultPrompt="Create a motivational fitness transformation video using the uploaded references. Keep identity respectful and realistic, show healthy athletic progress, gym lighting, energetic music, before-after social video structure."
      examples={[
        { title: '12 周挑战', note: '适合健身教练获客。', prompt: 'A 12-week fitness transformation social video, healthy realistic progress, gym montage, confident posture, energetic music, clean before-after structure.' },
        { title: '训练打卡', note: '适合账号日更。', prompt: 'Motivational workout progress clip, the subject trains with steady effort, cinematic gym lighting, uplifting music, realistic body proportions.' },
        { title: '课程广告', note: '适合私教/课程转化。', prompt: 'Fitness coaching ad: before-after transformation, trainer-like confidence, clear end-frame space for CTA, upbeat music, vertical social video.' },
      ]}
    />
  );
}
