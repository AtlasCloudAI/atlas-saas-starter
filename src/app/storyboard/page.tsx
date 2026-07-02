import { Rows3 } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function StoryboardPage() {
  return (
    <TextImageGenerationApp
      kind="storyboard"
      title="AI 分镜板"
      subtitle="输入广告/短剧/课程脚本，生成可用于拍摄和视频生成的分镜概念图。"
      icon={<Rows3 className="h-6 w-6" />}
      defaultSize="2048x1152"
      defaultPrompt="A clean 6-panel storyboard sheet for a vertical ecommerce ad about a portable desk humidifier: hook, product close-up, office scene, bedroom scene, feature detail, final CTA. Simple cinematic sketches, clear panel separation, no random text."
      examples={[
        { title: '电商广告分镜', note: '六格结构清楚。', size: '2048x1152', prompt: 'A 6-panel storyboard sheet for a skincare product ad: problem hook, product hero shot, texture close-up, user applying, glowing result, final product packshot. Clean cinematic storyboard, no random text.' },
        { title: '短剧分镜', note: '适合 reference video 前置。', size: '2048x1152', prompt: 'A cinematic 8-panel vertical short drama storyboard: office confrontation, hidden contract reveal, shocked close-up, flashback photo, antagonist entering, emotional dialogue, dramatic decision, cliffhanger ending. Clear panels, film storyboard style.' },
        { title: '课程视频分镜', note: '适合讲师课件。', size: '2048x1152', prompt: 'A clean storyboard sheet for an online course intro video: instructor opening, problem slide, dashboard demo, close-up explanation, student result, final CTA. Modern education design, clear composition.' },
      ]}
    />
  );
}
