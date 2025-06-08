import React from 'react';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasMore && !isLoading) {
        onLoadMore();
      }
    },
  });

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لم يتم العثور على نتائج
        </h3>
        <p className="text-gray-600">
          جرب البحث بكلمات مختلفة أو تغيير عوامل التصفية
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(hasMore || isLoading) && (
        <div
          ref={ref}
          className="flex justify-center items-center py-8"
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          ) : (
            <span className="text-gray-500">اسحب لتحميل المزيد</span>
          )}
        </div>
      )}
    </div>
  );
}; 