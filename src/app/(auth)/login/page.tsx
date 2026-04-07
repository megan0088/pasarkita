'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Berhasil masuk!');
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke C9titip</h1>
      <p className="text-gray-500 text-sm mb-6">Belum punya akun? <Link href="/register" className="text-green-600 font-medium hover:text-green-700">Daftar gratis</Link></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
            placeholder="email@kamu.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </>
  );
}
