import { Sofa } from 'lucide-react';
import { StrategyPlanApp } from '@/components/StrategyPlanApp';

export default function RealEstateSuitePage() {
  return (
    <StrategyPlanApp
      kind="real-estate-suite"
      title="AI 房产装修套件"
      subtitle="把虚拟布置、装修效果、房源文案和 AR 试摆串成房产获客工作流。"
      icon={<Sofa className="h-6 w-6" />}
      defaultBrief="房产中介和装修公司希望上传空房/毛坯房照片，一次生成样板间图、装修风格图、房源描述、短视频脚本和可嵌入的 AR/3D 商品清单。"
      defaultAudience="房产经纪、家装公司、民宿运营、家具品牌渠道商。"
      defaultConstraints="需要包含户型/面积/预算字段、风格选择、材料限制、真实尺寸说明、房源转化追踪和免责声明。"
    />
  );
}
