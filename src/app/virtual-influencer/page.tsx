import { BadgeCheck } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function VirtualInfluencerPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="virtual-influencer"
      title="AI 虚拟偶像"
      subtitle="上传 AI 人设图，持续生成同一张脸的 vlog、跳舞、口播和品牌内容。"
      icon={<BadgeCheck className="h-6 w-6" />}
      defaultPrompt="Use the uploaded virtual influencer reference consistently. Create a lifestyle vlog clip: the same character talks to camera in a stylish room, natural gestures, confident expression, native audio ambience, polished vertical social video."
      examples={[
        {
          title: '日常 vlog',
          note: '适合养虚拟人账号。',
          prompt:
            'Use the uploaded virtual influencer references consistently. Create a daily lifestyle vlog: the character speaks to camera while preparing coffee in a stylish apartment, natural hand gestures, friendly expression, native room ambience, vertical format.',
        },
        {
          title: '品牌种草',
          note: '虚拟 KOL 带货片段。',
          prompt:
            'Use the uploaded virtual influencer consistently. Product recommendation clip, character holds the product naturally, explains one key benefit with confident friendly delivery, clean studio lighting, native audio, vertical social ad style.',
        },
        {
          title: '舞蹈短片',
          note: '更偏 TikTok/Reels。',
          prompt:
            'Use the uploaded virtual influencer consistently. Short dance clip in a neon studio, smooth trendy movement, hair and outfit motion, energetic music, polished vertical video, same face and identity.',
        },
      ]}
    />
  );
}
