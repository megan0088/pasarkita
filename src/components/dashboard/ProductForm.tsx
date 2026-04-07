'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import slugify from 'slugify';
import type { Category, Product } from '@/types';

interface Props { defaultValues?: Partial<Product> }

export default function ProductForm({ defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    seller_name: defaultValues?.seller_name ?? '',
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    price: defaultValues?.price ?? '',
    compare_price: defaultValues?.compare_price ?? '',
    stock: defaultValues?.stock ?? 1,
    category_id: defaultValues?.category_id ?? '',
    is_active: defaultValues?.is_active ?? true,
    image_urls: defaultValues?.image_urls ?? [],
  });

  useEffect(() => {
    createClient().from('categories').select('*').order('sort_order').then(({ data, error }) => {
      if (error) { toast.error('Gagal memuat kategori'); return; }
      setCategories(data ?? []);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('c9titip').upload(path, file);
    if (error) { toast.error('Gagal upload gambar'); return; }
    const { data: { publicUrl } } = supabase.storage.from('c9titip').getPublicUrl(path);
    setForm(f => ({ ...f, image_urls: [...f.image_urls, publicUrl] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.seller_name.trim()) { toast.error('Masukkan nama kamu'); return; }
    if (!form.name || !form.price) { toast.error('Lengkapi nama barang dan harga'); return; }
    setLoading(true);
    const supabase = createClient();

    const slug = slugify(form.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const payload = {
      seller_name: form.seller_name.trim(),
      name: form.name,
      slug: isEdit ? defaultValues!.slug : slug,
      description: form.description,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock) || 1,
      category_id: form.category_id || null,
      is_active: form.is_active,
      image_urls: form.image_urls,
      seller_id: null,
    };

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', defaultValues!.id)
      : await supabase.from('products').insert(payload);

    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isEdit ? 'Barang berhasil diperbarui!' : 'Barang berhasil diupload!');
    router.push('/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seller name */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block text-sm font-semibold text-gray-800 mb-3">Nama Penjual</label>
        <input
          name="seller_name"
          type="text"
          placeholder="Nama kamu (misal: Budi, Toko Andi, dll)"
          value={form.seller_name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
        />
        <p className="text-xs text-gray-400 mt-1.5">Nama ini akan ditampilkan di halaman barang kamu</p>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block text-sm font-semibold text-gray-800 mb-3">Foto Barang</label>
        <div className="flex flex-wrap gap-3">
          {form.image_urls.map((url: string, i: number) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(f => ({ ...f, image_urls: f.image_urls.filter((_: string, j: number) => j !== i) }))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"><X size={10} /></button>
            </div>
          ))}
          {form.image_urls.length < 5 && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-500 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-green-600 transition-colors">
              <Upload size={18} /><span className="text-[10px] mt-1">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Maksimal 5 foto</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <label className="block text-sm font-semibold text-gray-800 mb-1">Detail Barang</label>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Barang *</label>
          <input name="name" type="text" placeholder="Nama barang yang dijual" value={form.name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            placeholder="Ceritakan kondisi barang, kelengkapan, alasan jual, dll..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori</label>
          <select name="category_id" value={form.category_id} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white">
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <label className="block text-sm font-semibold text-gray-800">Harga</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Jual (Rp) *</label>
            <input name="price" type="number" min="0" placeholder="50000" value={form.price as string} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Coret (Rp)</label>
            <input name="compare_price" type="number" min="0" placeholder="75000 (opsional)" value={form.compare_price as string} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-green-600" />
          <span className="text-sm text-gray-700">Langsung tampilkan barang</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
          {loading ? 'Mengupload...' : isEdit ? 'Simpan Perubahan' : 'Upload Barang'}
        </button>
      </div>
    </form>
  );
}
