
import React from 'react';
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
            <MessageCircle className="mx-4 text-amber-700" size={28} />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            تواصل معنا
          </h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            نحن هنا لخدمتك في أي وقت، تواصل معنا لطلب قهوتك المفضلة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-amber-100">
            <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              معلومات التواصل
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg">
                <Phone className="text-amber-600" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900">رقم الهاتف</h4>
                  <p className="text-amber-700" dir="ltr">+20 123 456 7890</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg">
                <MapPin className="text-amber-600" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900">العنوان</h4>
                  <p className="text-amber-700">شارع الجمهورية، دمنهور، البحيرة</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg">
                <Clock className="text-amber-600" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900">مواعيد العمل</h4>
                  <p className="text-amber-700">يومياً من 8 صباحاً حتى 10 مساءً</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.open('https://wa.me/201234567890?text=مرحباً، أريد الاستفسار عن قهوة دمنهور', '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <MessageCircle size={24} />
                تواصل عبر واتساب
              </button>
              
              <button
                onClick={() => window.open('tel:+201234567890')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                اتصل بنا الآن
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-800 to-orange-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">
              🌟 عروض خاصة للعملاء المميزين 🌟
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">✅ توصيل مجاني</h4>
                <p className="text-amber-100">داخل دمنهور للطلبات أكثر من 150 جنيه</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">🎁 هدية مع كل طلب</h4>
                <p className="text-amber-100">عينة مجانية من قهوة جديدة مع كل شراء</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">💳 خصم للعملاء المميزين</h4>
                <p className="text-amber-100">خصم 10% للطلبات الشهرية أكثر من 500 جنيه</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">🚚 توصيل سريع</h4>
                <p className="text-amber-100">توصيل في نفس اليوم داخل دمنهور</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-bold mb-4">
                اطلب الآن واستمتع بأفضل قهوة في دمنهور! ☕
              </p>
              <button
                onClick={() => window.open('https://wa.me/201234567890?text=أريد الاستفادة من العروض الخاصة', '_blank')}
                className="bg-white text-amber-900 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-amber-50 transform hover:scale-105 transition-all duration-300"
              >
                اطلب عرضك الخاص الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
