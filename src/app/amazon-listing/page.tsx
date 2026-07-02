import { ShoppingCart } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function AmazonListingPage() {
  return (
    <SingleImageGenerationApp
      templateId="amazon-listing"
      title="AI 亚马逊主图"
      subtitle="上传商品图，生成白底、居中、无水印、适合上架规范的商品主图。"
      icon={<ShoppingCart className="h-6 w-6" />}
      examples={[
        { title: '主图达标', note: '纯白底、商品占比高。', prompt: 'Keep the exact same product, label, text, shape and color. Amazon-compliant main image, pure white background #FFFFFF, product centered filling about 85% of frame, no props, no watermark, sharp realistic shadow.' },
        { title: 'A+ 内容图', note: '更偏详情页。', prompt: 'Keep the exact same product and label. Create a clean premium ecommerce A+ content image with subtle lifestyle context, soft studio lighting, no random text, product remains accurate.' },
        { title: '独立站主图', note: '白底但更高级。', prompt: 'Keep the exact same product. Premium Shopify product main image, clean off-white studio background, realistic soft shadow, centered product, high clarity, no extra text.' },
      ]}
    />
  );
}
