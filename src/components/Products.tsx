
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name_ar: string;
  description_ar: string;
  price: string;
  image: string;
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
        price: product.price || '0',
        image: product.image || '/api/placeholder/300/200',
        rating: product.rating || 0,
        googleFormUrl: product.googleFormUrl || '',
        available: product.available
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
  };

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description_ar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price);
        switch (priceFilter) {
          case 'low': return price < 80;
          case 'medium': return price >= 80 && price <= 100;
          case 'high': return price > 100;
          default: return true;
        }
      });
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceFilter, ratingFilter, products]);

  if (loading) {
    return (
      <section id="products" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Coffee className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
            <p className="text-xl text-amber-700">جاري تحميل المنتجات...</p>
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
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            منتجاتنا المميزة
          </h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            اختر من مجموعة واسعة من أجود أنواع القهوة المحمصة بعناية
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="ابحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كل الأسعار</option>
                <option value="low">أقل من 80 جنيه</option>
                <option value="medium">80-100 جنيه</option>
                <option value="high">أكثر من 100 جنيه</option>
              </select>
            </div>
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كل التقييمات</option>
                <option value="4.5">4.5 نجوم فأكثر</option>
                <option value="4.0">4 نجوم فأكثر</option>
                <option value="3.0">3 نجوم فأكثر</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriceFilter('all');
                  setRatingFilter('all');
                }}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600">لا توجد منتجات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-amber-200">
            <Coffee className="mx-auto mb-4 text-amber-700" size={48} />
            <h3 className="text-2xl font-bold text-amber-900 mb-4">
              ✨ عرض خاص للعملاء الجدد ✨
            </h3>
            <p className="text-lg text-amber-800 mb-6">
              توصيل مجاني داخل دمنهور للطلبات أكثر من 150 جنيه
            </p>
            <button 
              onClick={() => window.open('https://wa.me/201234567890?text=أريد الاستفادة من العرض الخاص', '_blank')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              اطلب الآن واستفد من العرض
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
