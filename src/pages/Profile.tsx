import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Loader2, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

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

const Profile: React.FC = () => {
  const { user, loading: checkingSession } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<UserAddress>>({
    governorate: "",
    city: "",
    street: "",
    notes: "",
    is_default: false,
  });

  // جلب عناوين المستخدم
  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setAddresses(data || []);
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
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  // إضافة عنوان جديد
  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // التحقق من البيانات
      if (!newAddress.governorate || !newAddress.city || !newAddress.street) {
        throw new Error("الرجاء ملء جميع الحقول المطلوبة");
      }

      // إذا كان العنوان الجديد افتراضي، نزيل الافتراضي من العناوين الأخرى
      if (newAddress.is_default) {
        await supabase
          .from("user_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("user_addresses")
        .insert({
          ...newAddress,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [...prev, data]);
      setShowAddressForm(false);
      setNewAddress({
        governorate: "",
        city: "",
        street: "",
        notes: "",
        is_default: false,
      });

      toast({
        title: "تمت إضافة العنوان",
        description: "تم إضافة عنوان الشحن الجديد بنجاح",
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: "خطأ في إضافة العنوان",
        description: err.message || "حدث خطأ أثناء إضافة العنوان",
        variant: "destructive",
      });
    }
  };

  // حذف عنوان
  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      setAddressToDelete(null);

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
    }
  };

  // تعيين عنوان كافتراضي
  const setDefaultAddress = async (addressId: string) => {
    try {
      // إزالة الافتراضي من جميع العناوين
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // تعيين العنوان المحدد كافتراضي
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;

      // تحديث الحالة المحلية
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );

      toast({
        title: "تم تحديث العنوان الافتراضي",
        description: "تم تعيين العنوان المحدد كعنوان افتراضي",
      });
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast({
        title: "خطأ في تحديث العنوان الافتراضي",
        description: "حدث خطأ أثناء محاولة تعيين العنوان الافتراضي",
        variant: "destructive",
      });
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
          <p className="mt-2 text-amber-800">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h1>
          <p className="text-amber-800 mb-6">
            الرجاء تسجيل الدخول للوصول إلى صفحة الملف الشخصي
          </p>
          <a
            href="/auth"
            className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <Helmet>
        <title>الملف الشخصي | قهوة دمنهور</title>
        <meta
          name="description"
          content="إدارة الملف الشخصي وعناوين الشحن في متجر قهوة دمنهور"
        />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-8">
          الملف الشخصي
        </h1>

        <div className="grid grid-cols-1 gap-8">
          {/* قسم العناوين */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-amber-800">
                عناوين الشحن
              </h2>
              <Button
                onClick={() => setShowAddressForm(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                إضافة عنوان جديد
              </Button>
            </div>

            {loadingAddresses ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
                <p className="mt-2 text-amber-800">جاري تحميل العناوين...</p>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        {address.governorate}
                      </CardTitle>
                      {address.is_default && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          العنوان الافتراضي
                        </span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {address.city} - {address.street}
                        </p>
                        {address.notes && (
                          <p className="text-sm text-gray-500">{address.notes}</p>
                        )}
                        <div className="flex items-center justify-end space-x-2 space-x-reverse">
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              تعيين كافتراضي
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setAddressToDelete(address.id)}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-amber-600 mb-4" />
                  <p className="text-amber-800 mb-4">
                    لم تقم بإضافة أي عناوين شحن بعد
                  </p>
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    إضافة عنوان جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* نموذج إضافة عنوان جديد */}
          {showAddressForm && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>إضافة عنوان جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addAddress} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="governorate">المحافظة</Label>
                    <Input
                      id="governorate"
                      value={newAddress.governorate}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          governorate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">الشارع</Label>
                    <Input
                      id="street"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={newAddress.notes || ""}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="مثال: بجوار المسجد، الدور الثالث..."
                    />
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="is_default"
                      checked={newAddress.is_default}
                      onCheckedChange={(checked) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          is_default: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="is_default">تعيين كعنوان افتراضي</Label>
                  </div>

                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddressForm(false);
                        setNewAddress({
                          governorate: "",
                          city: "",
                          street: "",
                          notes: "",
                          is_default: false,
                        });
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button type="submit">حفظ العنوان</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* حوار تأكيد الحذف */}
      <ConfirmationDialog
        open={!!addressToDelete}
        onCancel={() => setAddressToDelete(null)}
        onConfirm={() => addressToDelete && deleteAddress(addressToDelete)}
        title="حذف عنوان الشحن"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان؟"
        confirmText="نعم، احذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default Profile; 