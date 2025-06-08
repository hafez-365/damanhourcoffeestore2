import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/useCart";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CartSummaryProps {
  onCheckout: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ 
  onCheckout,
  isLoading = false,
  disabled = false
}) => {
  const { cart, totalPrice } = useCart();

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-base font-medium">
          <span>المجموع ({itemCount} منتج)</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
        <Button 
          className="w-full"
          onClick={onCheckout}
          disabled={cart.length === 0 || disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري تأكيد الطلب...
            </>
          ) : (
            'متابعة الشراء'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}; 