import ProductForm from '@/components/dashboard/ProductForm';
export default function NewProductPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tambah Produk Baru</h1>
      <ProductForm />
    </div>
  );
}
