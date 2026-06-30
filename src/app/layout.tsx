import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Atlas Video Studio — AI video generator',
  description:
    'Generate AI videos from text or images. Open-source SaaS starter powered by Atlas Cloud.',
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
