import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Coffee, Mail, Lock, User, Phone, MapPin, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Database } from "@/types/supabase";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

type FormData = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
};

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const shouldRedirect = useRef(true);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // استخراج الصفحة المقصودة من state أو query params
  const from = location.state?.from?.pathname || location.search?.split('from=')[1] || '/';

  useEffect(() => {
    if (user && shouldRedirect.current) {
      // التوجيه إلى الصفحة المقصودة بعد تسجيل الدخول
      navigate(from, { replace: true });
      shouldRedirect.current = false;
    }
  }, [user, navigate, from]);

  useEffect(() => {
    if (loginAttempts >= 5) {
      const timer = setTimeout(() => {
        setIsBlocked(false);
        setLoginAttempts(0);
      }, 30 * 60 * 1000);

      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) return;

    if (!isLogin) {
      if (!formData.full_name || formData.full_name.length < 3) {
        toast({
          title: "خطأ في البيانات",
          description: "الرجاء إدخال اسم صحيح (3 أحرف على الأقل)",
          variant: "destructive"
        });
        return;
      }

      if (!formData.phone || !/^01[0125][0-9]{8}$/.test(formData.phone)) {
        toast({
          title: "خطأ في البيانات",
          description: "الرجاء إدخال رقم هاتف مصري صحيح يبدأ بـ 01",
          variant: "destructive"
        });
        return;
      }

      if (!formData.address || formData.address.length < 10) {
        toast({
          title: "خطأ في البيانات",
          description: "الرجاء إدخال عنوان تفصيلي (10 أحرف على الأقل)",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    shouldRedirect.current = true;

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast({ title: "مرحباً بك!", description: "تم تسجيل الدخول بنجاح" });
      } else {
        const metadata = {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          role: 'customer'
        };

        await signUp(
          formData.email,
          formData.password,
          metadata
        );
        
        toast({
          title: "تم إنشاء الحساب!",
          description: "يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب",
        });
      }
      setLoginAttempts(0);
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsBlocked(true);
      }

      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast({
        title: "خطأ في المصادقة",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isLogin, formData, loginAttempts, isBlocked, signIn, signUp, toast]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleFormType = useCallback(() => {
    setIsLogin(prev => !prev);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      address: '',
    });
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center px-6">
      <Helmet>
        <title>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'} - قهوة دمنهور</title>
        <meta name="description" content={isLogin 
          ? 'سجل الدخول إلى حسابك في قهوة دمنهور للوصول إلى جميع الميزات' 
          : 'انشئ حساب جديد في قهوة دمنهور للبدء في تجربة التسوق المميزة'} />
      </Helmet>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h1 className="text-3xl font-bold text-amber-900">قهوة دمنهور</h1>
          <p className="text-amber-700 mt-2">
            {isLogin ? 'مرحباً بعودتك' : 'انضم إلى عائلة قهوة دمنهور'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <EmailField 
              value={formData.email} 
              onChange={handleInputChange} 
              disabled={isBlocked} 
            />
            
            <PasswordField 
              value={formData.password} 
              onChange={handleInputChange} 
              disabled={isBlocked}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {!isLogin && (
              <>
                <FullNameField 
                  value={formData.full_name} 
                  onChange={handleInputChange} 
                  disabled={isBlocked} 
                />
                
                <PhoneField 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  disabled={isBlocked} 
                />
                
                <AddressField 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  disabled={isBlocked} 
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading || isBlocked}
              className={`
                w-full py-3 px-4 rounded-lg text-white font-semibold
                ${loading || isBlocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 transition-colors'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin ml-2" size={20} />
                  <span>جاري {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}...</span>
                </div>
              ) : (
                isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
              )}
            </button>

            {isBlocked && (
              <p className="text-red-600 text-center">
                تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد 30 دقيقة.
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleFormType}
              className="text-amber-700 hover:text-amber-800 transition-colors"
            >
              {isLogin
                ? 'ليس لديك حساب؟ سجل الآن'
                : 'لديك حساب بالفعل؟ سجل دخولك'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailField = memo(({ value, onChange, disabled }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean 
}) => (
  <div>
    <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
      <Mail size={20} />
      <span>البريد الإلكتروني</span>
    </label>
    <input
      type="email"
      name="email"
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
      placeholder="example@email.com"
    />
  </div>
));

const PasswordField = memo(({ value, onChange, disabled, showPassword, onTogglePassword }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}) => (
  <div>
    <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
      <Lock size={20} />
      <span>كلمة المرور</span>
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
        required
        minLength={8}
        disabled={disabled}
        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 pr-12"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 focus:outline-none"
        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
));

const FullNameField = memo(({ value, onChange, disabled }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean 
}) => (
  <div>
    <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
      <User size={20} />
      <span>الاسم الكامل</span>
    </label>
    <input
      type="text"
      name="full_name"
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
      placeholder="محمد أحمد"
    />
  </div>
));

const PhoneField = memo(({ value, onChange, disabled }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean 
}) => (
  <div>
    <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
      <Phone size={20} />
      <span>رقم الهاتف</span>
    </label>
    <input
      type="tel"
      name="phone"
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
      placeholder="01xxxxxxxxx"
      pattern="^01[0125][0-9]{8}$"
    />
  </div>
));

const AddressField = memo(({ value, onChange, disabled }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled: boolean 
}) => (
  <div>
    <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
      <MapPin size={20} />
      <span>العنوان</span>
    </label>
    <input
      type="text"
      name="address"
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
      placeholder="شارع الجمهورية، دمنهور"
    />
  </div>
));

export default Auth;