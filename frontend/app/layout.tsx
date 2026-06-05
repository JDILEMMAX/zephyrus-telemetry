import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zephyrus | Atmospheric Command Center',
  description: 'An enterprise-grade meteorological engine featuring real-time telemetry, edge-cached forecasting, and a decoupled glassmorphism interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
