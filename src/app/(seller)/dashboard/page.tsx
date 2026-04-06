import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { count: productCount },
    { count: orderCount },
    { data: recentOrders },
    { data: products },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id),
    supabase.from('order_items').select('*, orders!inner(*)', { count: 'exact', head: true })
      .eq('products.seller_id', user.id),
    supabase.from('orders').select('*, items:order_items(*, product:products(*))')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('*').eq('seller_id', user.id)
      .order('sold_count', { ascending: false }).limit(5),
  ]);

  const totalRevenue = (recentOrders ?? []).reduce((sum: number, o: any) => sum + o.total, 0);

  const stats = [
    { label: 'Total Produk',  value: productCount ?? 0,          icon: Package,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Pesanan', value: orderCount ?? 0,            icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
    { label: 'Pendapatan',    value: formatPrice(totalRevenue),   icon: TrendingUp,  color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Seller</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola toko dan produkmu</p>
        </div>
        <Link href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
            <Link href="/dashboard/orders" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          {(!recentOrders || recentOrders.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada pesanan</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Produk Terlaris</h2>
            <Link href="/dashboard/products" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Semua produk <ArrowRight size={14} />
            </Link>
          </div>
          {(!products || products.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada produk</p>
          ) : (
            <div className="space-y-3">
              {products.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">Terjual {p.sold_count} · Stok {p.stock}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    pending:    'bg-yellow-50 text-yellow-700',
    paid:       'bg-blue-50 text-blue-700',
    processing: 'bg-indigo-50 text-indigo-700',
    shipped:    'bg-purple-50 text-purple-700',
    delivered:  'bg-green-50 text-green-700',
    cancelled:  'bg-red-50 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}
