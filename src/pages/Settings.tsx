import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Check, 
  Globe, 
  CreditCard,
  MapPin,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import SecureLS from 'secure-ls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { Helmet } from "react-helmet-async";

// تشفير البيانات الحساسة في localStorage
const secureLS = new SecureLS({
  encodingType: 'aes',
  isCompression: false,
  encryptionSecret: import.meta.env.VITE_SECURE_LS_KEY
});

interface FormData {
  full_name: string;
  phone: string;
  address: string;
  governorate: string;
  city: string;
}

const Settings = () => {
  const { user, loading: authLoading, updateUserProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // معلومات المستخدم
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    address: '',
    governorate: 'دمنهور',
    city: 'دمنهور'
  });
  
  // تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
  });

  // إنشاء رمز CSRF فريد عند التحميل
  useEffect(() => {
    setCsrfToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, []);

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    if (user && !authLoading) {
      fetchProfileInfo();
    }
  }, [user, authLoading]);

  // جلب بيانات المستخدم مع التخزين المؤقت للبنية الأساسية
  const fetchProfileInfo = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // جلب معلومات الملف الشخصي
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;

      // جلب العنوان الافتراضي للمستخدم
      const { data: addressData, error: addressError } = await supabase
        .from('user_addresses')
        .select('street, governorate, city')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (addressError && addressError.code !== 'PGRST116') { // تجاهل خطأ "لم يتم العثور على نتائج"
        throw addressError;
      }

      setFormData({
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        phone: profileData?.phone || user.user_metadata?.phone || '',
        address: addressData?.street || '',
        governorate: addressData?.governorate || 'دمنهور',
        city: addressData?.city || 'دمنهور'
      });
    } catch (error) {
      console.error('Error fetching profile info:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب معلومات الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // تحديث الملف الشخصي
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // التحقق من وجود عنوان افتراضي
      const { data: existingAddress, error: fetchError } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingAddress) {
        // تحديث العنوان الموجود
        const { error: addressError } = await supabase
          .from('user_addresses')
          .update({
            street: formData.address,
            governorate: formData.governorate,
            city: formData.city,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAddress.id);

        if (addressError) throw addressError;
      } else {
        // إنشاء عنوان جديد
        const { error: addressError } = await supabase
          .from('user_addresses')
          .insert({
            user_id: user.id,
            street: formData.address,
            governorate: formData.governorate,
            city: formData.city,
            is_default: true
          });

        if (addressError) throw addressError;
      }

      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
      });

      // تحديث معلومات المستخدم في الواجهة
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلومات الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // التحقق من صحة البيانات المدخلة للملف الشخصي
  const validateProfile = useCallback((): boolean => {
    if (formData.phone && !/^01[0-9]{9}$/.test(formData.phone)) {
      toast({
        title: 'رقم هاتف غير صالح',
        description: 'يجب أن يكون رقم الهاتف مكون من 11 رقم ويبدأ بـ 01',
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.full_name.length < 3) {
      toast({
        title: 'اسم غير صالح',
        description: 'يجب أن يتكون الاسم من 3 أحرف على الأقل',
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [formData.phone, formData.full_name, toast]);

  // تحديث معلومات الملف الشخصي
  const handleProfileUpdate = useCallback(async (data: any) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // تحديث البيانات في formData
      setFormData(data);

      // تحديث معلومات المستخدم في Auth
      await updateUserProfile({
        full_name: data.full_name,
        phone: data.phone
      });
      
      // تحديث الملف الشخصي في قاعدة البيانات
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone ? 
            (data.phone.startsWith('0') ? 
            `+2${data.phone}` : 
            `+${data.phone}`) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // التحقق من وجود عنوان افتراضي
      const { data: existingAddress, error: fetchError } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingAddress) {
        // تحديث العنوان الموجود
        const { error: addressError } = await supabase
          .from('user_addresses')
          .update({
            street: data.address,
            governorate: data.governorate,
            city: data.city,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAddress.id);

        if (addressError) throw addressError;
      } else if (data.address) {
        // إنشاء عنوان جديد
        const { error: addressError } = await supabase
          .from('user_addresses')
          .insert({
            user_id: user.id,
            street: data.address,
            governorate: data.governorate,
            city: data.city,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (addressError) throw addressError;
      }
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
      });
      
      // تحديث البنية الأساسية المخزنة
      secureLS.set('site_structure', {
        full_name: data.full_name,
        email: user.email,
        phone: data.phone,
        address: data.address
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلومات الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [user, updateUserProfile, toast]);

  // التحقق من صحة كلمة المرور
  const validatePassword = useCallback((newPass: string, confirmPass: string): boolean => {
    if (newPass.length < 8) {
      toast({
        title: 'كلمة مرور قصيرة',
        description: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        variant: "destructive",
      });
      return false;
    }
    
    if (newPass !== confirmPass) {
      toast({
        title: 'كلمات مرور غير متطابقة',
        description: 'كلمات المرور الجديدة غير متطابقة',
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [toast]);

  // تغيير كلمة المرور
  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(newPassword, confirmPassword)) return;
    
    setSaving(true);
    
    try {
      // التحقق من كلمة المرور الحالية عن طريق تسجيل الدخول
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) throw new Error('كلمة المرور الحالية غير صحيحة');
      
      // تحديث كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث كلمة المرور بنجاح',
      });
      
      // مسح الحقول بعد التحديث
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'فشل في تغيير كلمة المرور';
      toast({
        title: 'خطأ',
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, user, validatePassword, toast]);

  // حذف الحساب
  const handleAccountDeletion = useCallback(async () => {
    setDeleteLoading(true);
    
    try {
      // التحقق من كلمة المرور الحالية عن طريق تسجيل الدخول
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) throw new Error('كلمة المرور غير صحيحة');
      
      // حذف الحساب من جدول profiles
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);
        
      if (deleteError) throw deleteError;
      
      // تسجيل خروج المستخدم
      await signOut ();
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف حسابك بنجاح',
      });
      
      // إعادة التوجيه إلى الصفحة الرئيسية بعد الحذف
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في حذف الحساب';
      toast({
        title: 'خطأ',
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }, [currentPassword, user, signOut , toast]);

  // تحميل شاشة التحميل
  const renderLoading = useMemo(() => (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-20 text-center">
        <Loader2 className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
        <p className="text-xl text-amber-700">جاري تحميل الإعدادات...</p>
      </div>
    </div>
  ), []);

  // تحميل شاشة عدم تسجيل الدخول
  const renderUnauthenticated = useMemo(() => (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-20 text-center">
        <User className="mx-auto mb-4 text-amber-700" size={64} />
        <h2 className="text-2xl font-bold text-amber-900 mb-4">يجب تسجيل الدخول أولاً</h2>
        <p className="text-gray-600 mb-6">سجل الدخول لإدارة إعدادات حسابك</p>
        <a
          href="/auth"
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          تسجيل الدخول
        </a>
      </div>
    </div>
  ), []);

  if (authLoading || loading) return renderLoading;
  if (!user) return renderUnauthenticated;

  return (
    <>
      <Helmet>
        <title>الإعدادات | قهوة دمنهور</title>
        <meta name="description" content="إدارة إعدادات حسابك وتفضيلاتك" />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center mb-8">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-amber-700" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-amber-900">إعدادات الحساب</h1>
            <p className="text-gray-600 mt-2">إدارة معلومات حسابك وتفضيلاتك الشخصية</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* العمود الأيمن: معلومات الحساب */}
            <div className="lg:col-span-2 space-y-6">
              {/* معلومات الملف الشخصي */}
              <Card className="bg-white rounded-xl shadow-md border border-amber-100">
                <CardHeader className="border-b border-amber-100">
                  <div className="flex items-center space-x-2">
                    <User className="text-amber-700" size={20} />
                    <CardTitle className="text-amber-900">الملف الشخصي</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">
                    تحديث معلوماتك الشخصية وعنوان الشحن
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                      <ProfileSettings
                        user={{
                          full_name: formData.full_name,
                          email: user?.email || '',
                          phone: formData.phone,
                          address: formData.address,
                          governorate: formData.governorate,
                          city: formData.city
                        }}
                        onUpdate={handleProfileUpdate}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* تغيير كلمة المرور */}
              <Card className="bg-white rounded-xl shadow-md border border-amber-100">
                <CardHeader className="border-b border-amber-100">
                  <div className="flex items-center space-x-2">
                    <Lock className="text-amber-700" size={20} />
                    <CardTitle className="text-amber-900">تغيير كلمة المرور</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">
                    تحديث كلمة المرور لحماية حسابك
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="security" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="security">الأمان</TabsTrigger>
                    </TabsList>

                    <TabsContent value="security" className="space-y-6">
                      <SecuritySettings
                        onUpdatePassword={handlePasswordChange}
                        onEnableTwoFactor={() => {}}
                        twoFactorEnabled={false}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* العمود الأيسر: إجراءات الحساب */}
            <div className="space-y-6">
              {/* إعدادات الخصوصية */}
              <Card className="bg-white rounded-xl shadow-md border border-amber-100">
                <CardHeader className="border-b border-amber-100">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="text-amber-700" size={20} />
                    <CardTitle className="text-amber-900">الخصوصية والإشعارات</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">
                    إدارة تفضيلات الخصوصية والاتصالات
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="space-y-6">
                      <NotificationSettings
                        settings={notificationSettings}
                        onUpdate={(settings) => setNotificationSettings(settings)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* حذف الحساب */}
              <Card className="bg-white rounded-xl shadow-md border border-red-100">
                <CardHeader className="border-b border-red-100">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="text-red-600" size={20} />
                    <CardTitle className="text-red-700">حذف الحساب</CardTitle>
                  </div>
                  <CardDescription className="text-red-500">
                    هذا الإجراء دائم ولا يمكن التراجع عنه
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-red-600 mb-4">
                    <strong>تحذير:</strong> حذف حسابك نهائي وغير قابل للاسترجاع. سيتم حذف جميع بياناتك بشكل دائم.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        هل أنت متأكد أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                      <div className="flex space-x-4 space-x-reverse">
                        <Button
                          onClick={handleAccountDeletion}
                          disabled={deleteLoading}
                          className="bg-red-600 hover:bg-red-700 text-white flex-1 shadow-md"
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="animate-spin mr-2" size={20} />
                              جاري الحذف...
                            </>
                          ) : (
                            'نعم، احذف حسابي'
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white flex-1 shadow-md"
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                    >
                      حذف حسابي بشكل دائم
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* معلومات الدفع */}
              <Card className="bg-white rounded-xl shadow-md border border-amber-100">
                <CardHeader className="border-b border-amber-100">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="text-amber-700" size={20} />
                    <CardTitle className="text-amber-900">طرق الدفع</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">
                    إدارة طرق الدفع الخاصة بك
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">بطاقة فيزا</p>
                        <p className="text-sm text-gray-500">**** **** **** 1234</p>
                      </div>
                      <Button variant="outline" className="text-amber-700 border-amber-300">
                        تحديث
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">بطاقة ماستركارد</p>
                        <p className="text-sm text-gray-500">**** **** **** 5678</p>
                      </div>
                      <Button variant="outline" className="text-amber-700 border-amber-300">
                        تحديث
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                    إضافة بطاقة جديدة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;