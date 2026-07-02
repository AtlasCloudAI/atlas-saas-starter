import { Clapperboard } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function ShortDramaPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="short-drama"
      title="AI 短剧分镜"
      subtitle="上传角色/场景参考图，生成角色一致、带原生音画的竖屏短剧片段。"
      icon={<Clapperboard className="h-6 w-6" />}
      defaultPrompt='Use the uploaded character references consistently. A vertical short-drama scene: the main character discovers a hidden contract on the desk, shocked expression, tense cinematic lighting, native Chinese dialogue: "这份合同，为什么会有我的名字？", dramatic pause, realistic performance.'
      examples={[
        {
          title: '逆袭开场',
          note: '适合短剧第一集强钩子。',
          prompt:
            'Use the uploaded character references consistently. Vertical micro-drama opening scene, the protagonist walks into a luxury office and confronts the antagonist, tense eye contact, cinematic close-ups, native Chinese dialogue, dramatic music, high-retention first 5 seconds.',
        },
        {
          title: '霸总反转',
          note: '角色对峙和台词更强。',
          prompt:
            'Use the uploaded character references consistently. A CEO romance reversal scene, the female lead calmly reveals evidence, the male lead looks stunned, office night lighting, native Chinese dialogue, emotional camera push-in, vertical drama style.',
        },
        {
          title: '悬疑发现',
          note: '适合连续剧悬念片段。',
          prompt:
            'Use the uploaded character references consistently. Suspense short drama scene, the character finds an old photo in a locked drawer, slow close-up, nervous breathing, native Chinese whisper dialogue, moody lighting, cinematic vertical framing.',
        },
      ]}
    />
  );
}
