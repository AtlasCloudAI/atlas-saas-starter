import { Music2 } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function MusicVideoPage() {
  return (
    <MediaVideoToolApp
      kind="talking-photo"
      title="AI 音乐 MV / 会唱歌的脸"
      subtitle="上传一张歌手/人物/宠物图和一段歌曲或人声音频，生成对口型演唱视频。"
      icon={<Music2 className="h-6 w-6" />}
      defaultPrompt="Lip-sync singing performance, keep the same identity, accurate mouth movement to the uploaded song, subtle stage lighting, stable close-up camera, polished music video feel."
      examples={[
        { title: '虚拟歌手近景', note: '适合 Suno/Udio 歌曲配 MV。', prompt: 'A close-up singer performance, accurate lip sync to the uploaded song, soft concert lighting, natural head movement, polished vertical MV framing.' },
        { title: '宠物唱歌', note: 'C 端整活传播。', prompt: 'Animate the pet as if singing the uploaded song, cute expressive mouth movement, preserve exact fur markings, playful music video style.' },
        { title: '名画唱歌', note: '低素材成本的 meme 玩法。', prompt: 'Animate the portrait as if singing with the uploaded audio, tasteful mouth movement, painterly texture preserved, subtle stage glow.' },
      ]}
    />
  );
}
