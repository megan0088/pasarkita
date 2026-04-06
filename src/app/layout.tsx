import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'PasarKita', template: '%s | PasarKita' },
  description: 'Marketplace lokal Indonesia — temukan produk terbaik dari penjual terpercaya.',
  keywords: ['marketplace', 'belanja online', 'indonesia', 'jual beli'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
