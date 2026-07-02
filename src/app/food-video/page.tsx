import { Soup } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function FoodVideoPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="food-video"
      title="AI 菜品动效视频"
      subtitle="上传菜品或餐厅参考图，生成冒热气、淋酱、切开、上桌等诱人短视频。"
      icon={<Soup className="h-6 w-6" />}
      defaultPrompt="Use the uploaded dish as reference. Create an appetizing food video: subtle steam, glossy sauce movement, gentle camera push-in, warm restaurant light, satisfying sound effects, realistic and not misleading."
      examples={[
        { title: '热气主图', note: '适合外卖菜单视频。', prompt: 'The uploaded dish releases subtle steam, camera slowly pushes in, warm appetizing light, realistic texture, gentle restaurant ambience, no ingredient changes.' },
        { title: '淋酱动效', note: '适合甜品和烧烤。', prompt: 'A close-up food shot where sauce is poured smoothly over the dish, glossy highlights, satisfying sound, preserve the exact dish style and ingredients.' },
        { title: '上桌短片', note: '适合餐厅社媒。', prompt: 'The dish is placed on a table in a warm restaurant scene, subtle steam, shallow depth of field, inviting camera movement, cozy ambience.' },
      ]}
    />
  );
}
