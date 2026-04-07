'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Store, Tag } from 'lucide-react';
import { useState } from 'react';
import DarkToggle from '@/components/DarkToggle';

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0d3b38] border-b border-gray-100 dark:border-[#134e4a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-green-600 dark:bg-teal-500 rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-[#f0fdfa]">C9titip</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="flex w-full rounded-xl border border-gray-200 dark:border-[#134e4a] overflow-hidden
              focus-within:border-green-500 dark:focus-within:border-teal-400
              focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-teal-900/40 transition-all">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari barang..."
                className="flex-1 px-4 py-2.5 text-sm outline-none
                  bg-white dark:bg-[#0a2e2b]
                  text-gray-900 dark:text-[#f0fdfa]
                  placeholder:text-gray-400 dark:placeholder:text-teal-700"
              />
              <button type="submit"
                className="px-4 bg-green-600 dark:bg-teal-600 hover:bg-green-700 dark:hover:bg-teal-500 text-white transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Link href="/products"
              className="hidden sm:flex items-center px-3 py-2 rounded-xl text-sm font-medium
                text-gray-700 dark:text-teal-200
                hover:bg-gray-100 dark:hover:bg-teal-900/40 transition-colors">
              Lihat Barang
            </Link>
            <DarkToggle />
            <Link href="/dashboard/products/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors
                bg-green-600 dark:bg-teal-600 hover:bg-green-700 dark:hover:bg-teal-500">
              <Tag size={15} />
              <span>Jual Barang</span>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="flex rounded-xl border border-gray-200 dark:border-[#134e4a] overflow-hidden">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari barang..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white dark:bg-[#0a2e2b] text-gray-900 dark:text-[#f0fdfa] placeholder:text-gray-400 dark:placeholder:text-teal-700"
            />
            <button type="submit" className="px-4 bg-green-600 dark:bg-teal-600 text-white">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Category nav */}
      <div className="border-t border-gray-100 dark:border-[#134e4a] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-2 text-sm text-gray-600 dark:text-teal-300 scrollbar-none">
            {['Elektronik','Fashion Pria','Fashion Wanita','Makanan & Minuman','Kesehatan','Olahraga','Rumah & Taman','Hobi & Koleksi'].map(cat => (
              <Link key={cat}
                href={`/products?category=${encodeURIComponent(cat.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-'))}`}
                className="whitespace-nowrap hover:text-green-600 dark:hover:text-teal-400 transition-colors py-1">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
