import { BookOpenText } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function KidsBookPage() {
  return (
    <TextImageGenerationApp
      kind="kids-book"
      title="AI 个性化儿童绘本"
      subtitle="输入孩子、宠物和故事主题，生成适合绘本封面或内页的安全插画。"
      icon={<BookOpenText className="h-6 w-6" />}
      defaultSize="1024x1024"
      defaultPrompt="A warm children's picture-book cover: a curious 6-year-old child and a small orange cat explore a glowing pillow fort spaceship in a cozy bedroom, soft watercolor texture, safe and gentle, expressive but not scary, large blank title area at the top."
      examples={[
        { title: '太空被窝', note: '睡前故事封面。', prompt: 'A warm children picture-book cover: a child and a cat turn a blanket fort into a tiny spaceship, cozy bedroom, soft watercolor, gentle stars, safe mood, blank title space.', size: '1024x1024' },
        { title: '恐龙早餐店', note: '适合 3-6 岁。', prompt: 'A cheerful picture-book illustration: a friendly tiny dinosaur helps a child make pancakes in a sunny kitchen, soft gouache style, gentle humor, safe and bright.', size: '1024x1024' },
        { title: '海底图书馆', note: '适合系列绘本。', prompt: 'A child in a bubble helmet visits an underwater library with friendly fish librarians, magical but calm, richly detailed watercolor, kid-safe, no scary creatures.', size: '1024x1024' },
      ]}
    />
  );
}
