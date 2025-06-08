import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: number;
    name_ar: string;
    description_ar: string | null;
    image_url: string | null;
  };
};

type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: {
    governorate: string;
    city: string;
    street: string;
    notes?: string;
  };
  created_at: string;
  order_items: OrderItem[];
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !id) return;

      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*, order_items(*, products(*))")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (orderError) throw orderError;
        if (!orderData) throw new Error("الطلب غير موجود");

        // حساب إجمالي الطلب من عناصر الطلب
        const calculatedTotal = orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0);

        // تحديث البيانات
        setOrder({
          ...orderData,
          total_amount: calculatedTotal,
          order_items: orderData.order_items.map(item => ({
            ...item,
            total_price: item.quantity * item.unit_price // حساب السعر الإجمالي لكل منتج
          }))
        } as Order);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "خطأ في تحميل تفاصيل الطلب",
          description: "تعذر تحميل تفاصيل الطلب",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
          <p className="mt-2 text-amber-800">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            الطلب غير موجود
          </h1>
          <p className="text-amber-800 mb-6">
            عذراً، لا يمكن العثور على تفاصيل هذا الطلب
          </p>
          <Link to="/orders">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى قائمة الطلبات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "processing":
        return "قيد التجهيز";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <Helmet>
        <title>تفاصيل الطلب | قهوة دمنهور</title>
        <meta
          name="description"
          content="عرض تفاصيل طلبك في متجر قهوة دمنهور"
        />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-amber-900">
            تفاصيل الطلب #{order.id.slice(0, 8)}
          </h1>
          <Link to="/orders">
            <Button variant="outline">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى الطلبات
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* معلومات الطلب */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">حالة الطلب</span>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">تاريخ الطلب</span>
                <span>{new Date(order.created_at).toLocaleDateString("ar-EG")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي الطلب</span>
                <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* عنوان التوصيل */}
          <Card>
            <CardHeader>
              <CardTitle>عنوان التوصيل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold">{order.shipping_address.governorate}</p>
              <p>{order.shipping_address.city}</p>
              <p>{order.shipping_address.street}</p>
              {order.shipping_address.notes && (
                <p className="text-gray-600">{order.shipping_address.notes}</p>
              )}
            </CardContent>
          </Card>

          {/* تفاصيل المنتجات */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {item.products.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name_ar}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{item.products.name_ar}</h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{formatCurrency(item.quantity * item.unit_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الطلب */}
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-amber-900">إجمالي الطلب</span>
                <span className="font-bold text-amber-900">
                  {formatCurrency(order.order_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 