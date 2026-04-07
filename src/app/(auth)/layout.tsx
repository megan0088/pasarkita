import Link from 'next/link';
import { Store } from 'lucide-react';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center"><Store size={20} className="text-white" /></div>
            <span className="text-2xl font-bold text-gray-900">C9titip</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">{children}</div>
      </div>
    </div>
  );
}
