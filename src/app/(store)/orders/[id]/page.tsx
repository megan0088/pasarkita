import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import type { ShippingAddress, OrderItem } from '@/types';

const STATUS_STEPS = ['pending','paid','processing','shipped','delivered'];
const STATUS_LABEL: Record<string, string> = { pending:'Menunggu Pembayaran', paid:'Dibayar', processing:'Sedang Diproses', shipped:'Dalam Pengiriman', delivered:'Selesai', cancelled:'Dibatalkan' };

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, image_urls, slug))')
    .eq('id', id).eq('buyer_id', user.id).single();

  if (!order) notFound();

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const addr = order.shipping_address as ShippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors"><ArrowLeft size={16} /> Kembali ke Pesanan</Link>
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1><p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p></div>
      </div>

      {/* Status stepper */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm">Status Pesanan</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= stepIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                  <p className={`text-[10px] mt-1 text-center ${i <= stepIndex ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>{STATUS_LABEL[s]?.split(' ')[0]}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIndex ? 'bg-orange-500' : 'bg-gray-100'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 text-sm">Produk ({order.items?.length})</h2>
        <div className="space-y-3">
          {order.items?.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                {item.product?.image_urls?.[0] ? <Image src={item.product.image_urls[0]} alt={item.product.name} fill className="object-cover" /> : <Package size={20} className="text-gray-300 m-auto" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.unit_price)} x {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(item.total_price)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-50 mt-4 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Ongkir</span><span>{formatPrice(order.shipping_fee)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100"><span>Total</span><span className="text-orange-600">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm">Alamat Pengiriman</h2>
        <p className="text-sm font-medium text-gray-800">{addr.name}</p>
        <p className="text-sm text-gray-500">{addr.phone}</p>
        <p className="text-sm text-gray-500 mt-1">{addr.address}, {addr.city}, {addr.province} {addr.postal_code}</p>
      </div>
    </div>
  );
}
