'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/provider';
import {
  ArrowRight,
  BadgeCheck,
  Badge,
  Baby,
  Box,
  BookOpenText,
  Bot,
  BriefcaseBusiness,
  Brush,
  Camera,
  Clapperboard,
  Crown,
  Diamond,
  Dumbbell,
  Images,
  ImageUp,
  Flame,
  Gem,
  GraduationCap,
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
  RadioTower,
  Rainbow,
  RectangleHorizontal,
  Rows3,
  ScanSearch,
  Shirt,
  ShoppingCart,
  Scissors,
  Sparkles,
  Shield,
  Sofa,
  Soup,
  Type,
  WandSparkles,
  Wand2,
  CalendarDays,
  Cuboid,
  Zap,
  DollarSign,
  Percent,
} from 'lucide-react';
import { appTitle, appDesc, isFeatured } from '@/config/appCatalog';

type App = { id: string; href: string; icon: typeof Mic2; kind: string };

const APPS: App[] = [
  { id: 'sku-studio', href: '/sku-studio', icon: ShoppingCart, kind: 'pipeline' },
  { id: 'course-studio', href: '/course-studio', icon: GraduationCap, kind: 'pipeline' },
  { id: 'podcast-factory', href: '/podcast', icon: Mic2, kind: 'audio' },
  { id: 'image-explainer', href: '/image-explainer', icon: Images, kind: 'audio/video' },
  { id: 'product-recommendation', href: '/product-recommendation', icon: PackageSearch, kind: 'audio/video' },
  { id: 'sales-video', href: '/sales-video', icon: PlaySquare, kind: 'audio/video' },
  { id: 'bedtime-story', href: '/bedtime-story', icon: Moon, kind: 'audio' },
  { id: 'audio-drama', href: '/audio-drama', icon: Radio, kind: 'audio' },
  { id: 'soundscape', href: '/soundscape', icon: Music2, kind: 'audio' },
  { id: 'voice-meme', href: '/voice-meme', icon: Radio, kind: 'audio' },
  { id: 'meditation', href: '/meditation', icon: Music2, kind: 'audio' },
  { id: 'faceless-channel', href: '/faceless-channel', icon: Radio, kind: 'audio' },
  { id: 'audiobook', href: '/audiobook', icon: BookOpenText, kind: 'audio' },
  { id: 'product-photo', href: '/product-photo', icon: Package, kind: 'image' },
  { id: 'ecommerce-suite', href: '/ecommerce-suite', icon: ShoppingCart, kind: 'LLM' },
  { id: 'photo-studio-suite', href: '/photo-studio-suite', icon: Camera, kind: 'LLM' },
  { id: 'photo-to-life', href: '/photo-to-life', icon: WandSparkles, kind: 'video' },
  { id: 'image-to-3d', href: '/image-to-3d', icon: Box, kind: '3D' },
  { id: 'figurine-3d', href: '/figurine-3d', icon: Box, kind: '3D' },
  { id: 'memorial-figurine', href: '/memorial-figurine', icon: Rainbow, kind: '3D' },
  { id: 'pod-order', href: '/pod-order', icon: PackageCheck, kind: 'LLM' },
  { id: 'game-asset-3d', href: '/game-asset-3d', icon: Cuboid, kind: '3D' },
  { id: 'game-sprite', href: '/game-sprite', icon: PanelsTopLeft, kind: 'image' },
  { id: 'stl-marketplace', href: '/stl-marketplace', icon: PackageCheck, kind: 'LLM' },
  { id: 'text-to-3d', href: '/text-to-3d', icon: Type, kind: '3D' },
  { id: 'headshot', href: '/headshot', icon: BriefcaseBusiness, kind: 'image' },
  { id: 'id-photo', href: '/id-photo', icon: Badge, kind: 'image' },
  { id: 'dating-photo', href: '/dating-photo', icon: Heart, kind: 'image' },
  { id: 'wedding', href: '/wedding', icon: Gem, kind: 'image' },
  { id: 'wedding-trailer', href: '/wedding-trailer', icon: Gem, kind: 'video' },
  { id: 'hairstyle', href: '/hairstyle', icon: Scissors, kind: 'image' },
  { id: 'tattoo', href: '/tattoo', icon: PenLine, kind: 'image' },
  { id: 'makeup', href: '/makeup', icon: Brush, kind: 'image' },
  { id: 'pet-portrait', href: '/pet-portrait', icon: Crown, kind: 'image' },
  { id: 'pet-human', href: '/pet-human', icon: Crown, kind: 'image' },
  { id: 'talking-pet', href: '/talking-pet', icon: Crown, kind: 'video' },
  { id: 'pet-farewell', href: '/pet-farewell', icon: Rainbow, kind: 'image' },
  { id: 'virtual-try-on', href: '/virtual-try-on', icon: Shirt, kind: 'image' },
  { id: 'virtual-model-ad', href: '/virtual-model-ad', icon: Shirt, kind: 'video' },
  { id: 'jewelry-try-on', href: '/jewelry-try-on', icon: Diamond, kind: 'image' },
  { id: 'future-baby', href: '/future-baby', icon: Baby, kind: 'image' },
  { id: 'couple-photo', href: '/couple-photo', icon: HeartHandshake, kind: 'image' },
  { id: 'couple-video', href: '/couple-video', icon: HeartHandshake, kind: 'video' },
  { id: 'fitness-transform', href: '/fitness-transform', icon: Dumbbell, kind: 'image' },
  { id: 'fitness-video', href: '/fitness-video', icon: Dumbbell, kind: 'video' },
  { id: 'virtual-staging', href: '/virtual-staging', icon: Sofa, kind: 'image' },
  { id: 'home-renovation', href: '/home-renovation', icon: Hammer, kind: 'image' },
  { id: 'real-estate-suite', href: '/real-estate-suite', icon: Sofa, kind: 'LLM' },
  { id: 'food-photo', href: '/food-photo', icon: Soup, kind: 'image' },
  { id: 'food-video', href: '/food-video', icon: Soup, kind: 'video' },
  { id: 'ar-menu', href: '/ar-menu', icon: Soup, kind: 'LLM' },
  { id: 'amazon-listing', href: '/amazon-listing', icon: ShoppingCart, kind: 'image' },
  { id: 'photo-restore', href: '/photo-restore', icon: ImageUp, kind: 'image' },
  { id: 'yearbook', href: '/yearbook', icon: Camera, kind: 'image' },
  { id: 'past-life', href: '/past-life', icon: Sparkles, kind: 'image' },
  { id: 'anime-transform', href: '/anime-transform', icon: Sparkles, kind: 'image' },
  { id: 'art-portrait', href: '/art-portrait', icon: Sparkles, kind: 'image' },
  { id: 'looksmax', href: '/looksmax', icon: Sparkles, kind: 'image' },
  { id: 'time-machine', href: '/time-machine', icon: Sparkles, kind: 'image' },
  { id: 'sticker-meme', href: '/sticker-meme', icon: MessageCircleHeart, kind: 'image' },
  { id: 'fortune', href: '/fortune', icon: Sparkles, kind: 'LLM' },
  { id: 'thumbnail', href: '/thumbnail', icon: RectangleHorizontal, kind: 'image' },
  { id: 'storyboard', href: '/storyboard', icon: Rows3, kind: 'image' },
  { id: 'tattoo-design', href: '/tattoo-design', icon: PenTool, kind: 'image' },
  { id: 'guardian-portrait', href: '/guardian-portrait', icon: Shield, kind: 'image' },
  { id: 'short-drama', href: '/short-drama', icon: Clapperboard, kind: 'video' },
  { id: 'cinematic-video', href: '/cinematic-video', icon: Clapperboard, kind: 'video' },
  { id: 'showrunner', href: '/showrunner', icon: Clapperboard, kind: 'LLM' },
  { id: 'child-animation', href: '/child-animation', icon: Clapperboard, kind: 'video' },
  { id: 'kids-book', href: '/kids-book', icon: BookOpenText, kind: 'image' },
  { id: 'baby-podcast', href: '/baby-podcast', icon: Baby, kind: 'video' },
  { id: 'viral-video', href: '/viral-video', icon: Flame, kind: 'video' },
  { id: 'hug-video', href: '/hug-video', icon: HeartHandshake, kind: 'video' },
  { id: 'family-photo-live', href: '/family-photo-live', icon: MessageCircleHeart, kind: 'video' },
  { id: 'pet-farewell-video', href: '/pet-farewell-video', icon: Rainbow, kind: 'video' },
  { id: 'meme-video', href: '/meme-video', icon: Flame, kind: 'video' },
  { id: 'dynamic-comic', href: '/dynamic-comic', icon: PanelsTopLeft, kind: 'video' },
  { id: 'virtual-influencer', href: '/virtual-influencer', icon: BadgeCheck, kind: 'video' },
  { id: 'brand-campaign', href: '/brand-campaign', icon: BadgeCheck, kind: 'video' },
  { id: 'talking-photo', href: '/talking-photo', icon: MessageCircleHeart, kind: 'video' },
  { id: 'old-photo-live', href: '/old-photo-live', icon: MessageCircleHeart, kind: 'video' },
  { id: 'music-video', href: '/music-video', icon: Music2, kind: 'video' },
  { id: 'course-video', href: '/course-video', icon: BookOpenText, kind: 'video' },
  { id: 'video-translate', href: '/video-translate', icon: Wand2, kind: 'video' },
  { id: 'video-extend', href: '/video-extend', icon: Wand2, kind: 'video' },
  { id: 'video-faceswap', href: '/video-faceswap', icon: Wand2, kind: 'video' },
  { id: 'ad-variants', href: '/ad-variants', icon: Wand2, kind: 'video' },
  { id: 'video-edit', href: '/video-edit', icon: Wand2, kind: 'video' },
  { id: 'video-upscale', href: '/video-upscale', icon: ScanSearch, kind: 'video' },
  { id: 'voice-agent', href: '/voice-agent', icon: Bot, kind: 'audio' },
  { id: 'avatar-agent', href: '/avatar-agent', icon: Bot, kind: 'LLM' },
  { id: 'ugc-ad-factory', href: '/ugc-ad-factory', icon: PlaySquare, kind: 'LLM' },
  { id: 'social-publisher', href: '/social-publisher', icon: PlaySquare, kind: 'LLM' },
  { id: 'live-room', href: '/live-room', icon: RadioTower, kind: 'LLM' },
  { id: 'account-matrix', href: '/account-matrix', icon: CalendarDays, kind: 'LLM' },
  { id: 'pod-kit', href: '/pod-kit', icon: PackageCheck, kind: 'LLM' },
  { id: 'ar-commerce', href: '/ar-commerce', icon: Cuboid, kind: 'LLM' },
  { id: 'combo-studio', href: '/combo-studio', icon: WandSparkles, kind: 'LLM' },
];

