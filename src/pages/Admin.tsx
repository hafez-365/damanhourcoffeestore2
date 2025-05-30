
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Coffee } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Product {
  id?: number;
  name_ar: string;
  description_ar: string;
  price: string;
  image: string;
  rating: number;
  googleFormUrl: string;
  available: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultProduct: Product = {
    name_ar: '',
    description_ar: '',
    price: '',
    image: '',
    rating: 5,
    googleFormUrl: '',
    available: true,
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = data?.map(product => ({
        id: product.id,
        name_ar: product.name_ar || product.name || '',
        description_ar: product.description_ar || product.description || '',
        price: product.price || '0',
        image: product.image || '',
        rating: product.rating || 5,
        googleFormUrl: product.googleFormUrl || '',
        available: product.available ?? true
      })) || [];

      setProducts(formattedProducts);
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

  const saveProduct = async (product: Product) => {
    try {
      const productData = {
        name_ar: product.name_ar,
        description_ar: product.description_ar,
        price: product.price,
        image: product.image,
        rating: product.rating,
        googleFormUrl: product.googleFormUrl,
        available: product.available,
      };

      if (product.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      }

      fetchProducts();
      setEditingProduct(null);
      setIsAddingNew(false);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المنتج بنجاح",
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المنتج",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchProducts();
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !product.available })
        .eq('id', product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المنتج",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
          <p className="text-xl text-amber-700">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">إدارة المنتجات</h1>
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingProduct(defaultProduct);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        </div>

        {/* Product Form */}
        {(editingProduct || isAddingNew) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-amber-900 mb-4">
              {isAddingNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-800 font-medium mb-2">اسم المنتج (عربي)</label>
                <input
                  type="text"
                  value={editingProduct?.name_ar || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, name_ar: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-amber-800 font-medium mb-2">السعر (جنيه)</label>
                <input
                  type="text"
                  value={editingProduct?.price || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, price: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-amber-800 font-medium mb-2">وصف المنتج (عربي)</label>
                <textarea
                  value={editingProduct?.description_ar || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, description_ar: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-amber-800 font-medium mb-2">رابط الصورة</label>
                <input
                  type="url"
                  value={editingProduct?.image || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, image: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-amber-800 font-medium mb-2">التقييم (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={editingProduct?.rating || 5}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, rating: parseFloat(e.target.value)} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-amber-800 font-medium mb-2">رابط نموذج Google</label>
                <input
                  type="url"
                  value={editingProduct?.googleFormUrl || ''}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, googleFormUrl: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingProduct?.available || false}
                  onChange={(e) => setEditingProduct(prev => prev ? {...prev, available: e.target.checked} : null)}
                  className="mr-2"
                />
                <label className="text-amber-800 font-medium">متاح للطلب</label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => editingProduct && saveProduct(editingProduct)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                حفظ
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddingNew(false);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X size={20} />
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={product.image || '/api/placeholder/300/200'}
                alt={product.name_ar}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-amber-900 mb-2">{product.name_ar}</h3>
                <p className="text-amber-700 text-sm mb-2">{product.description_ar}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-amber-900">{product.price} جنيه</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.available ? 'متاح' : 'غير متاح'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      product.available 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {product.available ? 'إخفاء' : 'إظهار'}
                  </button>
                  <button
                    onClick={() => product.id && deleteProduct(product.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
