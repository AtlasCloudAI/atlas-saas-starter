import { Baby } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function BabyPodcastPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="baby-podcast"
      title="AI Baby Podcast"
      subtitle="上传播客主、名人风格角色或虚拟人物参考图，生成婴儿版播客/评论短视频。"
      icon={<Baby className="h-6 w-6" />}
      defaultPrompt="Use the uploaded references to create a funny AI baby podcast clip: baby versions sitting at a tiny podcast table, expressive talking, playful but non-deceptive parody style, native sound effects, vertical social video."
      examples={[
        { title: '双人播客宝宝版', note: '适合短视频整活。', prompt: 'Two baby podcast hosts inspired by the uploaded references sit at tiny microphones, talk animatedly, comedic timing, playful studio set, vertical social video, clearly parody.' },
        { title: '新闻宝宝评论', note: '适合 faceless 新闻号变体。', prompt: 'A baby news commentator talks seriously into a small microphone, funny contrast, expressive gestures, clean captions area, upbeat sound effects.' },
        { title: '品牌宝宝口播', note: '适合广告 hook。', prompt: 'A cute baby presenter explains a product with surprising confidence, tiny podcast desk, playful music, clear social ad framing, non-deceptive synthetic style.' },
      ]}
    />
  );
}
