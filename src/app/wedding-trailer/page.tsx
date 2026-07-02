import { Gem } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function WeddingTrailerPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="wedding-trailer"
      title="AI 婚礼预告片"
      subtitle="上传婚纱照、情侣照或场景参考，生成可用于请柬、纪念日和婚礼预演的短视频。"
      icon={<Gem className="h-6 w-6" />}
      defaultPrompt="Use the uploaded couple or wedding references consistently. Create a romantic wedding trailer: slow cinematic camera movement, soft golden light, elegant dress motion, gentle music, tasteful emotional tone, vertical social video."
      examples={[
        { title: '婚礼邀请', note: '适合电子请柬。', prompt: 'A romantic wedding invitation trailer, couple walking through a garden, soft golden light, elegant text-safe space, gentle piano music, tasteful cinematic motion.' },
        { title: '纪念日短片', note: '适合情侣礼物。', prompt: 'A warm anniversary trailer with the referenced couple, subtle smiles, slow dance, candlelight, nostalgic music, soft film grain, vertical format.' },
        { title: '婚纱预演', note: '适合从照片升级为视频。', prompt: 'The bride and groom stand in a scenic wedding venue, dress fabric moves gently, slow camera orbit, elegant cinematic lighting, romantic music.' },
      ]}
    />
  );
}
