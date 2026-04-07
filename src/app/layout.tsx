import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'C9titip', template: '%s | C9titip' },
  description: 'Platform jual beli barang second & titip jual. Upload foto, harga, deskripsi — langsung jual!',
  keywords: ['jual beli', 'barang second', 'titip jual', 'marketplace', 'indonesia'],
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
