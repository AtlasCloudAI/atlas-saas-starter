import { Clapperboard } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function CinematicVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="cinematic-video"
      title="AI 带声电影短片"
      subtitle="上传角色、场景或商品参考图，一句话生成带镜头运动、音效和对白氛围的电影级短片。"
      icon={<Clapperboard className="h-6 w-6" />}
      defaultPrompt="Use the uploaded references to create a cinematic short video with native audio: strong first-second hook, controlled camera movement, realistic lighting, clear action beat, subtle sound design, social-ready pacing."
      examples={[
        { title: '一句话电影感', note: '适合短剧概念片。', prompt: 'A cinematic vertical short: the uploaded character walks into a rain-lit alley, pauses under a neon sign, hears a mysterious voice, dramatic camera push-in, native ambience and subtle dialogue mood.' },
        { title: '商品英雄镜头', note: '适合新品发布。', prompt: 'A premium cinematic product reveal using the uploaded product reference: macro texture close-up, slow rotating hero shot, satisfying sound design, elegant light sweep, no product shape changes.' },
        { title: '情绪预告片', note: '适合品牌故事。', prompt: 'A short emotional trailer from the uploaded references: quiet opening, one clear dramatic beat, warm cinematic color, natural sound ambience, concise mobile composition.' },
      ]}
    />
  );
}
