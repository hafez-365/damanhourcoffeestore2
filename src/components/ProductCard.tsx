import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const totalPrice = product.price * quantity;

  // دالة إضافة المنتج للسلة مع حفظه في Supabase
  const addToCart = async () => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      // تحقق إذا المنتج موجود بالسلة مسبقًا
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingItem) {
        // تحديث الكمية والسعر الكلي
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = newQuantity * product.price;

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price: newTotalPrice,
          })
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (updateError) throw updateError;
      } else {
        // إضافة منتج جديد للسلة
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            unit_price: product.price,
            total_price: product.price * quantity,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: 'تمت الإضافة إلى السلة',
        description: `${product.name_ar} أُضيف إلى السلة.`,
      });
    } catch (error) {
      console.error('خطأ في إضافة المنتج إلى السلة:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة المنتج إلى السلة.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const openModal = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإتمام الطلب.",
        variant: "destructive",
      });
      return;
    }
    setShippingAddress('');
    setQuantity(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      toast({
        title: "عنوان الشحن مطلوب",
        description: "يرجى إدخال عنوان الشحن لإتمام الطلب.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('orders').insert({
        user_id: user!.id,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalPrice,
        notes: '',
        shipping_address: shippingAddress,
      }).select().single();

      if (error || !data) throw error;

      const orderId = data.id;

      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: product.id,
        quantity,
        unit_price: product.price,
        total_price: totalPrice,
      });

      if (itemError) throw itemError;

      toast({
        title: "تم الطلب",
        description: `${product.name_ar} تم إضافته إلى طلباتك.`,
      });

      setModalOpen(false);

    } catch (error) {
      console.error("خطأ في تنفيذ الطلب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تنفيذ الطلب.",
        variant: "destructive",
      });
    }
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  return (
    <>
      <Card className="w-full max-w-sm overflow-hidden rounded-md border bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl flex flex-col">
        <div className="relative w-full aspect-[6/6] overflow-hidden p-2">
          <img
            src={product.image_url || ''}
            alt={product.name_ar}
            className="w-full h-full object-cover rounded-md transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>

        <CardContent className="p-4 flex flex-col flex-grow">
          <h2
            className="mb-2 text-xl font-bold text-gray-800 truncate"
            title={product.name_ar}
          >
            {product.name_ar}
          </h2>

          <p className="mb-4 text-gray-600 line-clamp-5" title={product.description_ar}>
            {product.description_ar}
          </p>

          <div className="text-lg font-semibold text-amber-600 mb-4">
            {product.price} جنيه
          </div>

          <div className="flex justify-between gap-3 mt-auto">
            <button
              onClick={addToCart}
              disabled={isAddingToCart}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-bold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-75"
              aria-label={`أضف ${product.name_ar} إلى السلة`}
            >
              {isAddingToCart ? (
                <>
                  <span className="animate-spin">↻</span>
                  جاري الإضافة
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  أضف إلى السلة
                </>
              )}
            </button>

            <button
              onClick={openModal}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-md font-bold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              aria-label={`اطلب ${product.name_ar} الآن`}
            >
              <ExternalLink size={16} />
              اطلب الآن
            </button>
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-lg">
            <img
              src={product.image_url || ''}
              alt={product.name_ar}
              className="w-20 h-20 rounded object-cover absolute top-6 left-6"
            />

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              aria-label="إغلاق"
            >
              <X size={24} />
            </button>

            <h3 className="mb-4 text-xl font-bold text-center text-gray-800 pt-6">
              تأكيد الطلب
            </h3>

            <div className="mt-20 mb-4 text-center">
              <h4 className="font-semibold text-lg">{product.name_ar}</h4>
              <p className="text-gray-600">{product.description_ar}</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <label className="block mb-2 font-semibold" htmlFor="shippingAddress">
                عنوان الشحن
              </label>
              <input
                id="shippingAddress"
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="أدخل عنوان الشحن"
                className="w-full p-2 border rounded mb-4"
                required
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                    aria-label="إنقاص الكمية"
                  >
                    -
                  </button>
                  <span className="px-3" aria-live="polite" aria-atomic="true">{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
                <div className="font-bold text-lg" aria-live="polite" aria-atomic="true">
                  الإجمالي: {totalPrice} جنيه
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-orange-600 text-white py-3 rounded font-bold transition-colors"
                aria-label="تأكيد الطلب"
              >
                تأكيد الطلب
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
