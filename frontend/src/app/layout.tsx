import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FlashForge Commerce — Flash-Sale Checkout Platform',
  description: 'High-performance flash-sale checkout. Grab exclusive deals before they disappear.',
  keywords: ['flash sale', 'ecommerce', 'deals', 'technology'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <Navbar />
          <CartSidebar />
          <main className="min-h-screen">{children}</main>
          <footer
            className="text-center py-8 text-xs mt-16"
            style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
          >
            © {new Date().getFullYear()} FlashForge Commerce — Production-grade flash-sale platform
          </footer>
        </Providers>
      </body>
    </html>
  );
}
