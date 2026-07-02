import { Sparkles } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function TimeMachinePage() {
  return (
    <SingleImageGenerationApp
      templateId="time-machine"
      title="AI 时光机"
      subtitle="上传自拍，生成变老、变年轻或人生时间轴肖像，用于 before/after 分享和情感纪念内容。"
      icon={<Sparkles className="h-6 w-6" />}
      examples={[
        { title: '70 岁的我', note: 'FaceApp 级常青玩法。', prompt: 'age this person to around 70 years old, realistic wrinkles, gray hair, wise gentle expression, same identity and bone structure, photorealistic portrait' },
        { title: '童年版本', note: '适合后续做抱抱童年自己。', prompt: 'make this person look like an 8-year-old child version, same identity cues and facial structure, warm nostalgic portrait, realistic not cartoon' },
        { title: '人生时间轴', note: '可多次生成不同年龄段。', prompt: 'create a realistic 40-year-old version of the same person, mature styling, natural skin texture, same identity, documentary portrait lighting' },
      ]}
    />
  );
}
