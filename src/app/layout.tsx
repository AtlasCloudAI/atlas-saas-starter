import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AppSidebar } from '@/components/AppSidebar';

export const metadata: Metadata = {
  title: 'Atlas Media Studio — AI media SaaS',
  description:
    'Generate AI photos, videos, and podcasts. Open-source SaaS starter powered by Atlas Cloud.',
  // Atlas OSS force-downloads media when a Referer is sent — drop it so <img>/<video> render inline.
  referrer: 'no-referrer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <Navbar />
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 py-8 sm:py-10">
            <AppSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
