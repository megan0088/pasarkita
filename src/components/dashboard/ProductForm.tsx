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
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    price: defaultValues?.price ?? '',
    compare_price: defaultValues?.compare_price ?? '',
    stock: defaultValues?.stock ?? '',
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
    const { error } = await supabase.storage.from('pasarkita').upload(path, file);
    if (error) { toast.error('Gagal upload gambar'); return; }
    const { data: { publicUrl } } = supabase.storage.from('pasarkita').getPublicUrl(path);
    setForm(f => ({ ...f, image_urls: [...f.image_urls, publicUrl] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) { toast.error('Lengkapi field wajib'); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const slug = slugify(form.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const payload = {
      name: form.name,
      slug: isEdit ? defaultValues.slug : slug,
      description: form.description,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
      is_active: form.is_active,
      image_urls: form.image_urls,
      seller_id: user.id,
    };

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', defaultValues.id)
      : await supabase.from('products').insert(payload);

    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
    router.push('/dashboard/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block text-sm font-semibold text-gray-800 mb-3">Foto Produk</label>
        <div className="flex flex-wrap gap-3">
          {form.image_urls.map((url: string, i: number) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(f => ({ ...f, image_urls: f.image_urls.filter((_: string, j: number) => j !== i) }))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"><X size={10} /></button>
            </div>
          ))}
          {form.image_urls.length < 5 && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-orange-500 transition-colors">
              <Upload size={18} /><span className="text-[10px] mt-1">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <label className="block text-sm font-semibold text-gray-800 mb-1">Detail Produk</label>
        {[
          { name: 'name', label: 'Nama Produk *', type: 'text', placeholder: 'Nama produk kamu' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
            <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name as keyof typeof form] as string} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            placeholder="Deskripsikan produkmu..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori</label>
          <select name="category_id" value={form.category_id} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 bg-white">
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <label className="block text-sm font-semibold text-gray-800">Harga & Stok</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'price', label: 'Harga Jual (Rp) *', placeholder: '50000' },
            { name: 'compare_price', label: 'Harga Coret (Rp)', placeholder: '75000' },
            { name: 'stock', label: 'Stok *', placeholder: '100' },
          ].map(f => (
            <div key={f.name} className={f.name === 'stock' ? 'col-span-2 sm:col-span-1' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
              <input name={f.name} type="number" min="0" placeholder={f.placeholder} value={form[f.name as keyof typeof form] as string} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700">Produk aktif (tampil di toko)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  );
}
