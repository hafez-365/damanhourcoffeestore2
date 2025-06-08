import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coffee, Package, Clock, CheckCircle, XCircle, ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Loader2 } from "lucide-react";
import { Database } from '@/types/supabase';

interface ShippingAddress {
  governorate: string;
  city: string;
  street: string;
  notes?: string;
}

interface Product {
  name_ar: string;
  image_url: string | null;
}

interface OrderItem {
  quantity: number;
  unit_price: number;
  product: Product;
}

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface SupabaseOrderItem {
  quantity: number;
  unit_price: number;
  product: {
    name_ar?: string;
    image_url?: string | null;
  } | null;
}

interface SupabaseOrder {
  id: string;
  total_amount: number;
  status: Order['status'];
  payment_status: Order['payment_status'];
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  order_items: SupabaseOrderItem[] | null;
}

const Orders = () => {
  const { user, loading: checkingSession } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(false);

    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          payment_status,
          shipping_address,
          notes,
          created_at,
          order_items (
            quantity,
            unit_price,
            product:products (
              name_ar,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const formattedData: Order[] = (data as SupabaseOrder[]).map(order => {
        return {
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          shipping_address: order.shipping_address,
          notes: order.notes,
          created_at: order.created_at,
          order_items: (order.order_items ?? []).map(item => ({
            quantity: item.quantity,
            unit_price: item.unit_price,
            product: {
              name_ar: item.product?.name_ar || "منتج غير معروف",
              image_url: item.product?.image_url || null
            }
          }))
        };
      });

      setOrders(formattedData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(true);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث حالة الطلب",
          variant: "destructive",
        });
        return false;
      }

      // تحديث القائمة مباشرة من قاعدة البيانات
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الطلب",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId || !user) return;

    setIsCancelling(true);
    try {
      // التحقق من حالة الطلب قبل محاولة الإلغاء
      const { data: orderData, error: checkError } = await supabase
        .from('orders')
        .select('status, user_id')
        .eq('id', cancelOrderId)
        .single();

      if (checkError) {
        throw new Error('فشل في التحقق من حالة الطلب');
      }

      if (!orderData) {
        throw new Error('الطلب غير موجود');
      }

      if (orderData.status !== 'pending') {
        throw new Error('لا يمكن إلغاء هذا الطلب - الحالة الحالية: ' + getStatusText(orderData.status));
      }

      if (orderData.user_id !== user.id) {
        throw new Error('ليس لديك صلاحية إلغاء هذا الطلب');
      }

      // تحديث حالة الطلب من pending إلى cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancelOrderId)
        .eq('status', 'pending')
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error cancelling order:', updateError);
        throw new Error('حدث خطأ أثناء إلغاء الطلب');
      }

      toast({
        title: "تم",
        description: "تم إلغاء الطلب بنجاح",
      });
      
      // تحديث القائمة
      await fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إلغاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setCancelOrderId(null);
    }
  };

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={24} />;
      case 'processing':
        return <Coffee className="text-blue-600" size={24} />;
      case 'shipped':
        return <Package className="text-purple-600" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <Package className="text-gray-600" size={24} />;
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'processing':
        return 'قيد التحضير';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    // تنسيق المبلغ بدون كسور عشرية وإزالة العلامة العشرية
    return `${Math.round(amount)} ج.م`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  }, []);

  const renderLoading = useMemo(() => (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Package className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">طلباتي</h1>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="space-y-2 mb-4">
                {[1, 2].map((_, idx) => (
                  <div key={idx} className="flex items-center space-x-3 space-x-reverse">
                    <Skeleton className="w-10 h-10 rounded" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), []);

  const renderUnauthenticated = useMemo(() => (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-20 text-center">
        <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
        <h2 className="text-2xl font-bold text-amber-900 mb-4">
          يجب تسجيل الدخول أولاً
        </h2>
        <p className="text-gray-600 mb-6">سجل الدخول لعرض سجل طلباتك</p>
        <a
          href="/auth"
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-block"
        >
          تسجيل الدخول
        </a>
      </div>
    </div>
  ), []);

  if (checkingSession) return renderLoading;
  if (!user) return renderUnauthenticated;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Package className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">طلباتي</h1>
          <p className="text-gray-600 mt-2">عرض سجل طلباتك وتتبع حالتها</p>
        </div>

        {loading ? (
          renderLoading
        ) : error ? (
          <div className="text-center py-16">
            <Package className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">حدث خطأ أثناء تحميل الطلبات</p>
            <Button
              onClick={fetchOrders}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RefreshCw className="mr-2" size={20} />
              حاول مرة أخرى
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">لا توجد طلبات بعد</p>
            <p className="text-gray-500 mb-6">ابدأ التسوق لاكتشاف منتجاتنا اللذيذة</p>
            <a
              href="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="ml-2" size={20} />
              ابدأ التسوق
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">
                        طلب #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-amber-700 text-sm">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 space-x-reverse py-2 border-b border-amber-100 last:border-0"
                    >
                      <div className="flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name_ar}
                            className="w-16 h-16 object-cover rounded-lg bg-amber-50"
                            onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Package className="text-amber-600" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-amber-900 font-medium">
                          {item.product.name_ar}
                        </p>
                        <div className="flex justify-between text-sm text-amber-700">
                          <span>الكمية: {item.quantity}</span>
                          <span>سعر الوحدة: {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                      <div className="text-amber-900 font-bold">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-amber-900">
                      المجموع: {formatCurrency(order.total_amount)}
                    </span>
                    {order.payment_status === 'paid' && (
                      <span className="mr-4 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        مدفوع
                      </span>
                    )}
                  </div>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => setCancelOrderId(order.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      disabled={isCancelling}
                    >
                      <XCircle className="ml-1" size={18} />
                      إلغاء الطلب
                    </button>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-800 flex">
                      <span className="font-bold ml-2">ملاحظات:</span> 
                      {order.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="text-amber-700 mt-1" size={18} />
                    <div>
                      <p className="font-bold text-amber-900 mb-1">عنوان التوصيل:</p>
                      <p className="text-amber-800">
                        {order.shipping_address.governorate} - {order.shipping_address.city}
                      </p>
                      <p className="text-amber-800">{order.shipping_address.street}</p>
                      {order.shipping_address.notes && (
                        <p className="text-amber-700 mt-1">
                          ملاحظات: {order.shipping_address.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!cancelOrderId} onOpenChange={(open) => !open && setCancelOrderId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد إلغاء الطلب</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCancelOrderId(null)}
                disabled={isCancelling}
              >
                تراجع
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تأكيد الإلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Orders;