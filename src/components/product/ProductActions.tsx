/** @jsxImportSource react */
import { type FC, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, Share2, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProductActionsProps {
  product: Product;
  onShare?: () => void;
}

export const ProductActions: FC<ProductActionsProps> = ({
  product,
  onShare,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  // التحقق من حالة الإعجاب عند تحميل المكون
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) {
        setIsLiked(false);
        return;
      }

      try {
        console.log('Checking favorite status for:', {
          user_id: user.id,
          product_id: product.id
        });

        const { data, error } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking favorite status:", error);
          return;
        }

        console.log('Favorite status check result:', data);
        setIsLiked(!!data);
      } catch (error) {
        console.error("Error checking favorite status:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء التحقق من حالة المفضلة",
          variant: "destructive",
        });
      }
    };

    checkIfLiked();
  }, [user, product.id, toast]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول لإضافة المنتجات إلى السلة",
        variant: "destructive"
      });
      return;
    }

    if (!product.id) {
      toast({
        title: "خطأ",
        description: "معرف المنتج غير صالح",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting add to cart:', {
      user_id: user.id,
      product_id: product.id,
      product_details: product
    });

    setIsAddingToCart(true);
    try {
      // التحقق من وجود المنتج في السلة
      console.log('Checking if product exists in cart...');
      const { data: existingItems, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      console.log('Check result:', { existingItems, checkError });

      if (checkError) {
        console.error('Error checking cart items:', checkError);
        throw checkError;
      }

      const existingItem = existingItems?.[0];
      console.log('Existing item:', existingItem);

      if (existingItem) {
        // تحديث الكمية إذا كان المنتج موجود
        console.log('Updating existing item...');
        const newQuantity = existingItem.quantity + 1;
        const newTotalPrice = product.price * newQuantity;
        
        const { data: updatedItem, error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
            unit_price: product.price,
            total_price: newTotalPrice,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingItem.id)
          .select();

        console.log('Update result:', { updatedItem, updateError });

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          throw updateError;
        }
      } else {
        // إضافة منتج جديد
        console.log('Adding new item...');
        const newItem = {
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('New item data:', newItem);

        const { data: insertedItem, error: insertError } = await supabase
          .from("cart_items")
          .insert(newItem)
          .select();

        console.log('Insert result:', { insertedItem, insertError });

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
          throw insertError;
        }
      }

      // تحديث عداد السلة
      console.log('Updating cart count...');
      const { data: cartItems, error: countError } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);

      console.log('Cart count result:', { cartItems, countError });

      if (countError) {
        console.error('Error fetching cart count:', countError);
      } else {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('[data-cart-count]');
        if (cartCountElement) {
          cartCountElement.textContent = String(totalItems);
          console.log('Updated cart count:', totalItems);
        }
      }

      toast({
        title: "تمت الإضافة",
        description: `تم إضافة ${product.name_ar} إلى السلة`,
      });

    } catch (error) {
      console.error("Error managing cart:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إدارة السلة",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة",
        variant: "destructive"
      });
      return;
    }

    setIsTogglingLike(true);
    try {
      console.log('Toggling favorite status:', {
        current: isLiked,
        user_id: user.id,
        product_id: product.id
      });

      if (isLiked) {
        // إزالة من المفضلة
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (error) throw error;

        setIsLiked(false);
        toast({
          title: "تم إزالة الإعجاب",
          description: "تم إزالة المنتج من المفضلة",
        });
      } else {
        // إضافة إلى المفضلة
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            product_id: product.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        setIsLiked(true);
        toast({
          title: "تم الإعجاب",
          description: "تمت إضافة المنتج إلى المفضلة",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المفضلة",
        variant: "destructive",
      });
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      if (navigator.share) {
        navigator.share({
          title: product.name_ar,
          text: product.description_ar || "",
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "تم النسخ",
          description: "تم نسخ رابط المنتج",
        });
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        className="flex-1"
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            جاري الإضافة...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 ml-2" />
            إضافة للسلة
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleLike}
        disabled={isTogglingLike}
        className={isLiked ? "text-red-600" : ""}
      >
        {isTogglingLike ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}; 