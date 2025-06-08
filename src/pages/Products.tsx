import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { Helmet } from 'react-helmet-async';

const Products: React.FC = () => {
  const { products, isLoading, hasMore, search, loadMore } = useSearch();
  const [categories] = React.useState([
    'قهوة عربية',
    'قهوة تركية',
    'قهوة أمريكية',
    'مستلزمات القهوة',
    'هدايا',
  ]);

  return (
    <>
      <Helmet>
        <title>المنتجات | قهوة دمنهور</title>
        <meta name="description" content="تسوق أفضل أنواع القهوة ومستلزماتها من متجر قهوة دمنهور" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">المنتجات</h1>
            <p className="text-gray-600">
              اكتشف مجموعتنا المميزة من القهوة ومستلزماتها
            </p>
          </div>

          <div className="mb-8">
            <SearchBar
              onSearch={search}
              categories={categories}
            />
          </div>

          <SearchResults
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </div>
    </>
  );
};

export default Products; 