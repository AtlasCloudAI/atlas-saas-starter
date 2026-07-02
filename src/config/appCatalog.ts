// App 状态分类(依据《功能审查.md》),供 AppSidebar 与首页共用,保证一致。
export type AppCat = 'production' | 'nocreative' | 'incomplete';

// ✅ 可投入生产:有真实壁垒 / 多步 pipeline(3D、专用视频、真 pipeline、SKU 素材工厂)
export const PRODUCTION_ROUTES = new Set<string>([
  '/sku-studio', '/image-to-3d', '/text-to-3d', '/game-asset-3d', '/figurine-3d', '/memorial-figurine',
  '/video-edit', '/video-upscale', '/course-video', '/podcast', '/ecommerce-suite',
]);

// 🔴 未完善:纯前端空壳 / 只出 LLM 文案 / 名不副实
export const INCOMPLETE_ROUTES = new Set<string>([
  '/avatar-agent', '/stl-marketplace', '/pod-order', '/ar-commerce', '/showrunner', '/account-matrix',
  '/combo-studio', '/ugc-ad-factory', '/social-publisher', '/live-room', '/photo-studio-suite',
  '/fortune', '/pod-kit', '/real-estate-suite', '/ar-menu', '/video-translate',
  '/video-faceswap', '/music-video', '/video-extend', '/ad-variants',
]);

// 其余 = 🟡 能跑但没壁垒(单步通用模型,GPT / 豆包一步可替代)
export function catOf(href: string): AppCat {
  return PRODUCTION_ROUTES.has(href) ? 'production' : INCOMPLETE_ROUTES.has(href) ? 'incomplete' : 'nocreative';
}

export const CAT_META: { key: AppCat; label: string; desc: string; dot: string; ring: string }[] = [
  { key: 'production', label: '✅ 可投入生产', desc: '有真实壁垒 / 多步 pipeline', dot: 'bg-green-500', ring: 'ring-green-300' },
  { key: 'nocreative', label: '🟡 能跑但没壁垒', desc: '单步通用模型,一步可替代', dot: 'bg-amber-500', ring: 'ring-amber-300' },
  { key: 'incomplete', label: '🔴 未完善', desc: '空壳 / 只出文案 / 名不副实', dot: 'bg-red-500', ring: 'ring-red-300' },
];

// sku-studio 没有 i18n key,单独给标题/描述
export function appTitle(id: string, fallbackTitle: string): string {
  return id === 'sku-studio' ? 'SKU 素材工厂' : fallbackTitle;
}
export function appDesc(id: string, fallbackDesc: string): string {
  return id === 'sku-studio' ? '商品图 → 全套广告素材包' : fallbackDesc;
}
