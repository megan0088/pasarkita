import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';
import DarkToggle from '@/components/DarkToggle';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#042f2e]">
      <header className="bg-white dark:bg-[#0d3b38] border-b border-gray-100 dark:border-[#134e4a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 dark:bg-teal-500 rounded-lg flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-[#f0fdfa]">C9titip</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkToggle />
            <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-teal-400 hover:text-green-600 dark:hover:text-teal-300 transition-colors">
              <ArrowLeft size={15} /> Kembali ke Toko
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
