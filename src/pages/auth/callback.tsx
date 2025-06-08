import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // استخراج الرمز من عنوان URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          throw new Error('لم يتم العثور على رموز المصادقة');
        }

        // تحديث الجلسة
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) throw error;

        // تحديث البيانات الوصفية للمستخدم
        if (data.user) {
          await supabase.auth.updateUser({
            data: {
              ...data.user.user_metadata,
              email_verified: true
            }
          });
        }

        // توجيه المستخدم إلى الصفحة الرئيسية
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error in email confirmation:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-amber-900">جاري التحقق من بريدك الإلكتروني...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 