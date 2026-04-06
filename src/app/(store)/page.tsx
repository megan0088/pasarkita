import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, HeadphonesIcon, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';

async function getFeaturedData() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), seller:profiles(*)')
      .eq('is_active', true)
      .order('sold_count', { ascending: false })
      .limit(8),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order'),
  ]);
  return { products: products as Product[] ?? [], categories: categories as Category[] ?? [] };
}

const BENEFITS = [
  { icon: ShieldCheck, label: 'Pembayaran Aman', desc: 'Transaksi dilindungi' },
  { icon: Truck,       label: 'Pengiriman Cepat', desc: 'Ke seluruh Indonesia' },
  { icon: HeadphonesIcon, label: 'CS 24/7',      desc: 'Siap membantu kamu' },
  { icon: CreditCard,  label: 'Banyak Metode',   desc: 'Transfer & e-wallet' },
];

export default async function HomePage() {
  const { products, categories } = await getFeaturedData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block bg-white/20 backdrop-blur text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              🛍️ Marketplace Lokal Indonesia
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Belanja &amp; Jualan<br />Lebih Mudah
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-md">
              Temukan produk terbaik dari ribuan penjual terpercaya. Mulai jualan sekarang — gratis!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products"
                className="flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
                Mulai Belanja <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 font-semibold px-6 py-3 rounded-xl transition-colors">
                Mulai Jualan
              </Link>
            </div>
          </div>
          <div className="flex-1 hidden md:block" />
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Kategori</h2>
          <Link href="/products" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors flex items-center justify-center text-xl">
                {getCategoryEmoji(cat.slug)}
              </div>
              <span className="text-xs text-center text-gray-600 font-medium leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Produk Terlaris</h2>
          <Link href="/products?sort=bestseller" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Belum ada produk. Jadilah yang pertama jualan!</p>
            <Link href="/dashboard/products/new"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
              Upload Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    'elektronik':      '📱',
    'fashion-pria':    '👔',
    'fashion-wanita':  '👗',
    'makanan-minuman': '🍜',
    'kesehatan':       '💊',
    'olahraga':        '⚽',
    'rumah-taman':     '🏠',
    'hobi-koleksi':    '🎨',
  };
  return map[slug] ?? '📦';
}
