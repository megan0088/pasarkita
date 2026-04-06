import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import SortSelect from '@/components/product/SortSelect';
import type { Product } from '@/types';

interface Props {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, category, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*)')
    .eq('is_active', true);

  if (q)        query = query.ilike('name', `%${q}%`);
  if (category) query = query.eq('category.slug', category);

  switch (sort) {
    case 'price_asc':   query = query.order('price', { ascending: true });  break;
    case 'price_desc':  query = query.order('price', { ascending: false }); break;
    case 'bestseller':  query = query.order('sold_count', { ascending: false }); break;
    case 'rating':      query = query.order('rating_avg', { ascending: false }); break;
    default:            query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query.limit(24);
  const productList = (products ?? []) as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Hasil untuk "${q}"` : 'Semua Produk'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{productList.length} produk ditemukan</p>
        </div>

        <SortSelect defaultValue={sort} />
      </div>

      {/* Grid */}
      {productList.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productList.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
