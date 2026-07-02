import { Shirt } from 'lucide-react';
import { ReferenceVideoGenerationApp } from '@/components/ReferenceVideoGenerationApp';

export default function VirtualModelAdPage() {
  return (
    <ReferenceVideoGenerationApp
      kind="virtual-model-ad"
      title="AI 虚拟模特广告"
      subtitle="上传服装、商品或模特参考图，生成可投放的虚拟模特展示和商品广告短片。"
      icon={<Shirt className="h-6 w-6" />}
      defaultPrompt="Use the uploaded product and model references. Create a clean vertical ecommerce ad: virtual model demonstrates the product naturally, accurate garment/product details, mobile-first framing, smooth camera movement, short spoken selling line, realistic lighting."
      examples={[
        { title: '服装走秀', note: '适合独立站新品。', prompt: 'A virtual model walks in a minimal studio wearing the uploaded garment, accurate fabric and fit, clean mobile framing, subtle camera pan, premium ecommerce ad style.' },
        { title: '手持商品', note: '适合美妆/小家电。', prompt: 'A virtual model holds and demonstrates the uploaded product, clear close-up, natural smile, concise selling moment, bright studio light, no false claims.' },
        { title: '生活方式广告', note: '适合社媒种草。', prompt: 'A lifestyle UGC-style ad using the uploaded product: model uses it in a realistic home scene, natural movement, clear product hero shot, authentic social media pacing.' },
      ]}
    />
  );
}
