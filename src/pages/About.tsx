import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Coffee, Award, Users, Clock } from 'lucide-react';

const About = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Helmet>
        <title>عن المتجر | قهوة دمنهور</title>
        <meta name="description" content="تعرف على قصة قهوة دمنهور وتاريخنا في تقديم أجود أنواع البن" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">قهوة دمنهور</h1>
          <p className="text-xl text-amber-800 max-w-2xl mx-auto">
            نقدم لكم أجود أنواع البن المحمص بعناية، مع خبرة تمتد لأكثر من 50 عاماً في مجال القهوة
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">قصتنا</h2>
            <p className="text-amber-800 leading-relaxed">
              بدأت رحلتنا في عام 1970 في مدينة دمنهور، حيث كان جدنا يحمص البن يدوياً ويقدمه لزبائنه.
              واليوم، نواصل نفس التقاليد مع إضافة التقنيات الحديثة لضمان أعلى جودة.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">رؤيتنا</h2>
            <p className="text-amber-800 leading-relaxed">
              نسعى لتقديم تجربة قهوة استثنائية لكل عملائنا، مع الحفاظ على التقاليد الأصيلة
              والجودة العالية التي عُرفنا بها على مر السنين.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center">
            <Coffee className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">أجود أنواع البن</h3>
            <p className="text-amber-700">نختار أفضل حبوب البن من مصادر موثوقة</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <Award className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">جودة عالية</h3>
            <p className="text-amber-700">نلتزم بأعلى معايير الجودة في التحميص والتعبئة</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <Users className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">خدمة متميزة</h3>
            <p className="text-amber-700">فريق متخصص لتقديم أفضل خدمة لعملائنا</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <Clock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">خبرة طويلة</h3>
            <p className="text-amber-700">أكثر من 50 عاماً من الخبرة في مجال القهوة</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">لماذا تختار قهوة دمنهور؟</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-2"></div>
              <p className="text-amber-800">نستخدم أحدث تقنيات التحميص للحفاظ على نكهة القهوة</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-2"></div>
              <p className="text-amber-800">نقدم مجموعة متنوعة من النكهات لتناسب جميع الأذواق</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-2"></div>
              <p className="text-amber-800">نوفر خدمة توصيل سريعة لجميع أنحاء مصر</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-2 w-2 rounded-full bg-amber-600 mt-2"></div>
              <p className="text-amber-800">نقدم نصائح مجانية حول طرق تحضير القهوة المثالية</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About; 