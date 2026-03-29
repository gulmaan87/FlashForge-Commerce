import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlashForge Commerce — Flash-Sale Checkout Platform',
  description: 'High-performance flash-sale checkout. Grab exclusive deals before they disappear.',
  keywords: ['flash sale', 'ecommerce', 'deals', 'fashion', 'apparel'],
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <CartSidebar />
          <main className="min-h-screen">{children}</main>

          {/* Footer */}
          <footer
            className="relative mt-20 py-10 text-center overflow-hidden"
            style={{ borderTop: '1px solid rgba(249,115,22,0.1)' }}
          >
            {/* Footer gradient bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(249,115,22,0.03))',
              }}
            />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316">
                    <path d="M13 3L4 14h8l-1 7 9-11h-8l1-10z"/>
                  </svg>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  FLASHFORGE COMMERCE
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                © {new Date().getFullYear()} FlashForge Commerce — Production-grade flash-sale microservices platform
              </p>
              <p className="text-xs" style={{ color: 'rgba(90,91,110,0.6)' }}>
                Built with Next.js · Express · MongoDB · RabbitMQ · Redis
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
