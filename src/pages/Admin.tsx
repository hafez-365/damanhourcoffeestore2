import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Coffee, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { checkUserAdminStatus } from '@/lib/authUtils';

// تعريف نوع المنتج
export interface Product {
  id?: string;
  name: string;
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  rating: number;
  available: boolean;
}

// المنتج الافتراضي
const defaultProduct: Product = {
  name: '',
  name_ar: '',
  description_ar: '',
  price: 0,
  image_url: '',
  rating: 5,
  available: true,
};

// مكون لوحة تحكم الأدمن
const Admin = () => {
  const { user, loading: userLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // تحقق صلاحية الأدمن عند تغير المستخدم
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const adminStatus = await checkUserAdminStatus(user.id);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('خطأ في التحقق من صلاحية الأدمن:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  // جلب المنتجات من قاعدة البيانات
  const fetchProducts = useCallback(async () => {
    if (!isAdmin) return; // لا تحمل إذا لم يكن أدمن
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error(err);
      toast({ 
        title: 'خطأ', 
        description: 'فشل في تحميل المنتجات', 
        variant: 'destructive' 
      });
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, fetchProducts]);

  // حفظ المنتج في قاعدة البيانات
  const handleSave = useCallback(async (product: Product) => {
    if (!user || !isAdmin) {
      toast({ 
        title: 'خطأ', 
        description: 'ليست لديك الصلاحية', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { 
        name: product.name_ar,
        name_ar: product.name_ar.trim(),
        description_ar: product.description_ar.trim(),
        price: product.price,
        image_url: product.image_url.trim(),
        rating: product.rating,
        available: product.available
      };

      // التحقق من البيانات المطلوبة
      if (!payload.name_ar || !payload.description_ar || !payload.image_url) {
        throw new Error('جميع الحقول المطلوبة يجب ملؤها');
      }

      if (product.id) {
        // تحديث المنتج الموجود
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        
        if (error) throw error;
        
        setProducts(prev => prev.map(p => p.id === product.id ? {...product, ...payload} : p));
      } else {
        // إضافة منتج جديد
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('لم يتم إنشاء المنتج');
        
        setProducts(prev => [data[0], ...prev]);
      }

      toast({ 
        title: 'تم الحفظ', 
        description: 'تم حفظ المنتج بنجاح' 
      });
      setEditingProduct(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ 
        title: 'خطأ في الحفظ', 
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ المنتج', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, isAdmin, toast]);

  // حذف المنتج
  const handleDelete = useCallback(async (id: string) => {
    if (!user || !isAdmin) {
      toast({ 
        title: 'خطأ', 
        description: 'ليست لديك الصلاحية', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ 
        title: 'تم الحذف', 
        description: 'تم حذف المنتج بنجاح' 
      });
    } catch (err) {
      toast({ 
        title: 'خطأ', 
        description: 'فشل في حذف المنتج', 
        variant: 'destructive' 
      });
    } finally {
      setDeleteProductId(null);
    }
  }, [user, isAdmin, toast]);

  // تبديل حالة التوفر
  const toggleAvailability = useCallback(async (p: Product) => {
    if (!user || !isAdmin) {
      toast({ 
        title: 'خطأ', 
        description: 'ليست لديك الصلاحية', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      const updated = { ...p, available: !p.available };
      const { error } = await supabase
        .from('products')
        .update({ available: updated.available })
        .eq('id', p.id!);
      
      if (error) throw error;
      
      setProducts(prev => prev.map(pr => pr.id === p.id ? updated : pr));
    } catch (err) {
      toast({ 
        title: 'خطأ', 
        description: 'فشل في تحديث حالة التوفر', 
        variant: 'destructive' 
      });
    }
  }, [user, isAdmin, toast]);

  // إلغاء التعديل
  const cancelEdit = useCallback(() => {
    setEditingProduct(null);
    setIsAddingNew(false);
  }, []);

  // تحديث حقل في المنتج قيد التحرير
  const handleFieldChange = useCallback((field: keyof Product, value: string | number | boolean) => {
    setEditingProduct(prev => 
      prev ? { ...prev, [field]: value } : null
    );
  }, []);

  // مكونات واجهة المستخدم حسب الحالة
  const renderContent = useMemo(() => {
    // عرض شاشة التحميل أثناء التحقق
    if (userLoading || loading || isAdmin === null) {
      return (
        <div className="container mx-auto px-6 py-20 text-center">
          <Loader2 className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
          <p className="text-xl text-amber-700">جاري التحميل...</p>
        </div>
      );
    }

    // عرض رسالة تسجيل الدخول مطلوبة
    if (!user) {
      return (
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">يجب تسجيل الدخول أولاً</h2>
          <a
            href="/auth"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            تسجيل الدخول
          </a>
        </div>
      );
    }

    // رفض الدخول لغير الأدمن
    if (!isAdmin) {
      return (
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-red-600" size={64} />
          <h2 className="text-2xl font-bold text-red-700 mb-4">لا تملك صلاحية الوصول إلى هذه الصفحة</h2>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">إدارة المنتجات</h1>
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingProduct(defaultProduct);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            aria-label="إضافة منتج جديد"
          >
            <Plus size={20} /> إضافة منتج جديد
          </button>
        </div>

        {(editingProduct || isAddingNew) && (
          <ProductForm 
            product={editingProduct}
            isSaving={isSaving}
            onFieldChange={handleFieldChange}
            onSave={() => editingProduct && handleSave(editingProduct)}
            onCancel={cancelEdit}
          />
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard 
                key={p.id}
                product={p}
                onEdit={() => {
                  setEditingProduct(p);
                  setIsAddingNew(false);
                }}
                onDelete={() => setDeleteProductId(p.id!)}
                onToggleAvailability={() => toggleAvailability(p)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [
    userLoading, loading, isAdmin, user, products, 
    editingProduct, isAddingNew, isSaving, 
    handleFieldChange, handleSave, cancelEdit, toggleAvailability
  ]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* إضافة وسوم منع الفهرسة */}
      <Helmet>
        <title>لوحة تحكم الأدمن</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta http-equiv="Cache-Control" content="no-store, max-age=0" />
        <meta name="description" content="صفحة إدارة خاصة بالموقع" />
      </Helmet>
      
      <Navbar />
      {renderContent}

      <ConfirmationDialog
        open={deleteProductId !== null}
        onCancel={() => setDeleteProductId(null)}
        onConfirm={() => deleteProductId && handleDelete(deleteProductId)}
        title="تأكيد الحذف"
        message="هل أنت متأكد من رغبتك في حذف هذا المنتج؟"
        confirmText="نعم، احذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

// مكون نموذج المنتج
interface ProductFormProps {
  product: Product | null;
  isSaving: boolean;
  onFieldChange: (field: keyof Product, value: string | number | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = React.memo(({ 
  product, 
  isSaving, 
  onFieldChange, 
  onSave, 
  onCancel 
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 className="text-xl font-bold text-amber-900 mb-4">
      {product?.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="block font-medium text-amber-800">اسم المنتج بالعربية *</label>
        <input
          type="text"
          value={product?.name_ar || ''}
          onChange={(e) => onFieldChange('name_ar', e.target.value)}
          placeholder="مثل: قهوة عربية"
          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          required
        />
      </div>
      
      <div className="space-y-1">
        <label className="block font-medium text-amber-800">السعر (جنيه) *</label>
        <input
          type="number"
          value={product?.price || ''}
          onChange={(e) => onFieldChange('price', Number(e.target.value))}
          placeholder="مثل: 50"
          min="0"
          step="0.5"
          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          required
        />
      </div>
      
      <div className="md:col-span-2 space-y-1">
        <label className="block font-medium text-amber-800">الوصف بالعربية *</label>
        <textarea
          value={product?.description_ar || ''}
          onChange={(e) => onFieldChange('description_ar', e.target.value)}
          placeholder="وصف المنتج ومميزاته"
          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[100px]"
          required
        />
      </div>
      
      <div className="md:col-span-2 space-y-1">
        <label className="block font-medium text-amber-800">رابط الصورة *</label>
        <input
          type="url"
          value={product?.image_url || ''}
          onChange={(e) => onFieldChange('image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          required
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="font-semibold text-amber-900">التوفر</label>
        <input
          type="checkbox"
          checked={product?.available || false}
          onChange={(e) => onFieldChange('available', e.target.checked)}
          className="w-5 h-5 accent-amber-600"
        />
      </div>
    </div>

    <div className="mt-6 flex gap-4">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-70"
        aria-label="حفظ المنتج"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        حفظ
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
        aria-label="إلغاء التعديل"
      >
        <X size={18} /> إلغاء
      </button>
    </div>
  </div>
));

// مكون بطاقة المنتج
interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleAvailability 
}) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
    <img 
      src={product.image_url} 
      alt={product.name_ar} 
      className="rounded-lg object-cover aspect-[6/6] w-full bg-gray-100"
      loading="lazy"
      onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
    />
    <h3 className="text-lg font-bold text-amber-900">{product.name_ar}</h3>
    <p className="text-amber-700 line-clamp-2">{product.description_ar}</p>
    <p className="font-semibold text-amber-900">السعر: {product.price.toFixed(2)} جنيه</p>
    <p>
      التوفر:{' '}
      <span className={product.available ? 'text-green-600' : 'text-red-600'}>
        {product.available ? 'متوفر' : 'غير متوفر'}
      </span>
    </p>
    <div className="flex flex-wrap gap-2 mt-auto pt-2">
      <button
        onClick={onEdit}
        className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-1"
        aria-label="تعديل المنتج"
      >
        <Edit size={16} /> تعديل
      </button>
      <button
        onClick={onDelete}
        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
        aria-label="حذف المنتج"
      >
        <Trash2 size={16} /> حذف
      </button>
      <button
        onClick={onToggleAvailability}
        className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
          product.available 
            ? 'bg-gray-600 text-white hover:bg-gray-700' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        aria-label={product.available ? "تعطيل المنتج" : "تفعيل المنتج"}
      >
        {product.available ? "تعطيل" : "تفعيل"}
      </button>
    </div>
  </div>
));

export default Admin;