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
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var saved = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (saved === 'dark' || (!saved && prefersDark)) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 dark:bg-[#042f2e] text-gray-900 dark:text-[#f0fdfa]`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
