'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Akun berhasil dibuat! Silakan masuk.');
    router.push('/login');
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun Baru</h1>
      <p className="text-gray-500 text-sm mb-6">Sudah punya akun? <Link href="/login" className="text-orange-500 font-medium hover:text-orange-600">Masuk</Link></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
          <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" placeholder="Nama kamu" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" placeholder="email@kamu.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" placeholder="Min. 6 karakter" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Daftar sebagai</label>
          <div className="grid grid-cols-2 gap-3">
            {(['buyer','seller'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${role === r ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {r === 'buyer' ? '🛍️ Pembeli' : '🏪 Penjual'}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>
    </>
  );
}
