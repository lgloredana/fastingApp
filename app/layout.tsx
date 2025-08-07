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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon-16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#2563eb',
  };
}

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
