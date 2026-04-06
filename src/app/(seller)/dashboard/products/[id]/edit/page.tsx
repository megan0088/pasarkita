import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/dashboard/ProductForm';
interface Props { params: Promise<{ id: string }> }
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
  if (!product) notFound();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Produk</h1>
      <ProductForm defaultValues={product} />
    </div>
  );
}
