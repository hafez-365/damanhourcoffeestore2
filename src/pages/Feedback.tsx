import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Send, Coffee, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import ReCAPTCHA from "react-google-recaptcha";

// تعريف نوع ReCAPTCHA يدويًا
type ReCAPTCHAInstance = {
  reset: () => void;
  execute: () => Promise<string>;
  getValue: () => string | null;
};

const Feedback = () => {
  const { user, loading: checkingSession } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();
  
  // استخدام النوع المخصص مع useRef
  const recaptchaRef = useRef<ReCAPTCHAInstance | null>(null);

  const submitFeedback = async () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تقييم",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "تحقق من CAPTCHA",
        description: "الرجاء التحقق من أنك لست روبوت",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .upsert({
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "شكراً لك!",
        description: "تم إرسال تقييمك بنجاح",
      });

      setRating(0);
      setComment('');
      
      // إعادة تعيين CAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      let description = "فشل في إرسال التقييم";
      if (error instanceof Error) {
        description = error.message;
      }

      toast({
        title: "خطأ",
        description,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-colors"
          disabled={submitting}
          aria-label={`تقييم ${starValue} نجوم`}
        >
          <Star
            size={32}
            className={`${
              starValue <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400`}
          />
        </button>
      );
    });
  };

  if (checkingSession) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Helmet>
          <title>جاري التحميل - التقييم</title>
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Loader2 className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
          <p className="text-xl text-amber-700">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Helmet>
          <title>تسجيل الدخول مطلوب - التقييم</title>
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">يجب تسجيل الدخول أولاً</h2>
          <p className="text-amber-700 mb-6">سجل دخولك لتتمكن من تقييم خدماتنا</p>
          <a
            href="/auth"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Helmet>
        <title>تقييم الخدمة - قهوة دمنهور</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <MessageSquare className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">تقييم الخدمة</h1>
          <p className="text-amber-700 mt-2">
            رأيك يهمنا! شاركنا تجربتك مع قهوة دمنهور
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-amber-900 mb-4">
                كيف تقيم خدماتنا؟
              </h2>
              <div className="flex justify-center space-x-2 space-x-reverse mb-4">
                {renderStars()}
              </div>
              {rating > 0 && (
                <p className="text-amber-700">
                  {rating === 1 && 'سيء جداً'}
                  {rating === 2 && 'سيء'}
                  {rating === 3 && 'متوسط'}
                  {rating === 4 && 'جيد'}
                  {rating === 5 && 'ممتاز'}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-amber-800 font-medium mb-2">
                شاركنا تجربتك (اختياري)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={5}
                placeholder="أخبرنا عن تجربتك مع قهوة دمنهور... ما الذي أعجبك؟ ما الذي يمكننا تحسينه؟"
                disabled={submitting}
              />
            </div>
            
            <div className="mb-6 flex justify-center">
              <ReCAPTCHA
                ref={(ref) => {
                  // تحويل النوع إلى النوع الذي عرفناه
                  recaptchaRef.current = ref as ReCAPTCHAInstance | null;
                }}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={setCaptchaToken}
              />
            </div>

            <button
              onClick={submitFeedback}
              disabled={submitting || rating === 0 || !captchaToken}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Send size={20} className="mr-2" />
              )}
              <span>{submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
            </button>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">
              طرق التواصل الأخرى
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📱</span>
                </div>
                <div>
                  <p className="font-medium text-amber-900">واتساب</p>
                  <button
                    onClick={() => window.open('https://wa.me/+201229204276?text=مرحباً، أريد التواصل معكم', '_blank')}
                    className="text-green-600 hover:underline"
                  >
                    +201229204276
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📧</span>
                </div>
                <div>
                  <p className="font-medium text-amber-900">البريد الإلكتروني</p>
                  <a
                    href="mailto:damanhourcoffee@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    damanhourcoffee@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;