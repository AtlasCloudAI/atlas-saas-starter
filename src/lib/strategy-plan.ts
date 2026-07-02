import { atlasChat } from './atlas';

export const STRATEGY_PLAN_MODEL = 'qwen/qwen3.5-397b-a17b';
export const STRATEGY_PLAN_COST = 2;

export function normalizePlanKind(value: unknown) {
  const allowed = new Set([
    'live-room',
    'account-matrix',
    'pod-kit',
    'ar-commerce',
    'photo-studio-suite',
    'showrunner',
    'real-estate-suite',
    'combo-studio',
    'ugc-ad-factory',
    'avatar-agent',
    'ecommerce-suite',
    'social-publisher',
    'pod-order',
    'ar-menu',
  ]);
  return typeof value === 'string' && allowed.has(value) ? value : 'live-room';
}

export function cleanPlanField(value: unknown, fallback = '', max = 5000) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function generateStrategyPlan(input: {
  kind: string;
  brief: string;
  audience: string;
  constraints: string;
}) {
  const kindGuide: Record<string, string> = {
    'live-room':
      'Create a 7x24 AI livestream commerce operating plan: host persona, product script loops, schedule blocks, FAQ answers, compliance labels, handoff to human support, and KPI checklist.',
    'account-matrix':
      'Create an account-matrix production plan for short drama / virtual influencer channels: personas, weekly calendar, reusable prompts, asset library, batch workflow, and publishing checklist.',
    'pod-kit':
      'Create a POD physical-product fulfillment kit for AI figurines / memorial prints: SKU tiers, quote logic, print-readiness checklist, packaging copy, customer approval flow, and risk checklist.',
    'ar-commerce':
      'Create an AR commerce embed rollout plan: 3D asset requirements, model-viewer snippet guidance, Shopify/product-page checklist, measurement calibration, QA and conversion tracking.',
    'photo-studio-suite':
      'Create an AI photo-studio SaaS operating plan for offline studios: headshots, wedding, ID photos, dating photos, yearbook styles, pricing bundles, intake form, retouch QA, and delivery workflow.',
    showrunner:
      'Create an AI showrunner production plan for user-generated episodic web series: bible, character consistency, episode beat sheet, reference assets, review gates, and publishing cadence.',
    'real-estate-suite':
      'Create a real-estate and renovation visualization SaaS plan: virtual staging, renovation concepts, listing copy, AR/3D handoff, broker workflow, and lead capture.',
    'combo-studio':
      'Create a multi-modal AI combo workflow plan that chains image, video, audio, 3D, and LLM tools into sellable creator workflows with concrete presets and QA gates.',
    'ugc-ad-factory':
      'Create a URL-to-UGC ad factory plan: product intake fields, claims extraction, persona matrix, hook variants, video script templates, asset checklist, approval workflow, and paid-media QA.',
    'avatar-agent':
      'Create a face-to-face AI avatar agent / virtual receptionist plan: knowledge base fields, conversation flows, escalation rules, voice/avatar handoff, IVR mapping, logging, and compliance.',
    'ecommerce-suite':
      'Create an ecommerce AI creative suite plan: product photo, virtual model, try-on, listing/A+ content, ad video, bundle workflow, QA checklist, marketplace constraints, and API packaging.',
    'social-publisher':
      'Create a social media publishing kit plan: export formats, caption variants, hashtags, platform-specific packaging for TikTok/YouTube Shorts/Instagram/Reels/Xiaohongshu/Douyin, review gates, and scheduling handoff.',
    'pod-order':
      'Create a POD order and fulfillment plan for AI figurines, memorial objects, and 3D printed products: quote form, customer proof approval, print checks, packaging, shipping statuses, and support macros.',
    'ar-menu':
      'Create an AR restaurant menu rollout plan: dish photo improvements, appetizing video clips, 3D dish model requirements, QR menu flow, table-side conversion metrics, and merchant onboarding.',
  };
  return atlasChat(
    [
      {
        role: 'system',
        content:
          'You are a senior AI SaaS product operator. Produce concrete implementation-ready operating plans in Chinese. Avoid generic advice; include checklists, scripts, and field names that can be pasted into a product.',
      },
      {
        role: 'user',
        content: `${kindGuide[input.kind] || kindGuide['live-room']}

Project brief:
${input.brief}

Target audience:
${input.audience}

Constraints / channels / notes:
${input.constraints}

Output structure:
1. 可售卖产品定位
2. 用户输入字段
3. 生成/处理流程
4. 交付物清单
5. 示例脚本或模板
6. 验收/质检清单
7. 风险与合规提示

Keep it practical and under 1800 Chinese characters.`,
      },
    ],
    STRATEGY_PLAN_MODEL,
  );
}
