import { BookOpenText } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function CourseVideoPage() {
  return (
    <MediaVideoToolApp
      kind="talking-photo"
      title="AI 讲师课程视频"
      subtitle="上传讲师形象和课程讲稿音频，生成带虚拟老师出镜的培训/课程片段。"
      icon={<BookOpenText className="h-6 w-6" />}
      defaultPrompt="Professional course instructor speaking to camera, accurate lip sync, calm teaching style, clean corporate or classroom framing, stable camera, clear expression."
      examples={[
        { title: '企业培训', note: '适合 SOP/合规培训。', prompt: 'Professional corporate trainer speaking to camera, clear articulate delivery, neutral office background, accurate lip sync, calm confident expression.' },
        { title: '在线课程', note: '适合知识付费片段。', prompt: 'Friendly online course instructor, warm studio lighting, direct eye contact, natural hand and head motion, accurate lip sync.' },
        { title: '多语言课程', note: '配合外部 TTS 可做本地化。', prompt: 'Professional multilingual instructor performance, accurate lip sync to uploaded audio, stable framing, educational video style.' },
      ]}
    />
  );
}
