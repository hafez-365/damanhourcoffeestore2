import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { formatCurrency } from "@/utils/currencyUtils";
import { useCart } from "@/context/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartActions } from "@/components/cart/CartActions";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// تعريف أنواع البيانات
type UserAddress = {
  id: string;
  user_id: string;
  governorate: string;
  city: string;
  street: string;
  notes?: string | null;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
};

type CartItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name_ar: string;
    description_ar: string | null;
    price: number;
    image_url: string | null;
  };
};

// نوع جديد لبيانات السلة المسترجعة من Supabase
type SupabaseCartItem = {
  id: string;
  quantity: number;
  products: {
    id: number;
    name_ar: string;
    description_ar: string | null;
    price: number;
    image_url: string | null;
  } | null;
};

// نوع لبيانات المنتج
type ProductData = {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
};

const Cart: React.FC = () => {
  const { user, loading: checkingSession } = useAuth();
  const { toast } = useToast();
  const { cart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // جلب عناوين المستخدم من Supabase
  const fetchUserAddresses = useCallback(async () => {
    if (!user) return;

    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setAddresses(data || []);
      
      // تحديد العنوان الافتراضي إذا كان متوفراً
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast({
        title: "خطأ في تحميل العناوين",
        description: "تعذر تحميل عناوين الشحن الخاصة بك",
        variant: "destructive",
      });
    } finally {
      setLoadingAddresses(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user, fetchUserAddresses]);

  const fetchCartItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching cart items for user:', user.id);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          product:products (
            id,
            name_ar,
            description_ar,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      console.log('Cart items response:', { data, error });

      if (error) throw error;

      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل السلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(itemId);

    try {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          total_price: item.unit_price * newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الكمية",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchCartItems();
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج من السلة",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // تأكيد الطلب
  const checkout = useCallback(async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للمتابعة",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddressId) {
      toast({
        title: "عنوان الشحن مطلوب",
        description: "يرجى اختيار عنوان الشحن قبل المتابعة",
        variant: "destructive",
      });
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast({
        title: "خطأ في العنوان",
        description: "العنوان المحدد غير صالح",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات إلى السلة قبل المتابعة",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // حساب إجمالي الطلب من عناصر السلة
      const orderTotal = cartItems.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0);

      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: orderTotal,
          status: "pending",
          payment_status: "pending",
          shipping_address: {
            governorate: selectedAddress.governorate,
            city: selectedAddress.city,
            street: selectedAddress.street,
            notes: selectedAddress.notes,
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order || !order.id) throw new Error("فشل في إنشاء الطلب");

      // إضافة عناصر الطلب
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // حذف عناصر السلة من قاعدة البيانات وتحديث الحالة المحلية
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
      
      await clearCart();

      toast({
        title: "تم تأكيد الطلب",
        description: "سيتم التواصل معك قريباً لتأكيد التفاصيل",
      });

      // إعادة توجيه إلى صفحة الطلب
      navigate("/orders/" + order.id);
    } catch (error) {
      const err = error as Error;
      console.error("Checkout error:", err);
      toast({
        title: "خطأ في تأكيد الطلب",
        description: err.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, user, totalPrice, selectedAddressId, addresses, navigate, toast, clearCart]);

  // حالات التحميل
  if (checkingSession) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      >
        <Helmet>
          <title>جاري التحميل - سلة التسوق</title>
          <meta
            name="description"
            content="جاري تحميل محتويات سلة التسوق الخاصة بك"
          />
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Loader2
            className="mx-auto mb-4 text-amber-700 animate-spin"
            size={48}
          />
          <p className="text-xl text-amber-700">جاري تحميل سلة المشتريات...</p>
        </div>
      </div>
    );
  }

  // حالة عدم تسجيل الدخول
  if (!user) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      >
        <Helmet>
          <title>تسجيل الدخول مطلوب - سلة التسوق</title>
          <meta
            name="description"
            content="سجل الدخول لإدارة سلة التسوق الخاصة بك"
          />
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
          <p className="text-gray-600 mb-6">
            سجل الدخول لإدارة سلة المشتريات الخاصة بك
          </p>
          <a
            href="/auth"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            aria-label="تسجيل الدخول"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">سلة التسوق</h1>
          <p className="text-gray-600">سلة التسوق فارغة</p>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <Helmet>
        <title>سلة التسوق | قهوة دمنهور</title>
        <meta name="description" content="عرض وإدارة سلة التسوق الخاصة بك" />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">سلة التسوق</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start gap-4">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name_ar}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product.name_ar}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.product.description_ar}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                        >
                          {updating === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                        >
                          {updating === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                      >
                        {updating === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="mt-2 text-left">
                      <span className="text-gray-600">{formatCurrency(item.total_price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل</span>
                <span>مجاناً</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between font-semibold">
                <span>الإجمالي</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={checkout}>
              إتمام الطلب
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showClearCartDialog}
        onCancel={() => setShowClearCartDialog(false)}
        onConfirm={async () => {
          try {
            await clearCart();
            setShowClearCartDialog(false);
          } catch (error) {
            console.error("Failed to clear cart:", error);
          }
        }}
        title="إفراغ سلة التسوق"
        message="هل أنت متأكد من رغبتك في إفراغ سلة التسوق بالكامل؟"
        confirmText="نعم، إفراغ السلة"
        cancelText="إلغاء"
      />

      <ConfirmationDialog
        open={!!addressToDelete}
        onCancel={() => setAddressToDelete(null)}
        onConfirm={async () => {
          if (!addressToDelete) return;
          
          try {
            const { error } = await supabase
              .from("user_addresses")
              .delete()
              .eq("id", addressToDelete);

            if (error) throw error;

            setAddresses(prev => prev.filter(addr => addr.id !== addressToDelete));
            
            if (selectedAddressId === addressToDelete) {
              const remainingAddresses = addresses.filter(addr => addr.id !== addressToDelete);
              if (remainingAddresses.length > 0) {
                setSelectedAddressId(remainingAddresses[0].id);
              } else {
                setSelectedAddressId("");
              }
            }

            toast({
              title: "تم حذف العنوان",
              description: "تم حذف عنوان الشحن بنجاح",
            });
          } catch (error) {
            console.error("Failed to delete address:", error);
            toast({
              title: "خطأ في حذف العنوان",
              description: "حدث خطأ أثناء محاولة حذف العنوان",
              variant: "destructive",
            });
          } finally {
            setAddressToDelete(null);
          }
        }}
        title="حذف عنوان الشحن"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان؟"
        confirmText="نعم، احذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default Cart;
