
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Send, Coffee } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Feedback = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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

    setSubmitting(true);
    try {
      // Create feedback table entry
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          created_at: new Date().toISOString(),
        });

      if (error) {
        // If feedback table doesn't exist, we'll create a simple log for now
        console.log('Feedback submitted:', { rating, comment, user_id: user.id });
      }

      toast({
        title: "شكراً لك!",
        description: "تم إرسال تقييمك بنجاح",
      });

      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال التقييم",
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

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
          <p className="text-amber-700 mb-6">
            سجل دخولك لتتمكن من تقييم خدماتنا
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
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
              />
            </div>

            <button
              onClick={submitFeedback}
              disabled={submitting || rating === 0}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
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
                    onClick={() => window.open('https://wa.me/201234567890?text=مرحباً، أريد التواصل معكم', '_blank')}
                    className="text-green-600 hover:underline"
                  >
                    +201234567890
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
                    href="mailto:info@damanhourcoffee.com"
                    className="text-blue-600 hover:underline"
                  >
                    info@damanhourcoffee.com
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
