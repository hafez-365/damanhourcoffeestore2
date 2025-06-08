import React from 'react';
import { Card } from "@/components/ui/card";
import { ProductImage } from "./product/ProductImage";
import { ProductInfo } from "./product/ProductInfo";
import { ProductActions } from "./product/ProductActions";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onShare?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onShare }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 space-y-4">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="rounded-lg"
        />
        
        <ProductInfo
          name={product.name}
          description={product.description}
          price={product.price}
          rating={product.rating}
          category={product.category}
          isNew={product.isNew}
          isOnSale={product.isOnSale}
          originalPrice={product.originalPrice}
        />
        
        <ProductActions
          product={product}
          onShare={onShare}
        />
      </div>
    </Card>
  );
};

export default React.memo(ProductCard);
