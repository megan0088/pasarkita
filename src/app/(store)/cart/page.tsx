'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

const SHIPPING_FEE = 15_000;

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const total    = subtotal + SHIPPING_FEE;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="text-xl font-bold text-gray-800">Keranjang Kosong</h2>
        <p className="text-gray-500">Yuk, temukan produk yang kamu suka!</p>
        <Link href="/products"
          className="mt-2 flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
          Mulai Belanja <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {product.image_urls[0] ? (
                  <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ShoppingBag size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 line-clamp-2 text-sm">{product.name}</p>
                <p className="text-green-700 font-bold mt-1">{formatPrice(product.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sm text-gray-900">{formatPrice(product.price * quantity)}</p>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkir</span><span>{formatPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span className="text-green-700">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout"
              className="mt-5 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/products" className="mt-3 block text-center text-sm text-gray-500 hover:text-green-600 transition-colors">
              Lanjut belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
