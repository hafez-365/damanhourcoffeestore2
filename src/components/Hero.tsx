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
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-amber-50" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-amber-50" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-amber-50" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
