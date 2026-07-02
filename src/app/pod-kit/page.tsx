import { PackageCheck } from 'lucide-react';
import { StrategyPlanApp } from '@/components/StrategyPlanApp';

export default function PodKitPage() {
  return (
    <StrategyPlanApp
      kind="pod-kit"
      title="AI 手办 POD 下单套件"
      subtitle="把图生 3D 资产变成可报价、可审核、可交付的实体手办/纪念摆件订单流程。"
      icon={<PackageCheck className="h-6 w-6" />}
      defaultBrief="为照片转 3D 手办应用设计实体下单流程，用户生成模型后可选择尺寸、材质、底座、刻字和包装，满意后确认生产。"
      defaultAudience="C 端礼品用户、宠物纪念用户、二次元/游戏角色收藏用户。"
      defaultConstraints="需要包含报价规则、打印前质检、用户确认流程、发货承诺、退款边界和可制造性检查清单。"
    />
  );
}
