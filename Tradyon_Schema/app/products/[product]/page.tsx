import CategoryEditor from '@/components/CategoryEditor';

interface ProductPageProps {
  params: Promise<{
    product: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const productName = decodeURIComponent(resolvedParams.product);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <CategoryEditor productName={productName} />
    </div>
  );
}
