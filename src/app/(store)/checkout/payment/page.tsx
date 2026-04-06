'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    // Simulate Stripe redirect confirmation — in production use @stripe/react-stripe-js
    // For demo purposes, mark as success after 2s
    const timer = setTimeout(() => setStatus('success'), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'processing') return (
    <div className="flex flex-col items-center gap-4 py-24">
      <Loader2 size={48} className="text-orange-500 animate-spin" />
      <p className="text-gray-600 font-medium">Memproses pembayaran...</p>
    </div>
  );

  if (status === 'success') return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <CheckCircle size={64} className="text-green-500" />
      <h1 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h1>
      <p className="text-gray-500">Pesanan #{orderId?.slice(-8).toUpperCase()} sedang diproses.</p>
      <div className="flex gap-3 mt-2">
        <Link href="/orders" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">Lihat Pesanan</Link>
        <Link href="/products" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">Belanja Lagi</Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <XCircle size={64} className="text-red-500" />
      <h1 className="text-2xl font-bold text-gray-900">Pembayaran Gagal</h1>
      <p className="text-gray-500">Silakan coba lagi.</p>
      <Link href="/cart" className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl text-sm">Kembali ke Keranjang</Link>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="max-w-xl mx-auto px-4">
      <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
