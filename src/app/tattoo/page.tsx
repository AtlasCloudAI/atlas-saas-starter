import { PenLine } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function TattooPage() {
  return (
    <SingleImageGenerationApp
      templateId="tattoo"
      title="AI 纹身试戴"
      subtitle="把纹身自然预览到手臂、肩膀、锁骨等位置，适合纹身店获客。"
      icon={<PenLine className="h-6 w-6" />}
      examples={[
        { title: '细线龙', note: '小红书常见款。', prompt: 'Keep the exact same person and scene. Only add a fine-line dragon tattoo on the forearm, natural ink integration, follows skin perspective, realistic shading, change nothing else.' },
        { title: '极简文字', note: '适合锁骨/手腕。', prompt: 'Keep the exact same person and scene. Only add a minimal elegant script tattoo on the wrist, realistic ink on skin, correct perspective and subtle skin texture, photorealistic.' },
        { title: '花朵肩部', note: '大面积试戴。', prompt: 'Keep the exact same person and scene. Only add a realistic botanical flower tattoo on the shoulder and upper arm, natural skin integration, believable shading, photorealistic.' },
      ]}
    />
  );
}
