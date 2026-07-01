import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Atlas Media Studio — AI photo & video',
  description:
    'Generate AI photos and videos from your images. Open-source SaaS starter powered by Atlas Cloud.',
  // Atlas OSS force-downloads media when a Referer is sent — drop it so <img>/<video> render inline.
  referrer: 'no-referrer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
