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

// تشفير البيانات الحساسة في localStorage
const secureLS = new SecureLS({
  encodingType: 'aes',
  isCompression: false,
  encryptionSecret: import.meta.env.VITE_SECURE_LS_KEY
});


const Settings = () => {
  const { user, loading: authLoading, updateUserProfile, signOut  } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // معلومات المستخدم
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // معلومات الشحن
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // إنشاء رمز CSRF فريد عند التحميل
  useEffect(() => {
    setCsrfToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, []);

  // جلب بيانات المستخدم مع التخزين المؤقت للبنية الأساسية
  const fetchProfileInfo = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // التحقق من وجود بيانات البنية الأساسية في التخزين المؤقت
      const cachedStructure = secureLS.get('site_structure');
      if (cachedStructure) {
        // استخدام البيانات المخزنة لتسريع التحميل
        setFullName(cachedStructure.full_name || '');
        setEmail(cachedStructure.email || '');
        setPhone(cachedStructure.phone || '');
        setAddress(cachedStructure.address || '');
        setCity(cachedStructure.city || '');
        setPostalCode(cachedStructure.postal_code || '');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city, postal_code')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      // تحديث الحالة بالبيانات الجديدة
      setFullName(data.full_name || '');
      setEmail(user.email || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setPostalCode(data.postal_code || '');
      
      // تخزين البنية الأساسية للتحديثات المستقبلية
      secureLS.set('site_structure', {
        full_name: data.full_name,
        email: user.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code
      });
    } catch (error) {
      console.error('Error fetching profile info:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل معلومات الملف الشخصي',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfileInfo();
  }, [fetchProfileInfo]);

  // التحقق من صحة البيانات المدخلة للملف الشخصي
  const validateProfile = useCallback((): boolean => {
    if (phone && !/^01[0-9]{9}$/.test(phone)) {
      toast({
        title: 'رقم هاتف غير صالح',
        description: 'يجب أن يكون رقم الهاتف مكون من 11 رقم ويبدأ بـ 01',
        variant: "destructive",
      });
      return false;
    }
    
    if (full_name.length < 3) {
      toast({
        title: 'اسم غير صالح',
        description: 'يجب أن يتكون الاسم من 3 أحرف على الأقل',
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [full_name, phone, toast]);

  // تحديث معلومات الملف الشخصي
  const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) return;
    
    setSaving(true);
    
    try {
      await updateUserProfile({ full_name, phone });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name,
          address,
          city,
          postal_code: postalCode,
          phone,
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث معلومات الملف الشخصي بنجاح',
      });
      
      // تحديث البنية الأساسية المخزنة
      secureLS.set('site_structure', {
        full_name,
        email,
        phone,
        address,
        city,
        postal_code: postalCode
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الملف الشخصي',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [full_name, phone, address, city, postalCode, user, updateUserProfile, validateProfile, toast, email]);

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
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="block mb-2 text-amber-900 font-medium">
                        الاسم الكامل
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={full_name}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="block mb-2 text-amber-900 font-medium">
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="بريدك الإلكتروني"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="block mb-2 text-amber-900 font-medium">
                        رقم الهاتف
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="رقم هاتفك"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-amber-100">
                    <div className="flex items-center mb-4 text-amber-700">
                      <MapPin className="mr-2" size={20} />
                      <h3 className="font-semibold">معلومات الشحن</h3>
                    </div>
                    
                    <div className="mb-6">
                      <Label htmlFor="address" className="block mb-2 text-amber-900 font-medium">
                        عنوان الشحن
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="العنوان الكامل للشحن"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="city" className="block mb-2 text-amber-900 font-medium">
                          المدينة
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="المدينة"
                          className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="postalCode" className="block mb-2 text-amber-900 font-medium">
                          الرمز البريدي
                        </Label>
                        <Input
                          id="postalCode"
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="الرمز البريدي"
                          className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg shadow-md transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2" size={20} />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                </form>
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
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                  
                  <div className="mb-6">
                    <Label htmlFor="currentPassword" className="block mb-2 text-amber-900 font-medium">
                      كلمة المرور الحالية
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="كلمة المرور الحالية"
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="newPassword" className="block mb-2 text-amber-900 font-medium">
                        كلمة المرور الجديدة
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword" className="block mb-2 text-amber-900 font-medium">
                        تأكيد كلمة المرور
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تأكيد كلمة المرور"
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg shadow-md"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2" size={20} />
                          تغيير كلمة المرور
                        </>
                      )}
                    </Button>
                  </div>
                </form>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-amber-100">
                    <div>
                      <h4 className="font-medium text-gray-700">عروض ترويجية عبر البريد</h4>
                      <p className="text-sm text-gray-500">تلقي عروض حصرية وعروض ترويجية</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-amber-100">
                    <div>
                      <h4 className="font-medium text-gray-700">إشعارات عبر الهاتف</h4>
                      <p className="text-sm text-gray-500">إشعارات حول طلباتك وعروضنا</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium text-gray-700">مشاركة البيانات</h4>
                      <p className="text-sm text-gray-500">مشاركة بياناتي مع شركاء التسويق</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                    حفظ إعدادات الخصوصية
                  </Button>
                </div>
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
  );
};

export default Settings;