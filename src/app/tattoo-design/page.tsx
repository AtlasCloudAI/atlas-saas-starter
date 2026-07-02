import { PenTool } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function TattooDesignPage() {
  return (
    <TextImageGenerationApp
      kind="tattoo-design"
      title="AI 纹身设计"
      subtitle="从文字生成纹身草图，再配合纹身试戴页面预览上身效果。"
      icon={<PenTool className="h-6 w-6" />}
      defaultPrompt="A fine-line tattoo design of a dragon circling a crescent moon, elegant minimal black ink, clean white background, tattoo flash sheet style, balanced negative space, no text."
      examples={[
        { title: '细线龙', note: '适合手臂/锁骨。', prompt: 'Fine-line black ink tattoo design, elegant dragon with flowing clouds, minimal but detailed, clean white background, tattoo flash sheet, no text.' },
        { title: '纪念花束', note: '情感礼品方向。', prompt: 'Delicate botanical tattoo design: birth month flowers tied with a thin ribbon, fine-line black ink, tasteful negative space, clean white background, no text.' },
        { title: '几何太阳', note: '男女通用。', prompt: 'Minimal geometric sun and mountain tattoo design, black ink, symmetrical composition, clean vector-like tattoo flash on white background, no text.' },
      ]}
    />
  );
}
