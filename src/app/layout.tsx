import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Atlas Media Studio — AI photo & video',
  description:
    'Generate AI photos and videos from your images. Open-source SaaS starter powered by Atlas Cloud.',
  // Atlas OSS force-downloads images when a Referer is sent — drop it so <img>/<video> render inline.
  referrer: 'no-referrer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
