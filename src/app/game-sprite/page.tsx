import { PanelsTopLeft } from 'lucide-react';
import { TextImageGenerationApp } from '@/components/TextImageGenerationApp';

export default function GameSpritePage() {
  return (
    <TextImageGenerationApp
      kind="game-sprite"
      title="AI 游戏 2D 精灵图"
      subtitle="为 indie 游戏生成角色、道具、技能图标和等距小场景概念图。"
      icon={<PanelsTopLeft className="h-6 w-6" />}
      defaultSize="1024x1024"
      defaultPrompt="A clean 2D game asset sheet on transparent-style light background: cute fantasy courier character, idle/walk/jump poses, small backpack props, readable silhouette, consistent colors, pixel-art inspired but high resolution, game-ready presentation."
      examples={[
        { title: '角色动作表', note: '适合平台跳跃游戏。', prompt: 'A 2D character sprite sheet: tiny fantasy courier, idle walk jump run poses, consistent proportions, clear silhouette, light neutral background, game asset presentation.', size: '1024x1024' },
        { title: '技能图标', note: '适合 RPG/MOBA。', prompt: 'A set of 12 fantasy skill icons for a wind mage, clean square icons, readable at small size, consistent palette, polished mobile game style.', size: '1024x1024' },
        { title: '等距道具', note: '适合经营游戏。', prompt: 'An isometric 2D asset sheet for a cozy bakery game: oven, counter, bread basket, signboard, small plants, consistent angle, clean game-ready style.', size: '1024x1024' },
      ]}
    />
  );
}
