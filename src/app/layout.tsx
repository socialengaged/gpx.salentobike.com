import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { MobileShell } from '@/components/layout/MobileShell';
import type { Locale } from '@/i18n/types';
import { LOCALE_COOKIE } from '@/i18n/types';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Salento Bike Routes',
  description: 'Route in bici per il Salento - visualizza, salva e segui le route offline',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Salento Bike',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale: Locale =
    cookieStore.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'it';

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full font-sans text-slate-900">
        <Script id="salento-pwa-bip" strategy="beforeInteractive">
          {`
(function(){
  if (typeof window === 'undefined') return;
  window.__salentoBip = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__salentoBip = e;
    window.dispatchEvent(new Event('salento-bip-stored'));
  });
})();
`}
        </Script>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
