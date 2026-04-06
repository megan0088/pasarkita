import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';
import { SlidersHorizontal } from 'lucide-react';

interface Props {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, category, sort, page } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*)')
    .eq('is_active', true);

  if (q)        query = query.ilike('name', `%${q}%`);
  if (category) query = query.eq('categories.slug', category);

  switch (sort) {
    case 'price_asc':   query = query.order('price', { ascending: true });  break;
    case 'price_desc':  query = query.order('price', { ascending: false }); break;
    case 'bestseller':  query = query.order('sold_count', { ascending: false }); break;
    case 'rating':      query = query.order('rating_avg', { ascending: false }); break;
    default:            query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query.limit(24) as { data: Product[] | null };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Hasil untuk "${q}"` : 'Semua Produk'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{products?.length ?? 0} produk ditemukan</p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500" />
          <select
            defaultValue={sort ?? 'newest'}
            onChange={e => {
              const url = new URL(window.location.href);
              url.searchParams.set('sort', e.target.value);
              window.location.href = url.toString();
            }}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-orange-400"
          >
            <option value="newest">Terbaru</option>
            <option value="bestseller">Terlaris</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {!products || products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
