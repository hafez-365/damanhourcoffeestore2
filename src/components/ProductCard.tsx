
import React from 'react';
import { Star, Coffee, ExternalLink } from 'lucide-react';

interface Product {
  id: number;
  name_ar: string;
  description_ar: string;
  price: string;
  image: string;
  rating: number;
  googleFormUrl: string;
  available: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }

    return stars;
  };

  if (!product.available) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-100 hover:border-amber-300 transform hover:scale-105 transition-all duration-300 group">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center overflow-hidden">
          {product.image && product.image !== '/api/placeholder/300/200' ? (
            <img 
              src={product.image} 
              alt={product.name_ar}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={product.image && product.image !== '/api/placeholder/300/200' ? 'hidden' : ''}>
            <Coffee size={64} className="text-amber-700 opacity-50" />
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          جديد
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
            {product.name_ar}
          </h3>
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
          </div>
        </div>
        
        <p className="text-amber-700 mb-4 leading-relaxed text-sm">
          {product.description_ar}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-right">
            <span className="text-2xl font-bold text-amber-900">{product.price}</span>
            <span className="text-amber-700 mr-2">جنيه</span>
          </div>
          
          <div className="flex gap-2">
            {product.googleFormUrl && (
              <button
                onClick={() => window.open(product.googleFormUrl, '_blank')}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <ExternalLink size={16} />
                اطلب الآن
              </button>
            )}
            
            <button
              onClick={() => window.open(`https://wa.me/201234567890?text=أريد طلب ${product.name_ar} بسعر ${product.price} جنيه`, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              واتساب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
