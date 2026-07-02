import { PanelsTopLeft } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function DynamicComicPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="dynamic-comic"
      title="AI 动态漫"
      subtitle="上传角色设定图或漫画分镜，把静态条漫变成有镜头、有配乐、有对白的动态短视频。"
      icon={<PanelsTopLeft className="h-6 w-6" />}
      defaultPrompt="Use the uploaded manga or character references consistently. Turn the still comic panel into a motion comic: subtle parallax, hair and clothing motion, dramatic camera push, speech-bubble style pacing, native background music, anime style."
      examples={[
        {
          title: '条漫镜头推进',
          note: '静态分镜变短视频。',
          prompt:
            'Use the uploaded comic panel consistently. Create a motion comic scene with subtle parallax, slow camera push-in, blinking eyes, wind moving hair and clothing, dramatic anime lighting, native background music, vertical format.',
        },
        {
          title: '角色对话',
          note: '适合连载动态漫。',
          prompt:
            'Use the uploaded character references consistently. Anime motion comic dialogue scene, two characters face each other with subtle expressions, cinematic cuts, native dialogue pacing, emotional background music, vertical webtoon video.',
        },
        {
          title: '战斗爆发',
          note: '更强动作和传播感。',
          prompt:
            'Use the uploaded anime character reference consistently. Dynamic battle moment, energy burst, camera shake, dramatic speed lines, clothing and hair motion, intense music and sound effects, polished motion comic style.',
        },
      ]}
    />
  );
}
