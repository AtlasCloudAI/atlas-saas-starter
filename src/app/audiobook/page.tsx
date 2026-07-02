import { BookOpenText } from 'lucide-react';
import { TextAudioGenerationApp } from '@/components/TextAudioGenerationApp';

export default function AudiobookPage() {
  return (
    <TextAudioGenerationApp
      kind="audiobook"
      title="AI 有声书工厂"
      subtitle="把书稿、专栏、课程讲义生成自然旁白音频，适合网文听书、知识付费和出海本地化。"
      icon={<BookOpenText className="h-6 w-6" />}
      defaultText="第一章：雨停之后，城市像被重新擦亮。林远站在旧书店门口，看见橱窗里那本没有书名的蓝色封面小说，忽然想起十年前父亲留给他的最后一句话。"
      examples={[
        {
          title: '网文章节',
          note: '剧情感旁白。',
          text: '夜色落下时，码头上的雾越来越浓。她攥紧那封没有署名的信，终于明白，今晚来见她的人，可能不是朋友，而是十年前那场火灾唯一的幸存者。',
        },
        {
          title: '知识专栏',
          note: '清晰、稳重。',
          text: '今天我们讨论一个常被忽略的问题：为什么多数创作者不是输在灵感，而是输在稳定的生产系统。一个可复用的流程，比一时的爆款更重要。',
        },
        {
          title: '儿童故事',
          note: '温柔讲述。',
          text: '小熊米米第一次看见雪，是在一个安静的清晨。森林里的每一片叶子都戴上了白帽子，连最爱吵闹的小松鼠，也轻轻放慢了脚步。',
        },
      ]}
    />
  );
}
