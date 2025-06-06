import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Loader2 } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";

const LoginPage = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      setErrorMsg('الرجاء التحقق من أنك لست روبوت');
      return;
    }
    
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setErrorMsg('تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة لاحقًا.');
      return;
    }
    
    try {
      await signIn(formData.email, formData.password);
      setLoginAttempts(0);
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setErrorMsg('تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة بعد 30 دقيقة.');
        
        setTimeout(() => {
          setIsBlocked(false);
          setLoginAttempts(0);
        }, 30 * 60 * 1000);
      } else {
        setErrorMsg('فشل تسجيل الدخول، يرجى التحقق من البيانات.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-amber-800">
            تسجيل الدخول
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-gray-700">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="example@domain.com"
                required
                disabled={isBlocked}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-gray-700">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
                disabled={isBlocked}
              />
            </div>
            
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}

                onChange={() => setCaptchaVerified(true)}
              />
            </div>
            
            {errorMsg && (
              <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                {errorMsg}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 py-3"
              disabled={isBlocked}
            >
              <Lock className="mr-2" size={18} />
              تسجيل الدخول
            </Button>
            
            <div className="text-center mt-4">
              <a 
                href="/reset-password" 
                className="text-amber-700 hover:text-amber-800 text-sm"
              >
                نسيت كلمة المرور؟
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;