import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { Loader2, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('Favorites: Component rendered', {
    user,
    loading,
    favoritesCount: favorites.length,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    console.log('Favorites: useEffect triggered', { user });
    
    // إذا لم يكن المستخدم مسجل، نوجهه إلى صفحة تسجيل الدخول
    if (!user) {
      console.log('Favorites: No user, redirecting to /auth');
      navigate('/auth');
      return;
    }

    const fetchFavorites = async () => {
      try {
        console.log('Favorites: Fetching favorites for user', user.id);
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            product_id,
            products (
              id,
              name_ar,
              description_ar,
              price,
              image_url,
              rating,
              available,
              created_at
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Favorites: Error fetching favorites:', error);
          throw error;
        }

        console.log('Favorites: Raw data from Supabase:', data);

        // تنسيق البيانات
        const formattedProducts = data
          .map(item => ({
            ...item.products,
            isNew: new Date(item.products.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
          }))
          .filter(product => product.available); // عرض المنتجات المتوفرة فقط

        console.log('Favorites: Formatted products:', formattedProducts);
        setFavorites(formattedProducts);
      } catch (error) {
        console.error('Favorites: Error in fetchFavorites:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل المنتجات المفضلة",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate, toast]);

  if (loading) {
    console.log('Favorites: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
          <p className="mt-2 text-amber-800">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  console.log('Favorites: Rendering content', {
    favoritesCount: favorites.length
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Helmet>
        <title>المفضلة | قهوة دمنهور</title>
        <meta name="description" content="المنتجات المفضلة في متجر قهوة دمنهور" />
      </Helmet>

      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-8">المفضلة</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">لا توجد منتجات في المفضلة</p>
            <p className="text-gray-500 mb-6">
              يمكنك إضافة المنتجات إلى المفضلة بالضغط على زر القلب في صفحة المنتج
            </p>
            <a
              href="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center"
            >
              تصفح المنتجات
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 