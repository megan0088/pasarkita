import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function AllProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Barang</h1>
          <p className="text-sm text-gray-500 mt-1">Barang yang sedang dijual</p>
        </div>
        <Link href="/dashboard/products/new" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Jual Barang
        </Link>
      </div>
      {!products || products.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <Package size={64} className="text-gray-200" />
          <p className="text-gray-500">Belum ada barang. Jadilah yang pertama!</p>
          <Link href="/dashboard/products/new" className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold">Jual Barang Sekarang</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="relative aspect-square bg-gray-50">
                {p.image_urls?.[0]
                  ? <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-gray-200" /></div>}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-gray-400 mb-2">{p.seller_name} · {p.category?.name ?? 'Umum'}</p>
                <p className="text-green-700 font-bold">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
