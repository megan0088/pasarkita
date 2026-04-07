import ProductForm from '@/components/dashboard/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f0fdfa] mb-2">Jual Barangmu</h1>
      <p className="text-gray-500 dark:text-teal-400 text-sm mb-8">Isi detail barang, upload foto, dan langsung jual — gratis!</p>
      <ProductForm />
    </div>
  );
}
