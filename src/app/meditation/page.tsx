import { Music2 } from 'lucide-react';
import { TextAudioGenerationApp } from '@/components/TextAudioGenerationApp';

export default function MeditationPage() {
  return (
    <TextAudioGenerationApp
      kind="soundscape"
      title="AI 冥想/ASMR 助眠"
      subtitle="生成个性化冥想引导、白噪音、ASMR 和睡眠氛围音，适合 Calm/Headspace 式订阅产品。"
      icon={<Music2 className="h-6 w-6" />}
      defaultText="A 60-second guided sleep meditation soundscape: very gentle breathing cues, soft rain, warm ambient pad, slow calm pacing, soothing narrator tone, no sharp sounds."
      examples={[
        { title: '睡前放松', note: '低刺激、适合睡眠。', text: 'A 60-second bedtime relaxation meditation: slow breathing guidance, soft rain outside the window, warm ambient drone, very gentle narrator, long pauses, no sharp sounds.' },
        { title: '工作焦虑', note: '个性化冥想脚本。', text: 'A short guided meditation for work anxiety: calm voice, slow breathing count, reassuring tone, soft piano pad, subtle room ambience, clear pauses.' },
        { title: 'ASMR 学习', note: '适合长时长频道。', text: 'A focused study ASMR loop: quiet page turning, pencil writing, distant rain, soft room tone, no vocals, seamless calm atmosphere.' },
      ]}
    />
  );
}
