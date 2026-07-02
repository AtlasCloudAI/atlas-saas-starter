import { Soup } from 'lucide-react';
import { StrategyPlanApp } from '@/components/StrategyPlanApp';

export default function ArMenuPage() {
  return (
    <StrategyPlanApp
      kind="ar-menu"
      title="AI 餐饮 AR 菜单"
      subtitle="把菜品图、诱人动效、3D 看菜和二维码菜单组织成餐厅可部署的转化方案。"
      icon={<Soup className="h-6 w-6" />}
      defaultBrief="餐厅希望上传菜单和菜品照片，生成高质量菜品图、诱人短视频、3D/AR 看菜清单、桌牌二维码和外卖平台素材包。"
      defaultAudience="餐厅、外卖商家、餐饮 SaaS、菜单摄影服务商。"
      defaultConstraints="需要强调真实份量不误导、菜品过敏原提示、QR 菜单体验、AR 加载性能和转化指标。"
    />
  );
}
