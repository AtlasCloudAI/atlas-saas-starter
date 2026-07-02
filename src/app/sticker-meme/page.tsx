import { MessageCircleHeart } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function StickerMemePage() {
  return (
    <SingleImageGenerationApp
      templateId="sticker-meme"
      title="AI 表情包工厂"
      subtitle="上传自拍或宠物照，生成能直接用于社交传播的表情包/贴纸风格图片。"
      icon={<MessageCircleHeart className="h-6 w-6" />}
      examples={[
        { title: '哭笑贴纸', note: '高频聊天表情，适合做贴纸包首图。', prompt: 'crying laughing expression, bold sticker outline, cute social chat sticker, clean cutout style, keep identity recognizable' },
        { title: '打工人崩溃', note: '中文社媒常见梗图情绪。', prompt: 'overworked office meme expression, tired but funny face, bold outline, clean sticker cutout, expressive social meme style' },
        { title: '宠物吐槽', note: '宠物表情包最容易被主人转发。', prompt: 'funny pet reaction sticker, slightly judgmental expression, bold outline, preserve exact fur markings and face, clean cutout background' },
      ]}
    />
  );
}
