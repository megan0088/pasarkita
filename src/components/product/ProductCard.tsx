import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.compare_price
    ? getDiscountPercent(product.price, product.compare_price)
    : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image_urls[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart size={32} />
            </div>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Habis</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm text-gray-800 line-clamp-2 leading-snug mb-1 font-medium">
            {product.name}
          </p>
          {product.seller_name && (
            <p className="text-xs text-gray-400 mb-2 truncate">{product.seller_name}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-gray-900">{formatPrice(product.price)}</p>
              {product.compare_price && (
                <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
