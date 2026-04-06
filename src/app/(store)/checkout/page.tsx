'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const SHIPPING_FEE = 15_000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', province: '', postal_code: '' });

  const subtotal = totalPrice();
  const total = subtotal + SHIPPING_FEE;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { toast.error('Keranjang kosong'); return; }
    const missing = Object.entries(form).find(([, v]) => !v.trim());
    if (missing) { toast.error('Lengkapi semua data pengiriman'); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const orderNumber = `PK-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      buyer_id: user.id,
      status: 'pending',
      subtotal,
      shipping_fee: SHIPPING_FEE,
      total,
      shipping_address: form,
    }).select().single();

    if (error || !order) { toast.error('Gagal membuat pesanan'); setLoading(false); return; }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.product.price,
      total_price: i.product.price * i.quantity,
    }));
    await supabase.from('order_items').insert(orderItems);

    // Create Stripe payment intent
    const res = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, amount: total }),
    });
    const { clientSecret, error: stripeErr } = await res.json();
    if (stripeErr) { toast.error('Gagal memproses pembayaran'); setLoading(false); return; }

    router.push(`/checkout/payment?order=${order.id}&secret=${clientSecret}`);
    clearCart();
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Keranjang kamu kosong.</p>
        <a href="/products" className="text-orange-500 font-medium hover:text-orange-600">Mulai belanja →</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shipping form */}
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Alamat Pengiriman</h2>
              <div className="space-y-4">
                {[
                  { name: 'name', label: 'Nama Penerima', placeholder: 'Nama lengkap', type: 'text' },
                  { name: 'phone', label: 'Nomor HP', placeholder: '08xx-xxxx-xxxx', type: 'tel' },
                  { name: 'address', label: 'Alamat Lengkap', placeholder: 'Jl. Contoh No. 1, RT/RW, Kelurahan', type: 'text' },
                  { name: 'city', label: 'Kota', placeholder: 'Jakarta', type: 'text' },
                  { name: 'province', label: 'Provinsi', placeholder: 'DKI Jakarta', type: 'text' },
                  { name: 'postal_code', label: 'Kode Pos', placeholder: '12345', type: 'text' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                    <input name={f.name} type={f.type} placeholder={f.placeholder}
                      value={form[f.name as keyof typeof form]} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan ({items.length} produk)</h2>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map(i => (
                  <div key={i.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">{i.product.name} x{i.quantity}</span>
                    <span className="text-gray-800 font-medium shrink-0">{formatPrice(i.product.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Ongkir</span><span>{formatPrice(SHIPPING_FEE)}</span></div>
                <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span><span className="text-orange-600">{formatPrice(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? 'Memproses...' : <><ShieldCheck size={16} /> Lanjut ke Pembayaran <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
