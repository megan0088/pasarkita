import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">C9titip</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors">
            <ArrowLeft size={15} /> Kembali ke Toko
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
