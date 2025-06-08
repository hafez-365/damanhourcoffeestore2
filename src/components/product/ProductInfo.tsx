import React from 'react';
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Star } from "lucide-react";

interface ProductInfoProps {
  name: string;
  description: string;
  price: number;
  rating?: number;
  category?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  description,
  price,
  rating,
  category,
  isNew,
  isOnSale,
  originalPrice,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {isNew && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              جديد
            </Badge>
          )}
          {isOnSale && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              تخفيض
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(price)}
          </span>
          {isOnSale && originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {category && (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        )}
      </div>

      {rating !== undefined && (
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}; 