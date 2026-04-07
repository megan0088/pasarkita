import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';
import { formatPrice, formatNumber, formatDate, getDiscountPercent } from '@/lib/utils';
import AddToCartButton from '@/components/product/AddToCartButton';
import ProductCard from '@/components/product/ProductCard';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single();
  if (!data) return { title: 'Produk tidak ditemukan' };
  return { title: data.name, description: data.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*)')
    .eq('slug', slug).eq('is_active', true).single() as { data: Product | null };
  if (!product) notFound();

  const { data: reviews } = await supabase.from('reviews').select('*, buyer:profiles(full_name, avatar_url)').eq('product_id', product.id).order('created_at', { ascending: false }).limit(10);
  const { data: related } = await supabase.from('products').select('*, category:categories(*), seller:profiles(*)').eq('category_id', product.category_id ?? '').eq('is_active', true).neq('id', product.id).limit(4) as { data: Product[] | null };

  const discount = product.compare_price ? getDiscountPercent(product.price, product.compare_price) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600">Home</Link><span>/</span>
        <Link href="/products" className="hover:text-green-600">Produk</Link>
        {product.category && (<><span>/</span><Link href={`/products?category=${product.category.slug}`} className="hover:text-green-600">{product.category.name}</Link></>)}
        <span>/</span><span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
            {product.image_urls[0] ? <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-200"><Store size={64} /></div>}
            {discount && <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">-{discount}%</span>}
          </div>
          {product.image_urls.length > 1 && (
            <div className="flex gap-2">
              {product.image_urls.slice(0, 5).map((url, i) => (
                <div key={i} className="w-16 h-16 relative rounded-xl overflow-hidden border border-gray-200 hover:border-green-500 transition-colors">
                  <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round(product.rating_avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
            <span className="text-sm text-gray-600">{product.rating_avg} ({formatNumber(product.rating_count)} ulasan)</span>
            <span className="text-gray-300">·</span><span className="text-sm text-gray-500">Terjual {formatNumber(product.sold_count)}</span>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 mb-5">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</p>
              {product.compare_price && <p className="text-lg text-gray-400 line-through mb-0.5">{formatPrice(product.compare_price)}</p>}
              {discount && <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-lg mb-0.5">Hemat {discount}%</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-5 text-sm">
            <span className="text-gray-500">Stok:</span>
            <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-green-700' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} tersisa` : 'Habis'}
            </span>
          </div>
          <AddToCartButton product={product} />
          <div className="mt-5 space-y-2">
            {[{icon: ShieldCheck, text: 'Pembayaran 100% aman & terproteksi'},{icon: Truck, text: 'Pengiriman ke seluruh Indonesia'}].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500"><Icon size={15} className="text-green-500" /> {text}</div>
            ))}
          </div>
          {product.seller && (
            <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">{product.seller.full_name?.[0]?.toUpperCase() ?? 'S'}</div>
              <div><p className="font-semibold text-gray-800 text-sm">{product.seller.full_name}</p><p className="text-xs text-gray-400">Seller</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-12">
        <h2 className="font-bold text-gray-900 mb-2">Ulasan Pembeli</h2>
        <div className="flex items-center gap-3 mb-6">
          <p className="text-5xl font-bold text-gray-900">{product.rating_avg || '0.0'}</p>
          <div>
            <div className="flex items-center gap-1 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={18} className={s <= Math.round(product.rating_avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
            <p className="text-sm text-gray-500">{formatNumber(product.rating_count)} ulasan</p>
          </div>
        </div>
        {!reviews || reviews.length === 0 ? <p className="text-gray-400 text-sm">Belum ada ulasan.</p> : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">{r.buyer?.full_name?.[0]?.toUpperCase() ?? 'U'}</div>
                  <div><p className="text-sm font-medium text-gray-800">{r.buyer?.full_name ?? 'User'}</p><p className="text-xs text-gray-400">{formatDate(r.created_at)}</p></div>
                  <div className="ml-auto flex items-center gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 ml-10">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {related && related.length > 0 && (
        <div><h2 className="font-bold text-gray-900 mb-4">Produk Serupa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      )}
    </div>
  );
}
