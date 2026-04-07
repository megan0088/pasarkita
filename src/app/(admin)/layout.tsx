import Link from 'next/link';
import { Store, Users, Package, ShoppingBag, LayoutDashboard } from 'lucide-react';
const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/products', icon: Package, label: 'Produk' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-gray-900 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><Store size={16} className="text-white" /></div>
            <div><p className="font-bold text-white text-sm">C9titip</p><p className="text-xs text-gray-400">Admin Panel</p></div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
