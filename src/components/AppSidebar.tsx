'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  Badge,
  Baby,
  Box,
  BookOpenText,
  Bot,
  BriefcaseBusiness,
  Brush,
  Camera,
  ChevronDown,
  Clapperboard,
  Crown,
  Diamond,
  Dumbbell,
  Flame,
  Gem,
  GraduationCap,
  Images,
  ImageUp,
  Hammer,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  Mic2,
  Moon,
  Music2,
  Package,
  PackageCheck,
  PackageSearch,
  PanelsTopLeft,
  PenLine,
  PenTool,
  PlaySquare,
  Radio,
  Rainbow,
  RadioTower,
  RectangleHorizontal,
  Rows3,
  ScanSearch,
  Shirt,
  ShoppingCart,
  Scissors,
  Sofa,
  Soup,
  Sparkles,
  Shield,
  Type,
  WandSparkles,
  Wand2,
  CalendarDays,
  Cuboid,
} from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { CAT_META, catOf, appTitle, appDesc, isFeatured, type AppCat } from '@/config/appCatalog';

type NavApp = { href: string; id: string; icon: typeof Mic2 };

const PRIMARY_APPS: NavApp[] = [
  { href: '/sku-studio', id: 'sku-studio', icon: ShoppingCart },
  { href: '/course-studio', id: 'course-studio', icon: GraduationCap },
  { href: '/podcast', id: 'podcast-factory', icon: Mic2 },
  { href: '/image-explainer', id: 'image-explainer', icon: Images },
  { href: '/product-recommendation', id: 'product-recommendation', icon: PackageSearch },
  { href: '/sales-video', id: 'sales-video', icon: PlaySquare },
  { href: '/bedtime-story', id: 'bedtime-story', icon: Moon },
  { href: '/audio-drama', id: 'audio-drama', icon: Radio },
  { href: '/soundscape', id: 'soundscape', icon: Music2 },
  { href: '/voice-meme', id: 'voice-meme', icon: Radio },
  { href: '/meditation', id: 'meditation', icon: Music2 },
  { href: '/faceless-channel', id: 'faceless-channel', icon: Radio },
  { href: '/audiobook', id: 'audiobook', icon: BookOpenText },
  { href: '/product-photo', id: 'product-photo', icon: Package },
  { href: '/ecommerce-suite', id: 'ecommerce-suite', icon: ShoppingCart },
  { href: '/photo-studio-suite', id: 'photo-studio-suite', icon: Camera },
  { href: '/photo-to-life', id: 'photo-to-life', icon: WandSparkles },
  { href: '/image-to-3d', id: 'image-to-3d', icon: Box },
  { href: '/figurine-3d', id: 'figurine-3d', icon: Box },
  { href: '/memorial-figurine', id: 'memorial-figurine', icon: Rainbow },
  { href: '/pod-order', id: 'pod-order', icon: PackageCheck },
  { href: '/game-asset-3d', id: 'game-asset-3d', icon: Cuboid },
  { href: '/game-sprite', id: 'game-sprite', icon: PanelsTopLeft },
  { href: '/stl-marketplace', id: 'stl-marketplace', icon: PackageCheck },
  { href: '/text-to-3d', id: 'text-to-3d', icon: Type },
  { href: '/headshot', id: 'headshot', icon: BriefcaseBusiness },
  { href: '/id-photo', id: 'id-photo', icon: Badge },
  { href: '/dating-photo', id: 'dating-photo', icon: Heart },
  { href: '/wedding', id: 'wedding', icon: Gem },
  { href: '/wedding-trailer', id: 'wedding-trailer', icon: Gem },
  { href: '/hairstyle', id: 'hairstyle', icon: Scissors },
  { href: '/tattoo', id: 'tattoo', icon: PenLine },
  { href: '/makeup', id: 'makeup', icon: Brush },
  { href: '/pet-portrait', id: 'pet-portrait', icon: Crown },
  { href: '/pet-human', id: 'pet-human', icon: Crown },
  { href: '/talking-pet', id: 'talking-pet', icon: Crown },
  { href: '/pet-farewell', id: 'pet-farewell', icon: Rainbow },
  { href: '/virtual-try-on', id: 'virtual-try-on', icon: Shirt },
  { href: '/virtual-model-ad', id: 'virtual-model-ad', icon: Shirt },
  { href: '/jewelry-try-on', id: 'jewelry-try-on', icon: Diamond },
  { href: '/future-baby', id: 'future-baby', icon: Baby },
  { href: '/couple-photo', id: 'couple-photo', icon: HeartHandshake },
  { href: '/couple-video', id: 'couple-video', icon: HeartHandshake },
  { href: '/fitness-transform', id: 'fitness-transform', icon: Dumbbell },
  { href: '/fitness-video', id: 'fitness-video', icon: Dumbbell },
  { href: '/virtual-staging', id: 'virtual-staging', icon: Sofa },
  { href: '/home-renovation', id: 'home-renovation', icon: Hammer },
  { href: '/real-estate-suite', id: 'real-estate-suite', icon: Sofa },
  { href: '/food-photo', id: 'food-photo', icon: Soup },
  { href: '/food-video', id: 'food-video', icon: Soup },
  { href: '/ar-menu', id: 'ar-menu', icon: Soup },
  { href: '/amazon-listing', id: 'amazon-listing', icon: ShoppingCart },
  { href: '/photo-restore', id: 'photo-restore', icon: ImageUp },
  { href: '/yearbook', id: 'yearbook', icon: Camera },
  { href: '/past-life', id: 'past-life', icon: Sparkles },
  { href: '/anime-transform', id: 'anime-transform', icon: Sparkles },
  { href: '/art-portrait', id: 'art-portrait', icon: Sparkles },
  { href: '/looksmax', id: 'looksmax', icon: Sparkles },
  { href: '/time-machine', id: 'time-machine', icon: Sparkles },
  { href: '/sticker-meme', id: 'sticker-meme', icon: MessageCircleHeart },
  { href: '/fortune', id: 'fortune', icon: Sparkles },
  { href: '/thumbnail', id: 'thumbnail', icon: RectangleHorizontal },
  { href: '/storyboard', id: 'storyboard', icon: Rows3 },
  { href: '/tattoo-design', id: 'tattoo-design', icon: PenTool },
  { href: '/guardian-portrait', id: 'guardian-portrait', icon: Shield },
  { href: '/short-drama', id: 'short-drama', icon: Clapperboard },
  { href: '/cinematic-video', id: 'cinematic-video', icon: Clapperboard },
  { href: '/showrunner', id: 'showrunner', icon: Clapperboard },
  { href: '/child-animation', id: 'child-animation', icon: Clapperboard },
  { href: '/kids-book', id: 'kids-book', icon: BookOpenText },
  { href: '/baby-podcast', id: 'baby-podcast', icon: Baby },
  { href: '/viral-video', id: 'viral-video', icon: Flame },
  { href: '/hug-video', id: 'hug-video', icon: HeartHandshake },
  { href: '/family-photo-live', id: 'family-photo-live', icon: MessageCircleHeart },
  { href: '/pet-farewell-video', id: 'pet-farewell-video', icon: Rainbow },
  { href: '/meme-video', id: 'meme-video', icon: Flame },
  { href: '/dynamic-comic', id: 'dynamic-comic', icon: PanelsTopLeft },
  { href: '/virtual-influencer', id: 'virtual-influencer', icon: BadgeCheck },
  { href: '/brand-campaign', id: 'brand-campaign', icon: BadgeCheck },
  { href: '/talking-photo', id: 'talking-photo', icon: MessageCircleHeart },
  { href: '/old-photo-live', id: 'old-photo-live', icon: MessageCircleHeart },
  { href: '/music-video', id: 'music-video', icon: Music2 },
  { href: '/course-video', id: 'course-video', icon: BookOpenText },
  { href: '/video-translate', id: 'video-translate', icon: Wand2 },
  { href: '/video-extend', id: 'video-extend', icon: Wand2 },
  { href: '/video-faceswap', id: 'video-faceswap', icon: Wand2 },
  { href: '/ad-variants', id: 'ad-variants', icon: Wand2 },
  { href: '/video-edit', id: 'video-edit', icon: Wand2 },
  { href: '/video-upscale', id: 'video-upscale', icon: ScanSearch },
  { href: '/voice-agent', id: 'voice-agent', icon: Bot },
  { href: '/avatar-agent', id: 'avatar-agent', icon: Bot },
  { href: '/ugc-ad-factory', id: 'ugc-ad-factory', icon: PlaySquare },
  { href: '/social-publisher', id: 'social-publisher', icon: PlaySquare },
  { href: '/live-room', id: 'live-room', icon: RadioTower },
  { href: '/account-matrix', id: 'account-matrix', icon: CalendarDays },
  { href: '/pod-kit', id: 'pod-kit', icon: PackageCheck },
  { href: '/ar-commerce', id: 'ar-commerce', icon: Cuboid },
  { href: '/combo-studio', id: 'combo-studio', icon: WandSparkles },
];

