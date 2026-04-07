'use client';
import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart-store';

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  function handle() {
    addItem(product, qty);
    setAdded(true);
    toast.success('Ditambahkan ke keranjang', { description: `${product.name} (x${qty})`, duration: 2000 });
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">Jumlah:</span>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
          <span className="text-sm font-semibold w-8 text-center">{qty}</span>
          <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"><Plus size={14} /></button>
        </div>
        <span className="text-xs text-gray-400">({product.stock} tersisa)</span>
      </div>
      <button
        onClick={handle}
        disabled={product.stock === 0 || added}
        className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${added ? 'bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {added ? <><Check size={18} /> Ditambahkan!</> : <><ShoppingCart size={18} /> Tambah ke Keranjang</>}
      </button>
    </div>
  );
}
