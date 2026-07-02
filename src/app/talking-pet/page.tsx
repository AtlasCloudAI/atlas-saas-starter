import { Crown } from 'lucide-react';
import { MediaVideoToolApp } from '@/components/MediaVideoToolApp';

export default function TalkingPetPage() {
  return (
    <MediaVideoToolApp
      kind="talking-photo"
      title="AI 会说话的宠物/名画"
      subtitle="上传宠物、名画或老照片，再上传配音，生成轻量传播的开口说话/唱歌视频。"
      icon={<Crown className="h-6 w-6" />}
      defaultPrompt="Animate the uploaded pet or artwork as if speaking the audio. Preserve the original face, markings, painting style, and identity. Cute expressive mouth movement, stable framing, accurate lip sync, social-ready humor."
      examples={[
        { title: '宠物吐槽', note: '适合社媒整活。', prompt: 'Make the pet speak the uploaded audio with cute expressive mouth movement, preserve fur markings, playful but natural facial motion, stable camera.' },
        { title: '名画开口', note: '适合文化类短视频。', prompt: 'Animate the painting subject speaking the uploaded audio, preserve brush texture and original art style, subtle face motion, tasteful humorous tone.' },
        { title: '宠物唱歌', note: '适合轻量病毒传播。', prompt: 'Make the pet sing along to the uploaded audio, accurate mouth movement, fun expressive eyes, preserve the exact pet appearance, clean social video framing.' },
      ]}
    />
  );
}
