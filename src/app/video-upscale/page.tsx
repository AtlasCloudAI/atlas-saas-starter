import { ScanSearch } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function VideoUpscalePage() {
  return (
    <MediaVideoToolApp
      kind="video-upscale"
      title="AI 视频超分修复"
      subtitle="上传低清或老视频，生成 1080p 增强版本，适合老录像复活、广告素材高清化。"
      icon={<ScanSearch className="h-6 w-6" />}
      defaultPrompt=""
      examples={[]}
    />
  );
}
