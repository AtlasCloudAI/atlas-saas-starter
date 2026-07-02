import { Clapperboard } from 'lucide-react';
import { ChildSeriesShell } from '@/components/ChildSeriesShell';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function ChildAnimationPage() {
  return (
    <ChildSeriesShell>
      <ReferenceVideoGenerationApp
        kind="child-animation"
        title="AI 儿童动画连载"
        subtitle="上传角色、场景或儿童绘本参考图，生成温和、安全、角色一致的动画短片。"
        icon={<Clapperboard className="h-6 w-6" />}
        defaultPrompt="Create a gentle child-safe animated story clip using the uploaded character references consistently. Warm colors, simple clear action, friendly narration tone, soft music, no scary content, vertical family-friendly video."
        examples={[
          { title: '睡前绘本片段', note: '和睡前故事音频互补。', prompt: 'A gentle bedtime animation: the referenced child-friendly character walks through a cozy moonlit room, soft lullaby music, warm colors, safe and calm mood.' },
          { title: '教育小剧场', note: '适合课程/亲子内容。', prompt: 'A short educational animation for children: the character learns to share toys with a friend, clear simple action, cheerful music, safe family-friendly tone.' },
          { title: '连载角色片头', note: '适合固定 IP。', prompt: 'Create a short opening clip for a recurring kid-friendly character, consistent design, bright gentle animation, playful music, clean vertical framing.' },
        ]}
      />
    </ChildSeriesShell>
  );
}
