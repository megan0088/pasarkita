import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = { pending:'Menunggu Pembayaran', paid:'Dibayar', processing:'Diproses', shipped:'Dikirim', delivered:'Selesai', cancelled:'Dibatalkan' };
const STATUS_COLOR: Record<string, string> = { pending:'bg-yellow-50 text-yellow-700', paid:'bg-blue-50 text-blue-700', processing:'bg-indigo-50 text-indigo-700', shipped:'bg-purple-50 text-purple-700', delivered:'bg-green-50 text-green-700', cancelled:'bg-red-50 text-red-700' };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(quantity, product:products(name, image_urls))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>
      {!orders || orders.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <Package size={64} className="text-gray-200" />
          <p className="text-gray-500">Belum ada pesanan</p>
          <Link href="/products" className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 2).map((item: any, i: number) => (
                  <p key={i} className="text-sm text-gray-600">{item.product?.name} <span className="text-gray-400">x{item.quantity}</span></p>
                ))}
                {order.items?.length > 2 && <p className="text-xs text-gray-400">+{order.items.length - 2} produk lainnya</p>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div><p className="text-xs text-gray-400">Total Pembayaran</p><p className="font-bold text-gray-900">{formatPrice(order.total)}</p></div>
                <Link href={`/orders/${order.id}`} className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:text-green-700">Detail <ArrowRight size={14} /></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
