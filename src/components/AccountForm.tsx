'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types';

export default function AccountForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '', address: profile?.address ?? '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Profil berhasil diperbarui!');
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-bold text-gray-900 mb-5">Edit Profil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[{ name: 'full_name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama kamu' },
          { name: 'phone', label: 'Nomor HP', type: 'tel', placeholder: '08xx-xxxx-xxxx' },
          { name: 'address', label: 'Alamat', type: 'text', placeholder: 'Alamat lengkap' }
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder}
              value={form[f.name as keyof typeof form]} onChange={e => setForm(fr => ({ ...fr, [f.name]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={handleSignOut}
            className="px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Keluar
          </button>
        </div>
      </form>
    </div>
  );
}
