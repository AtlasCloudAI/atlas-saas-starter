import { RectangleHorizontal } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function ThumbnailPage() {
  return (
    <TextImageGenerationApp
      kind="thumbnail"
      title="AI 封面缩略图"
      subtitle="为 YouTube、小红书、课程和广告生成高点击率封面图。"
      icon={<RectangleHorizontal className="h-6 w-6" />}
      defaultSize="2048x1152"
      defaultPrompt="A high-CTR YouTube thumbnail for a video about building profitable AI apps, bold clean composition, large readable Chinese title area left blank, expressive creator workspace, bright contrast, professional tech creator style, no random text."
      examples={[
        { title: 'AI 赚钱封面', note: '适合教程/商业内容。', size: '2048x1152', prompt: 'High-CTR YouTube thumbnail, topic: profitable AI apps, bold visual contrast, clean tech workspace, glowing app cards, shocked but professional mood, leave clear empty area for Chinese title text, no random text.' },
        { title: '小红书封面', note: '竖版强视觉。', size: '1152x2048', prompt: 'Xiaohongshu cover image for an AI portrait app tutorial, premium clean layout, stylish phone mockup, warm lifestyle background, clear empty area for Chinese headline, no random text.' },
        { title: '课程封面', note: '适合知识付费。', size: '2048x1152', prompt: 'Premium online course cover about AI media SaaS, organized dashboard visuals, blue-white clean business style, elegant lighting, empty text area, professional and trustworthy.' },
      ]}
    />
  );
}
