import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  const [{ count: userCount }, { count: productCount }, { count: orderCount }, { data: recentOrders }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*, buyer:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
  ]);

  const totalRevenue = (recentOrders ?? []).filter((o: any) => o.status === 'paid' || o.status === 'delivered').reduce((s: number, o: any) => s + o.total, 0);

  const stats = [
    { label: 'Total User', value: userCount ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Produk', value: productCount ?? 0, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Pesanan', value: orderCount ?? 0, icon: ShoppingBag, color: 'bg-orange-50 text-orange-600' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={20} /></div>
            <div><p className="text-xl font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50"><h2 className="font-bold text-gray-900">Pesanan Terbaru</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>{['Order #','Pembeli','Total','Status','Tanggal'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {(recentOrders ?? []).map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.order_number}</td>
                <td className="px-4 py-3 text-gray-700">{o.buyer?.full_name ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{formatPrice(o.total)}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{o.status}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
