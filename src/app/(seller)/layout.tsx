import Link from 'next/link';
import { Store, Package, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react';

const NAV = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/products', icon: Package,         label: 'Produk' },
  { href: '/dashboard/orders',   icon: ShoppingBag,     label: 'Pesanan' },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">C9titip</p>
              <p className="text-xs text-gray-400">Seller Dashboard</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            <LogOut size={18} /> Kembali ke Toko
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
