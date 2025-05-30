
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash } from 'lucide-react';

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
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name_ar: '',
    description_ar: '',
    price: '',
    image: '',
    rating: 5,
    googleFormUrl: '',
    available: true
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingProduct?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name_ar: formData.name_ar,
            description_ar: formData.description_ar,
            price: formData.price,
            image: formData.image,
            rating: formData.rating,
            googleFormUrl: formData.googleFormUrl,
            available: formData.available
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({
          title: "نجح الحفظ",
          description: "تم تحديث المنتج بنجاح",
        });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([{
            name_ar: formData.name_ar,
            description_ar: formData.description_ar,
            price: formData.price,
            image: formData.image,
            rating: formData.rating,
            googleFormUrl: formData.googleFormUrl,
            available: formData.available
          }]);

        if (error) throw error;
        toast({
          title: "نجح الحفظ",
          description: "تم إضافة المنتج بنجاح",
        });
      }

      setEditingProduct(null);
      setIsAddingNew(false);
      setFormData({
        name_ar: '',
        description_ar: '',
        price: '',
        image: '',
        rating: 5,
        googleFormUrl: '',
        available: true
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المنتج",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormData({
      name_ar: '',
      description_ar: '',
      price: '',
      image: '',
      rating: 5,
      googleFormUrl: '',
      available: true
    });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    setFormData({
      name_ar: '',
      description_ar: '',
      price: '',
      image: '',
      rating: 5,
      googleFormUrl: '',
      available: true
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-amber-700">يجب تسجيل الدخول للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-8">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">إدارة المنتجات</h1>
          <Button
            onClick={handleAddNew}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </Button>
        </div>

        {(isAddingNew || editingProduct) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isAddingNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ar">اسم المنتج</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                    placeholder="اسم المنتج بالعربية"
                  />
                </div>
                <div>
                  <Label htmlFor="price">السعر</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="السعر بالجنيه"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description_ar">الوصف</Label>
                <textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  placeholder="وصف المنتج"
                  className="w-full px-3 py-2 border border-input rounded-md resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">رابط الصورة</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="رابط صورة المنتج"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">التقييم</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="googleFormUrl">رابط نموذج الطلب</Label>
                <Input
                  id="googleFormUrl"
                  value={formData.googleFormUrl}
                  onChange={(e) => setFormData({...formData, googleFormUrl: e.target.value})}
                  placeholder="رابط Google Form للطلب"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="available">متوفر للبيع</Label>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  حفظ
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name_ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-amber-700 text-center">
                    <p>لا توجد صورة</p>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-amber-900">{product.name_ar}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.available ? 'متوفر' : 'غير متوفر'}
                  </span>
                </div>
                <p className="text-sm text-amber-700 mb-2">{product.description_ar}</p>
                <p className="text-lg font-bold text-amber-900 mb-4">{product.price} جنيه</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(product)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit size={16} />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => product.id && handleDelete(product.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash size={16} />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
