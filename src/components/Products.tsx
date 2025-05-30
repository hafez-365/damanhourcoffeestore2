
import React from 'react';
import ProductCard from './ProductCard';
import { Coffee, Star } from 'lucide-react';

const products = [
  {
    id: 1,
    name_ar: 'خلطة دمنهور الخاصة',
    description_ar: 'خلطة فريدة من أجود حبوب البن العربي مع لمسة دمنهور المميزة',
    price: 85,
    image_url: '/api/placeholder/300/200',
    rating: 5,
    form_link: 'https://forms.google.com/example1'
  },
  {
    id: 2,
    name_ar: 'قهوة عربية أصيلة',
    description_ar: 'قهوة عربية بحبوب محمصة طازجة وطحن ناعم',
    price: 75,
    image_url: '/api/placeholder/300/200',
    rating: 4.8,
    form_link: 'https://forms.google.com/example2'
  },
  {
    id: 3,
    name_ar: 'قهوة تركية فاخرة',
    description_ar: 'قهوة تركية مطحونة ناعم مع هيل طبيعي',
    price: 95,
    image_url: '/api/placeholder/300/200',
    rating: 4.9,
    form_link: 'https://forms.google.com/example3'
  },
  {
    id: 4,
    name_ar: 'إسبريسو دمنهور',
    description_ar: 'حبوب إسبريسو محمصة بعناية للحصول على أفضل طعم',
    price: 110,
    image_url: '/api/placeholder/300/200',
    rating: 5,
    form_link: 'https://forms.google.com/example4'
  },
  {
    id: 5,
    name_ar: 'قهوة بالحليب',
    description_ar: 'خلطة مميزة من القهوة مع بودرة الحليب الطبيعي',
    price: 65,
    image_url: '/api/placeholder/300/200',
    rating: 4.7,
    form_link: 'https://forms.google.com/example5'
  },
  {
    id: 6,
    name_ar: 'قهوة بالهيل',
    description_ar: 'قهوة عربية مع هيل أخضر مطحون طازج',
    price: 90,
    image_url: '/api/placeholder/300/200',
    rating: 4.8,
    form_link: 'https://forms.google.com/example6'
  }
];

const Products = () => {
  return (
    <section id="products" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
            <Coffee className="mx-4 text-amber-700" size={28} />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            منتجاتنا المميزة
          </h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            اختر من مجموعة واسعة من أجود أنواع القهوة المحمصة بعناية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-amber-200">
            <Coffee className="mx-auto mb-4 text-amber-700" size={48} />
            <h3 className="text-2xl font-bold text-amber-900 mb-4">
              ✨ عرض خاص للعملاء الجدد ✨
            </h3>
            <p className="text-lg text-amber-800 mb-6">
              توصيل مجاني داخل دمنهور للطلبات أكثر من 150 جنيه
            </p>
            <button 
              onClick={() => window.open('https://wa.me/201234567890?text=أريد الاستفادة من العرض الخاص', '_blank')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              اطلب الآن واستفد من العرض
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
