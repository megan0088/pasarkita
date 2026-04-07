import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function SellerProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
        <Link href="/dashboard/products/new" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>
      {!products || products.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <Package size={64} className="text-gray-200" />
          <p className="text-gray-500">Belum ada produk. Mulai jual sekarang!</p>
          <Link href="/dashboard/products/new" className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold">Tambah Produk</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Produk','Kategori','Harga','Stok','Terjual','Status',''].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {p.image_urls?.[0] ? <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" /> : <Package size={16} className="text-gray-300 m-auto" />}
                      </div>
                      <p className="font-medium text-gray-800 line-clamp-1 max-w-[180px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sold_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors inline-flex">
                      <Pencil size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
