
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coffee, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  notes: string;
  order_items: {
    quantity: number;
    unit_price: number;
    product: {
      name_ar: string;
      image: string;
    };
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            unit_price,
            product:products(name_ar, image)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('status', 'pending');

      if (error) throw error;
      
      fetchOrders();
      toast({
        title: "تم إلغاء الطلب",
        description: "تم إلغاء طلبك بنجاح",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "خطأ",
        description: "فشل في إلغاء الطلب",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={24} />;
      case 'processing':
        return <Coffee className="text-blue-600" size={24} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <Package className="text-gray-600" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'processing':
        return 'قيد التحضير';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
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
          <p className="text-xl text-amber-700">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Package className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">طلباتي</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">لا توجد طلبات بعد</p>
            <a
              href="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              ابدأ التسوق
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">
                        طلب #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-amber-700">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 space-x-reverse">
                      <img
                        src={item.product.image || '/api/placeholder/40/40'}
                        alt={item.product.name_ar}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-amber-900">
                        {item.product.name_ar} × {item.quantity}
                      </span>
                      <span className="text-amber-700 mr-auto">
                        {item.unit_price * item.quantity} جنيه
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-amber-900">
                      المجموع: {order.total_amount} جنيه
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      إلغاء الطلب
                    </button>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-amber-800">
                      <strong>ملاحظات:</strong> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
