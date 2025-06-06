import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// مكون تحميل متقدم مع رسوم متحركة
export const LoadingSpinner = ({ message = "جاري التحقق من بياناتك..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-amber-50 to-orange-50">
    <div className="relative">
      <Loader2 className="animate-spin text-amber-600 w-16 h-16" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-amber-300 rounded-full animate-ping"></div>
      </div>
    </div>
    <p className="mt-6 text-xl font-bold text-amber-800">{message}</p>
    <p className="mt-2 text-amber-600 max-w-md text-center">
      نعمل على تهيئة تجربة تسوق فريدة لاستمتاعك بقهوة دمنهور
    </p>
  </div>
);

// مكون تحميل الصفحات الفرعية
export const RouteLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
  </div>
);

// مكون لتحميل الصفحات مسبقاً عند التنقل
export const PrefetchPages = () => {
  const location = useLocation();
  
  // تحميل مسبق للصفحات المحتملة بناءً على الموقع الحالي
  useEffect(() => {
    // سيتم تنفيذ هذا المنطق في ملف المسارات
  }, [location.pathname]);

  return null;
};