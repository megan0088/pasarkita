import Link from 'next/link';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">PasarKita</span>
            </div>
            <p className="text-sm text-gray-500">Marketplace lokal Indonesia. Belanja mudah, aman, dan terpercaya.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-3 text-sm">Belanja</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-orange-500 transition-colors">Semua Produk</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-orange-500 transition-colors">Produk Terbaru</Link></li>
              <li><Link href="/products?sort=bestseller" className="hover:text-orange-500 transition-colors">Terlaris</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-3 text-sm">Jualan</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard Seller</Link></li>
              <li><Link href="/dashboard/products/new" className="hover:text-orange-500 transition-colors">Upload Produk</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-3 text-sm">Bantuan</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/orders" className="hover:text-orange-500 transition-colors">Lacak Pesanan</Link></li>
              <li><Link href="/account" className="hover:text-orange-500 transition-colors">Akun Saya</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} PasarKita. Built by Muhamad Ega Nugraha.
        </div>
      </div>
    </footer>
  );
}
