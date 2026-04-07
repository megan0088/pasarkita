'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

export default function SortSelect({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal size={16} className="text-gray-500" />
      <select
        defaultValue={defaultValue ?? 'newest'}
        onChange={handleChange}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-green-500"
      >
        <option value="newest">Terbaru</option>
        <option value="bestseller">Terlaris</option>
        <option value="rating">Rating Tertinggi</option>
        <option value="price_asc">Harga Terendah</option>
        <option value="price_desc">Harga Tertinggi</option>
      </select>
    </div>
  );
}
