
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Coffee, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast({
          title: "مرحباً بك!",
          description: "تم تسجيل الدخول بنجاح",
        });
      } else {
        await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
        toast({
          title: "تم إنشاء الحساب!",
          description: "مرحباً بك في قهوة دمنهور",
        });
      }
    } catch (error) {
      // Error is handled in the useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center px-6">
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
            <div>
              <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
                <Mail size={20} />
                <span>البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
                <Lock size={20} />
                <span>كلمة المرور</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
                    <User size={20} />
                    <span>الاسم الكامل</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
                    <Phone size={20} />
                    <span>رقم الهاتف</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+201234567890"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 space-x-reverse text-amber-800 font-medium mb-2">
                    <MapPin size={20} />
                    <span>العنوان</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows={3}
                    placeholder="أدخل عنوانك التفصيلي"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-bold text-lg disabled:opacity-50"
            >
              {loading
                ? 'جاري المعالجة...'
                : isLogin
                ? 'تسجيل الدخول'
                : 'إنشاء حساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-600 hover:text-amber-800 font-medium"
            >
              {isLogin
                ? 'ليس لديك حساب؟ إنشاء حساب جديد'
                : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-amber-100 text-center text-sm text-amber-700">
            باستخدام هذا التطبيق، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
