import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';

const STATUS_LABEL: Record<string, string> = { pending:'Menunggu', paid:'Dibayar', processing:'Diproses', shipped:'Dikirim', delivered:'Selesai', cancelled:'Batal' };
const STATUS_COLOR: Record<string, string> = { pending:'bg-yellow-50 text-yellow-700', paid:'bg-blue-50 text-blue-700', processing:'bg-indigo-50 text-indigo-700', shipped:'bg-purple-50 text-purple-700', delivered:'bg-green-50 text-green-700', cancelled:'bg-red-50 text-red-700' };

export default async function SellerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get this seller's products first, then get order items for those products
  const { data: sellerProducts } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', user.id);

  const productIds = (sellerProducts ?? []).map(p => p.id);

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, order:orders(*, buyer:profiles(full_name, email)), product:products(name, image_urls)')
    .in('product_id', productIds.length > 0 ? productIds : [''])
    .order('created_at', { ascending: false });

  // Group by order
  type OrderWithItems = Order & { items: OrderItem[] };
  const orderMap = new Map<string, OrderWithItems>();
  for (const item of orderItems ?? []) {
    if (!item.order) continue;
    const oid = item.order.id;
    if (!orderMap.has(oid)) orderMap.set(oid, { ...item.order, items: [] } as OrderWithItems);
    orderMap.get(oid)!.items.push(item as OrderItem);
  }
  const orders = Array.from(orderMap.values());

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Masuk</h1>
      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400"><p>Belum ada pesanan masuk</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)} · {order.buyer?.full_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{STATUS_LABEL[order.status] ?? order.status}</span>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item) => (
                  <p key={item.id} className="text-sm text-gray-600">{item.product?.name} <span className="text-gray-400">x{item.quantity} · {formatPrice(item.total_price)}</span></p>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
