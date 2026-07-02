import { HeartHandshake } from 'lucide-react';
import { SingleImageGenerationApp } from '@/components/SingleImageGenerationApp';

export default function CouplePhotoPage() {
  return (
    <SingleImageGenerationApp
      templateId="couple-photo"
      title="AI 情侣合体照"
      subtitle="上传两张单人照，生成真实自然的情侣合照，适合异地恋和纪念日礼物。"
      icon={<HeartHandshake className="h-6 w-6" />}
      examples={[
        { title: '城市约会', note: '自然牵手合照。', prompt: 'Use image 1 and image 2 as two separate people. Create a realistic couple photo in a romantic city street, holding hands, natural candid pose, preserve both identities, realistic lighting.' },
        { title: '海边纪念', note: '纪念日礼物。', prompt: 'Use image 1 and image 2 as two separate people. Create a warm beach couple photo at golden hour, gentle hug, preserve both faces and body types, natural realistic photography.' },
        { title: '咖啡馆合照', note: '日常感更强。', prompt: 'Use image 1 and image 2 as two separate people. Create a cozy cafe couple photo, sitting together and smiling naturally, preserve both identities, realistic casual lifestyle photo.' },
      ]}
    />
  );
}
