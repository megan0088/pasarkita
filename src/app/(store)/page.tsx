import Link from 'next/link';
import { ArrowRight, ShieldCheck, Camera, Tag, PackageCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';

async function getData() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*), seller:profiles(*)')
      .eq('is_active', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  return { products: (products ?? []) as Product[], categories: (categories ?? []) as Category[] };
}

const HOW_IT_WORKS = [
  { icon: Camera,       title: 'Foto Barangmu',       desc: 'Upload foto barang yang mau dijual, max 5 foto' },
  { icon: Tag,          title: 'Set Harga & Deskripsi', desc: 'Tentukan harga dan ceritakan kondisi barang' },
  { icon: PackageCheck, title: 'Langsung Jual!',       desc: 'Barang langsung tampil dan siap dibeli orang' },
];

const BENEFITS = [
  { icon: ShieldCheck,  label: 'Transaksi Aman',   desc: 'Pembayaran terlindungi' },
  { icon: Camera,       label: 'Mudah Upload',      desc: 'Cukup foto & deskripsi' },
  { icon: Tag,          label: 'Gratis Berjualan',  desc: 'Tanpa biaya listing' },
  { icon: PackageCheck, label: 'Barang Second OK',  desc: 'Kondisi apapun boleh' },
];

export default async function HomePage() {
  const { products, categories } = await getData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 dark:from-[#0d3b38] dark:to-[#042f2e] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 dark:bg-teal-500/20 backdrop-blur text-sm font-medium px-4 py-1.5 rounded-full mb-4 dark:text-teal-300">
              Titip Jual Barangmu Sekarang
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 dark:text-[#f0fdfa]">
              Jual Barang<br />Semudah Upload Foto
            </h1>
            <p className="text-green-100 dark:text-teal-300 text-lg mb-8 max-w-md">
              Punya barang yang mau dijual? Upload foto, set harga, tulis deskripsi — selesai. Barangmu langsung tampil dan bisa dibeli siapa saja.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/products/new"
                className="flex items-center gap-2 bg-white dark:bg-teal-400 text-green-700 dark:text-[#042f2e] font-semibold px-6 py-3 rounded-xl hover:bg-green-50 dark:hover:bg-teal-300 transition-colors">
                Mulai Jual Sekarang <ArrowRight size={16} />
              </Link>
              <Link href="/products"
                className="flex items-center gap-2 bg-white/20 dark:bg-teal-900/40 hover:bg-white/30 dark:hover:bg-teal-900/60 font-semibold px-6 py-3 rounded-xl transition-colors dark:text-teal-200">
                Lihat Barang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-[#0d3b38] border-b border-gray-100 dark:border-[#134e4a]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-center text-xl font-bold text-gray-900 dark:text-[#f0fdfa] mb-8">Cara Kerja C9titip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-green-50 dark:bg-[#0a2e2b]">
                <div className="w-12 h-12 bg-green-600 dark:bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 dark:text-teal-400 mb-1">LANGKAH {i + 1}</span>
                <p className="font-semibold text-gray-900 dark:text-[#f0fdfa] mb-1">{title}</p>
                <p className="text-sm text-gray-500 dark:text-teal-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 dark:bg-[#042f2e] border-b border-gray-100 dark:border-[#134e4a]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-teal-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-green-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#f0fdfa]">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-teal-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#f0fdfa]">Kategori</h2>
            <Link href="/products" className="text-sm text-green-600 dark:text-teal-400 hover:text-green-700 dark:hover:text-teal-300 font-medium flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-[#0d3b38] rounded-2xl border border-gray-100 dark:border-[#134e4a] hover:border-green-200 dark:hover:border-teal-500 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-green-50 dark:bg-teal-900/40 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-teal-900/60 transition-colors flex items-center justify-center text-xl">
                  {getCategoryEmoji(cat.slug)}
                </div>
                <span className="text-xs text-center text-gray-600 dark:text-teal-300 font-medium leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest listings */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#f0fdfa]">Barang Terbaru</h2>
          <Link href="/products" className="text-sm text-green-600 dark:text-teal-400 hover:text-green-700 dark:hover:text-teal-300 font-medium flex items-center gap-1">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0d3b38] rounded-2xl border border-dashed border-gray-200 dark:border-[#134e4a]">
            <p className="text-gray-400 dark:text-teal-500 mb-4">Belum ada barang. Jadilah yang pertama jualan!</p>
            <Link href="/dashboard/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 dark:bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 dark:hover:bg-teal-500 transition-colors">
              Upload Barang Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    'elektronik': '📱', 'fashion-pria': '👔', 'fashion-wanita': '👗',
    'makanan-minuman': '🍜', 'kesehatan': '💊', 'olahraga': '⚽',
    'rumah-taman': '🏠', 'hobi-koleksi': '🎨',
  };
  return map[slug] ?? '📦';
}
