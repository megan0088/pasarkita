import Link from 'next/link';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0d3b38] border-t border-gray-100 dark:border-[#134e4a] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-600 dark:bg-teal-500 rounded-lg flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-[#f0fdfa]">C9titip</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-teal-400">Platform titip jual barang second. Upload foto, set harga, langsung jual!</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-[#f0fdfa] mb-3 text-sm">Belanja</p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-teal-400">
              <li><Link href="/products" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Semua Barang</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Terbaru</Link></li>
              <li><Link href="/products?sort=price_asc" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Termurah</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-[#f0fdfa] mb-3 text-sm">Jual Barang</p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-teal-400">
              <li><Link href="/dashboard/products/new" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Upload Barang</Link></li>
              <li><Link href="/dashboard/products" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Lihat Semua Iklan</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-[#f0fdfa] mb-3 text-sm">Info</p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-teal-400">
              <li><Link href="/" className="hover:text-green-600 dark:hover:text-teal-300 transition-colors">Beranda</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-[#134e4a] mt-8 pt-6 text-center text-xs text-gray-400 dark:text-teal-700">
          © {new Date().getFullYear()} C9titip. Built by Muhamad Ega Nugraha.
        </div>
      </div>
    </footer>
  );
}
