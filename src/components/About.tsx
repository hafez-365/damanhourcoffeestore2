
import React from 'react';
import { Coffee, Heart, Award, Truck } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Coffee className="text-amber-600" size={48} />,
      title: 'جودة عالية',
      description: 'حبوب مختارة بعناية ومحمصة طازجة يومياً'
    },
    {
      icon: <Heart className="text-red-500" size={48} />,
      title: 'صنع بحب',
      description: 'كل كوب قهوة مصنوع بحب وشغف من قلب دمنهور'
    },
    {
      icon: <Award className="text-yellow-500" size={48} />,
      title: 'خبرة عريقة',
      description: 'خبرة أكثر من 25 سنة في تحميص وطحن القهوة'
    },
    {
      icon: <Truck className="text-blue-500" size={48} />,
      title: 'توصيل سريع',
      description: 'توصيل مجاني لجميع أنحاء دمنهور في نفس اليوم'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
            <Heart className="mx-4 text-amber-700" size={28} />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            لماذا قهوة دمنهور؟
          </h2>
          <p className="text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed">
            نحن لسنا مجرد متجر قهوة، نحن أسرة تجمعنا محبة القهوة العربية الأصيلة
            ونسعى لتقديم أفضل تجربة قهوة في دمنهور والمحافظات المجاورة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center bg-white rounded-2xl p-8 shadow-xl border-2 border-amber-100 hover:border-amber-300 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-amber-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-800 to-orange-800 rounded-3xl p-8 md:p-12 text-center text-white">
          <Coffee className="mx-auto mb-6 text-amber-200" size={64} />
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            قصة قهوة دمنهور
          </h3>
          <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-8">
            بدأت رحلتنا في دمنهور منذ أكثر من ربع قرن، حيث كان الهدف الأول والأخير هو تقديم 
            أجود أنواع القهوة العربية للأهالي الكرام. من بداية متواضعة في السوق المحلي، 
            نمت قهوة دمنهور لتصبح العلامة التجارية الأولى والموثوقة في المحافظة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-amber-700 rounded-lg p-4">
              <div className="text-2xl font-bold">25+</div>
              <div className="text-amber-200">سنة خبرة</div>
            </div>
            <div className="bg-orange-700 rounded-lg p-4">
              <div className="text-2xl font-bold">10000+</div>
              <div className="text-orange-200">عميل راضي</div>
            </div>
            <div className="bg-red-700 rounded-lg p-4">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-red-200">نوع قهوة</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
