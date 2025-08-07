import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const basePath = process.env.NODE_ENV === 'production' ? '/fastingApp' : '';

export const metadata: Metadata = {
  title: 'Monitorul de Pauza Alimentara - Urmărește-ți Călătoria de Pauza Alimentara',
  description:
    'Un monitor cuprinzător de pauza alimentara pentru a urmări fazele și progresul pauzei alimentare intermitente',
  keywords: ['pauza alimentara', 'pauza alimentara intermitenta', 'sănătate', 'wellness', 'monitor'],
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: '32x32' },
      { url: `${basePath}/favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
      { url: `${basePath}/favicon-16.svg`, sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [{ url: `${basePath}/icon-192.png`, sizes: '192x192', type: 'image/png' }],
    shortcut: `${basePath}/favicon.svg`,
  },
  manifest: `${basePath}/manifest.json`,
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
      <head>
        {/* Manual favicon links for better GitHub Pages compatibility */}
        <link rel="icon" type="image/x-icon" href={`${basePath}/favicon.ico`} />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/favicon.svg`} />
        <link rel="shortcut icon" href={`${basePath}/favicon.ico`} />
        <link rel="apple-touch-icon" sizes="192x192" href={`${basePath}/icon-192.png`} />
      </head>
      <body className={GeistSans.className}>{children}</body>
      {/* Google Analytics - va folosi ID-ul din .env.local */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
