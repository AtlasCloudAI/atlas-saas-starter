import { Soup } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function FoodPhotoPage() {
  return (
    <SingleImageGenerationApp
      templateId="food-photo"
      title="AI 菜品图"
      subtitle="手机随手拍菜品，生成外卖平台、菜单和餐牌可用的专业美食图。"
      icon={<Soup className="h-6 w-6" />}
      examples={[
        { title: '外卖主图', note: '高食欲但不误导。', prompt: 'Keep the exact same dish, plating and portion size. Enhance into a professional delivery-app main image: appetizing color, clean table, soft studio light, subtle steam, realistic.' },
        { title: '高端菜单', note: '更适合餐牌。', prompt: 'Keep the exact same dish and ingredients. Fine dining menu photography, elegant plate styling, shallow depth of field, soft directional light, realistic garnish enhancement.' },
        { title: '社媒宣传', note: '更强氛围感。', prompt: 'Keep the exact same food and portion. Create a warm social media food photo with cozy restaurant background, appetizing steam, rich but realistic color, no fake ingredients.' },
      ]}
    />
  );
}
