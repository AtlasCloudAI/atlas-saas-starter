import { Sparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function AnimeTransformPage() {
  return (
    <SingleImageGenerationApp
      templateId="anime-transform"
      title="AI 动漫变身"
      subtitle="上传自拍，生成温暖动漫、手绘电影感、Q 版或幻想风格肖像，同时保持本人可识别。"
      icon={<Sparkles className="h-6 w-6" />}
      examples={[
        { title: '温暖手绘', note: '适合九宫格分享。', prompt: 'warm hand-painted anime-inspired portrait, countryside background, soft natural colors, gentle light, keep exact identity recognizable' },
        { title: 'Q 版头像', note: '适合社交头像。', prompt: 'cute chibi avatar version, rounded features, expressive eyes, clean pastel background, keep identity cues and hairstyle recognizable' },
        { title: '奇幻冒险', note: '适合角色设定图。', prompt: 'fantasy anime adventurer portrait, cloak, forest light, cinematic illustration, keep exact face identity and hair recognizable' },
      ]}
    />
  );
}