function activeClass(active: boolean) {
  return active
    ? 'border-brand-200 bg-brand-50 text-brand-800 shadow-soft'
    : 'border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-white hover:text-neutral-900';
}

export function AppSidebar() {
  const pathname = usePathname();
  const { t, appText } = useI18n();

  const byCat = useMemo(() => {
    const m: Record<AppCat, NavApp[]> = { production: [], nocreative: [], incomplete: [] };
    for (const app of PRIMARY_APPS) m[catOf(app.href)].push(app);
    return m;
  }, []);

  // 默认展开「可投入生产」,其余折叠;点标题可展开/收起
  const [open, setOpen] = useState<Record<AppCat, boolean>>({ production: true, nocreative: false, incomplete: false });

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-[76px] max-h-[calc(100vh-96px)] overflow-y-auto pr-1">
        <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('sidebar.apps')}</div>
        <nav className="space-y-2">
          {CAT_META.map((c) => {
            const apps = byCat[c.key];
            const isOpen = open[c.key];
            return (
              <div key={c.key}>
                <button
                  onClick={() => setOpen((o) => ({ ...o, [c.key]: !o[c.key] }))}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-white"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} /> {c.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    {apps.length}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {apps.map((app) => {
                      const Icon = app.icon;
                      const active = pathname === app.href;
                      const text = appText(app.id);
                      return (
                        <Link key={app.href} href={app.href} className={`flex gap-3 rounded-xl border p-3 transition ${activeClass(active)}`}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-500">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{isFeatured(app.href) ? '⭐ ' : ''}{appTitle(app.id, text.title)}</span>
                            <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-neutral-400">{appDesc(app.id, text.description)}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
