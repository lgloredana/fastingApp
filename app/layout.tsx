import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monitorul de Post - Urmărește-ți Călătoria de Post Intermitent',
  description:
    'Un monitor cuprinzător de post pentru a urmări fazele și progresul postului intermitent',
  keywords: ['post', 'post intermitent', 'sănătate', 'wellness', 'monitor'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ro' className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>{children}</body>
      {/* Google Analytics - va folosi ID-ul din .env.local */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
