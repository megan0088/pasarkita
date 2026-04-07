import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountForm from '@/components/AccountForm';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error || !profile) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Akun Saya</h1>
      <div className="space-y-4 mb-8">
        <Link href="/orders" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-green-200 transition-colors">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Package size={18} className="text-green-600" /></div>
          <div><p className="font-semibold text-gray-800 text-sm">Pesanan Saya</p><p className="text-xs text-gray-400">Lihat riwayat belanja</p></div>
        </Link>
      </div>
      <AccountForm profile={profile} />
    </div>
  );
}
