'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Store, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const totalItems = useCartStore(s => s.totalItems());
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">PasarKita</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="flex w-full rounded-xl border border-gray-200 overflow-hidden focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari produk, toko, atau kategori..."
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button type="submit"
                className="px-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ShoppingCart size={22} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            <Link href="/account"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              <User size={18} />
              <span className="hidden md:inline">Akun</span>
            </Link>
            <Link href="/dashboard"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
              <Store size={16} />
              Jualan
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 rounded-xl hover:bg-gray-100">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-orange-400">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="flex-1 px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="px-4 bg-orange-500 text-white">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Category nav */}
      <div className="border-t border-gray-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-2 text-sm text-gray-600 scrollbar-none">
            {['Elektronik','Fashion Pria','Fashion Wanita','Makanan & Minuman','Kesehatan','Olahraga','Rumah & Taman','Hobi & Koleksi'].map(cat => (
              <Link key={cat}
                href={`/products?category=${encodeURIComponent(cat.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-'))}`}
                className="whitespace-nowrap hover:text-orange-500 transition-colors py-1">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