export default function Home() {
  const { t, appText } = useI18n();
  const appCount = APPS.length;

  const STATS = [
    { icon: Zap, value: '~$0.01-0.04', label: t('home.statCost') },
    { icon: DollarSign, value: '$0.50–1+', label: t('home.statCharge') },
    { icon: Percent, value: '~95%', label: t('home.statMargin') },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* hero */}
      <section className="relative pt-6 text-center sm:pt-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Sparkles className="h-4 w-4" /> {appCount} {t('home.badge')}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            {t('home.titlePre')} <span className="gradient-text">{t('home.titleHl')}</span>{' '}
            {t('home.titlePost')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">{t('home.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/sku-studio" className="btn-brand">
              {t('home.tryStudio')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost">
              {t('home.seePricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="grid gap-5 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <div key={s.label} className="card animate-fade-up p-6 text-center" style={{ animationDelay: `${i * 80}ms` }}>
            <s.icon className="mx-auto h-6 w-6 text-brand-500" />
            <div className="gradient-text mt-3 text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* apps */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {appCount} {t('home.appsTitle')}
        </h2>
        <p className="mt-2 text-center text-neutral-500">{t('home.appsSubtitle')}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app, i) => {
            const a = appText(app.id);
            const Icon = app.icon;
            return (
              <Link
                key={app.id}
                href={app.href}
                className="card group animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    {isFeatured(app.href) && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">⭐ 精品</span>
                    )}
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">{app.kind}</span>
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{appTitle(app.id, a.title)}</h3>
                <p className="mt-1 text-sm text-neutral-500">{appDesc(app.id, a.description)}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition duration-300 group-hover:opacity-100">
                  {t('home.tryIt')} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="card overflow-hidden bg-brand-gradient p-10 text-center text-white shadow-glow sm:p-14">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('home.ctaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">{t('home.ctaSubtitle')}</p>
        <Link
          href="/sku-studio"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-white/90"
        >
          {t('home.ctaBtn')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
