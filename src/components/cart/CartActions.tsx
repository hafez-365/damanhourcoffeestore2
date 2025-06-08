import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/useCart";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const CartActions: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "تم تفريغ السلة",
      description: "تم حذف جميع المنتجات من السلة",
    });
  };

  return (
    <div className="flex justify-between items-center p-4">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <ShoppingBag className="h-4 w-4" />
        متابعة التسوق
      </Button>

      {cart.length > 0 && (
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={handleClearCart}
          disabled={cart.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          إفراغ السلة
        </Button>
      )}
    </div>
  );
}; 