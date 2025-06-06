import React from 'react';
import { Coffee, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 overflow-hidden"
      aria-label="قسم مقدمة الموقع عن القهوة العربية"
    >
      {/* الخلفية الزخرفية */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-20 right-20 animate-pulse">
          <Coffee size={80} className="text-amber-300" aria-label="أيقونة قهوة" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce">
          <Coffee size={60} className="text-orange-300" aria-label="أيقونة قهوة" />
        </div>
        <div className="absolute top-1/2 left-1/3 animate-pulse">
          <Star size={40} className="text-yellow-300" aria-label="أيقونة نجمة" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* ✅ h1 بعنوان رئيسي محسّن */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-amber-100 mb-6 drop-shadow-2xl leading-tight">
            مغلق مؤقتاً  {/*قهوةعربية مطحونة من دمنهور كوفي */}
          </h1>

          {/* ✅ h2 بكلمات مفتاحية مهمة */}
          <h2 className="text-xl md:text-2xl text-amber-200 mb-12 leading-relaxed font-medium">
            تسوّق ألذ قهوة مطحونة بنكهات أصيلة وجودة عالية – مثالية لعشاق القهوة العربية
          </h2>

          <div className="flex justify-center items-center mb-8" aria-hidden="true">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent to-amber-400"></div>
            <Coffee className="mx-4 text-amber-400" size={32} />
            <div className="h-1 w-20 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>

          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              تصفح منتجات القهوة
            </button>
            <button
              onClick={() => window.open('https://wa.me/+201229204276?text=مرحباً، أريد الاستفسار عن قهوة دمنهور', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              اطلب عبر واتساب
            </button>
          </div>
        </div>
      </div>

      {/* ديكور موجي سفلي */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16">
          <path d="M0,0V46.29c..." opacity=".25" className="fill-amber-50" />
          <path d="M0,0V15.81C..." opacity=".5" className="fill-amber-50" />
          <path d="M0,0V5.63C..." className="fill-amber-50" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
