import { Sparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function LooksmaxPage() {
  return (
    <SingleImageGenerationApp
      templateId="looksmax"
      title="AI 颜值改造可视化"
      subtitle="上传自拍，生成更自然、更上镜的 glow-up 版本，用于头像优化、造型建议和 before/after 分享。"
      icon={<Sparkles className="h-6 w-6" />}
      examples={[
        { title: '自然上镜版', note: '不过度医美，适合头像优化。', prompt: 'natural glow-up portrait, better grooming, clean skin texture, flattering light, confident expression, no plastic surgery look, preserve exact identity' },
        { title: '约会资料版', note: '和约会照场景互补。', prompt: 'authentic dating profile glow-up, relaxed smile, tasteful styling, realistic skin texture, candid warm light, keep the same person exactly' },
        { title: '职业精修版', note: '更适合 LinkedIn 和商务头像。', prompt: 'professional glow-up headshot, polished grooming, confident posture, subtle skin cleanup, studio lighting, keep exact face and identity' },
      ]}
    />
  );
}
