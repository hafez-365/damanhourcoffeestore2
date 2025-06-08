import { type FC } from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/useCart";
import { CartItem as CartItemType } from "@/types/cartTypes";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse py-4">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <img
          src={item.image_url}
          alt={item.name_ar}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-base font-medium text-gray-900">{item.name_ar}</h3>
          <p className="text-base font-medium text-gray-900">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-gray-600 w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 