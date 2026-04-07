import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Store, MessageCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';
import { formatPrice, formatDate, getDiscountPercent } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single();
  if (!data) return { title: 'Barang tidak ditemukan' };
  return { title: data.name, description: data.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products').select('*, category:categories(*), seller:profiles(*)')
    .eq('slug', slug).eq('is_active', true).single() as { data: Product | null };
  if (!product) notFound();

  const { data: related } = await supabase
    .from('products').select('*, category:categories(*), seller:profiles(*)')
    .eq('category_id', product.category_id ?? '').eq('is_active', true).neq('id', product.id).limit(4) as { data: Product[] | null };

  const discount = product.compare_price ? getDiscountPercent(product.price, product.compare_price) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-teal-500 mb-6">
        <Link href="/" className="hover:text-green-600 dark:hover:text-teal-300">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-600 dark:hover:text-teal-300">Barang</Link>
        {product.category && (<><span>/</span><Link href={`/products?category=${product.category.slug}`} className="hover:text-green-600 dark:hover:text-teal-300">{product.category.name}</Link></>)}
        <span>/</span>
        <span className="text-gray-800 dark:text-teal-200 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#0a2e2b] border border-gray-100 dark:border-[#134e4a] mb-3">
            {product.image_urls[0]
              ? <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-teal-800"><Store size={64} /></div>}
            {discount && <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">-{discount}%</span>}
          </div>
          {product.image_urls.length > 1 && (
            <div className="flex gap-2">
              {product.image_urls.slice(0, 5).map((url, i) => (
                <div key={i} className="w-16 h-16 relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#134e4a] hover:border-green-500 dark:hover:border-teal-400 transition-colors">
                  <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && <p className="text-sm text-gray-500 dark:text-teal-400 mb-2">{product.category.name}</p>}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f0fdfa] mb-4">{product.name}</h1>

          {/* Price */}
          <div className="bg-green-50 dark:bg-[#0a2e2b] rounded-2xl p-4 mb-5">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-green-700 dark:text-teal-300">{formatPrice(product.price)}</p>
              {product.compare_price && <p className="text-lg text-gray-400 dark:text-teal-600 line-through mb-0.5">{formatPrice(product.compare_price)}</p>}
              {discount && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold px-2 py-0.5 rounded-lg mb-0.5">Hemat {discount}%</span>}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-gray-500 dark:text-teal-500">Kondisi stok:</span>
            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600 dark:text-teal-400' : 'text-red-500'}`}>
              {product.stock > 0 ? 'Tersedia' : 'Habis'}
            </span>
          </div>

          {/* CTA */}
          <div className="space-y-3 mb-6">
            <a href={`https://wa.me/?text=Halo, saya tertarik dengan barang: ${encodeURIComponent(product.name)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors text-white bg-green-600 dark:bg-teal-600 hover:bg-green-700 dark:hover:bg-teal-500">
              <MessageCircle size={18} /> Hubungi Penjual via WhatsApp
            </a>
            <Link href="/products"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-[#134e4a] text-gray-600 dark:text-teal-300 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0a2e2b] transition-colors">
              <ArrowLeft size={16} /> Lihat Barang Lain
            </Link>
          </div>

          {/* Seller */}
          {product.seller_name && (
            <div className="p-4 bg-white dark:bg-[#0d3b38] rounded-2xl border border-gray-100 dark:border-[#134e4a] flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-teal-900/60 rounded-full flex items-center justify-center text-green-700 dark:text-teal-300 font-bold text-sm">
                {product.seller_name[0]?.toUpperCase() ?? 'S'}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-[#f0fdfa] text-sm">{product.seller_name}</p>
                <p className="text-xs text-gray-400 dark:text-teal-500">Penjual · {formatDate(product.created_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white dark:bg-[#0d3b38] rounded-2xl border border-gray-100 dark:border-[#134e4a] p-6 mb-8">
          <h2 className="font-bold text-gray-900 dark:text-[#f0fdfa] mb-4">Deskripsi Barang</h2>
          <p className="text-gray-600 dark:text-teal-300 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 dark:text-[#f0fdfa] mb-4">Barang Serupa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
