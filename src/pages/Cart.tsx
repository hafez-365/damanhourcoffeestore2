
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coffee, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name_ar: string;
    description_ar: string;
    price: string;
    image: string;
  };
}

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(id, name_ar, description_ar, price, image)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل السلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الكمية",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
      toast({
        title: "تم",
        description: "تم حذف المنتج من السلة",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: getTotalPrice(),
          status: 'pending',
          payment_status: 'pending',
          shipping_address: {},
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.product.price),
        total_price: parseFloat(item.product.price) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);

      if (clearError) throw clearError;

      toast({
        title: "تم تأكيد الطلب",
        description: "سيتم التواصل معك قريباً",
      });

      setCartItems([]);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "خطأ",
        description: "فشل في تأكيد الطلب",
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
          <p className="text-xl text-amber-700">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <ShoppingCart className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">سلة التسوق</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">سلة التسوق فارغة</p>
            <a
              href="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              تصفح المنتجات
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <img
                      src={item.product.image || '/api/placeholder/80/80'}
                      alt={item.product.name_ar}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">{item.product.name_ar}</h3>
                      <p className="text-amber-700">{item.product.description_ar}</p>
                      <p className="text-amber-900 font-bold">{item.product.price} جنيه</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse bg-amber-50 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-amber-100 rounded-lg"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-amber-100 rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-amber-900">المجموع الكلي:</span>
                <span className="text-2xl font-bold text-amber-900">{getTotalPrice()} جنيه</span>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={checkout}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold"
                >
                  تأكيد الطلب
                </button>
                <a
                  href="/"
                  className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-bold text-center"
                >
                  متابعة التسوق
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
