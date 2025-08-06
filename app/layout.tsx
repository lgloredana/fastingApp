import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fasting Tracker - Track Your Intermittent Fasting Journey',
  description:
    'A comprehensive fasting tracker to monitor your intermittent fasting phases and progress',
  keywords: [
    'fasting',
    'intermittent fasting',
    'health',
    'wellness',
    'tracker',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
