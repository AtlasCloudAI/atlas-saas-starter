import { Dumbbell } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function FitnessTransformPage() {
  return (
    <SingleImageGenerationApp
      templateId="fitness-transform"
      title="AI 健身变身"
      subtitle="上传身材照，生成健康、可信的目标体型可视化，用于健身激励和私教签单。"
      icon={<Dumbbell className="h-6 w-6" />}
      examples={[
        { title: '12 周目标', note: '健康、不夸张。', prompt: 'Keep the exact same face and identity. Realistic 12-week fitness transformation: leaner athletic physique, better posture, gym lighting, healthy and believable, no extreme distortion.' },
        { title: '减脂目标', note: '适合 before/after。', prompt: 'Keep the exact same person and face. Create a realistic fat-loss goal visualization, slightly leaner body, natural skin texture, same height and proportions, clean studio lighting.' },
        { title: '增肌目标', note: '适合私教销售。', prompt: 'Keep the exact same face and identity. Realistic strength training goal physique, moderate muscle gain, athletic posture, gym environment, believable transformation, no unrealistic bodybuilder exaggeration.' },
      ]}
    />
  );
}
