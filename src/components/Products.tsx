// Products.tsx
import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
import Filters from './Filters'; // تم استدعاء المكون المنفصل

interface Product {
  id: number;
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  rating: number;
  googleFormUrl: string;
  available: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = data?.map(product => ({
        id: product.id,
        name_ar: product.name_ar || product.name || '',
        description_ar: product.description_ar || product.description || '',
        price: Number(product.price) || 0,
        image_url: product.image_url || '/api/placeholder/300/200',
        rating: product.rating || 0,
        googleFormUrl: product.googleFormUrl || '',
        available: product.available ?? true
      })) || [];

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(product =>
        product.name_ar.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description_ar.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = Number(product.price) || 0;
        if (priceFilter === 'low') return price < 80;
        if (priceFilter === 'medium') return price >= 80 && price <= 100;
        if (priceFilter === 'high') return price > 100;
        return true;
      });
    }

    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    return filtered;
  }, [debouncedSearchTerm, priceFilter, ratingFilter, products]);

  useEffect(() => {
    setFilteredProducts(filterProducts());
  }, [filterProducts]);

  if (loading) {
    return (
      <section id="products" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Coffee className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
            <p className="text-xl font-semibold text-amber-700">جاري تحميل المنتجات، يرجى الانتظار...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
            <Coffee className="mx-4 text-amber-700" size={28} />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">منتجاتنا المميزة</h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">اختر من مجموعة واسعة من أجود أنواع القهوة المحمصة بعناية</p>
        </div>

        {products.length > 0 && (
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            resetFilters={() => {
              setSearchTerm('');
              setPriceFilter('all');
              setRatingFilter('all');
            }}
            resultCount={filteredProducts.length}
          />
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600">
              {products.length === 0
                ? "لا توجد منتجات متاحة حالياً"
                : "لا توجد نتائج تطابق البحث أو الفلاتر المحددة"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-amber-200">
            <Coffee className="mx-auto mb-4 text-amber-700" size={48} />
            <h3 className="text-2xl font-bold text-amber-900 mb-4">✨ عرض خاص للعملاء الجدد ✨</h3>
            <p className="text-lg text-amber-800 mb-6">توصيل مجاني داخل دمنهور للطلبات أكثر من 150 جنيه</p>
            <button 
              onClick={() => window.open('https://wa.me/+201229204276?text=أريد الاستفادة من العرض الخاص', '_blank')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition flex items-center justify-center gap-2"
            >
              <Coffee size={20} /> اطلب الآن عبر واتساب
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
