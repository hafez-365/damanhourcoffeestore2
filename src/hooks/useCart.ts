import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CART_STORAGE_KEY = "damanhour_cart";

export interface CartItem {
  id: string;  // product id
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  quantity: number;
  cartItemId?: string; // cart item id in Supabase
}

const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastState, setToastState] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load cart from Supabase or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from("cart_items")
            .select(`
              id,
              quantity,
              unit_price,
              product_id,
              products (
                id,
                name_ar,
                description_ar,
                price,
                image_url
              )
            `)
            .eq("user_id", user.id);

          if (error) throw error;

          const cartItems = data
            .map((item) => {
              const product = Array.isArray(item.products)
                ? item.products[0]
                : item.products;
              
              if (!product) return null;

              return {
                id: product.id,
                cartItemId: item.id,
                name_ar: product.name_ar,
                description_ar: product.description_ar,
                price: item.unit_price || product.price,
                image_url: product.image_url || "",
                quantity: item.quantity,
              };
            })
            .filter((item): item is CartItem => item !== null);

          setCart(cartItems);
        } else {
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل سلة المشتريات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Show toast messages
  useEffect(() => {
    if (toastState) {
      if (toastState.type === "success") {
        toast.success(toastState.message);
      } else {
        toast.error(toastState.message);
      }
      setToastState(null);
    }
  }, [toastState]);

  // Add to cart with Supabase sync
  const addToCart = useCallback(
    async (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
      if (!user) {
        // Guest mode - localStorage only
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);
          return existingItem
            ? prevCart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...prevCart, { ...product, quantity }];
        });
        return;
      }

      // Authenticated user - sync with Supabase
      try {
        setLoading(true);

        // Check if product already exists in cart
        const { data: existingItem, error: checkError } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") throw checkError;

        if (existingItem) {
          // Update quantity in Supabase
          const newQuantity = existingItem.quantity + quantity;
          const newTotalPrice = product.price * newQuantity;

          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              unit_price: product.price,
              total_price: newTotalPrice,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingItem.id);

          if (updateError) throw updateError;

          // Update local state
          setCart((prev) =>
            prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
        } else {
          // Insert new item to Supabase
          const { data: newItem, error: insertError } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: quantity,
              unit_price: product.price,
              total_price: product.price * quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Update local state
          setCart((prev) => [
            ...prev,
            {
              ...product,
              quantity,
              cartItemId: newItem.id,
            },
          ]);
        }

        toast({
          title: "تمت الإضافة",
          description: `تم إضافة ${product.name_ar} إلى السلة`,
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "خطأ",
          description: "فشل في إضافة المنتج إلى السلة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Remove from cart with Supabase sync
  const removeFromCart = useCallback(
    async (productId: string) => {
      const itemToRemove = cart.find((item) => item.id === productId);
      if (!itemToRemove) return;

      if (!user) {
        // Guest mode - localStorage only
        setCart((prev) => prev.filter((item) => item.id !== productId));
        setToastState({
          show: true,
          message: "تم حذف المنتج من السلة",
          type: "success",
        });
        return;
      }

      // Authenticated user - sync with Supabase
      try {
        setLoading(true);

        if (itemToRemove.cartItemId) {
          const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", itemToRemove.cartItemId);

          if (error) throw error;
        }

        // Update local state
        setCart((prev) => prev.filter((item) => item.id !== productId));
        setToastState({
          show: true,
          message: "تم حذف المنتج من السلة",
          type: "success",
        });
      } catch (error) {
        console.error("Error removing from cart:", error);
        setToastState({
          show: true,
          message: "فشل في حذف المنتج من السلة",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, cart]
  );

  // Update quantity with Supabase sync
  const updateQuantity = useCallback(
    async (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const itemToUpdate = cart.find((item) => item.id === productId);
      if (!itemToUpdate) return;

      if (!user) {
        // Guest mode - localStorage only
        setCart((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
        return;
      }

      // Authenticated user - sync with Supabase
      try {
        setLoading(true);

        if (itemToUpdate.cartItemId) {
          const { error } = await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", itemToUpdate.cartItemId);

          if (error) throw error;
        }

        // Update local state
        setCart((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      } catch (error) {
        console.error("Error updating quantity:", error);
        setToastState({
          show: true,
          message: "فشل في تحديث الكمية",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, cart, removeFromCart]
  );

  // Clear cart with Supabase sync
  const clearCart = useCallback(async () => {
    if (!user) {
      // Guest mode - localStorage only
      setCart([]);
      setToastState({
        show: true,
        message: "تم تفريغ السلة",
        type: "success",
      });
      return;
    }

    // Authenticated user - sync with Supabase
    try {
      setLoading(true);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setCart([]);
      setToastState({
        show: true,
        message: "تم تفريغ السلة",
        type: "success",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      setToastState({
        show: true,
        message: "فشل في تفريغ السلة",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cartCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  return {
    cart,
    cartCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
  };
};

export default useCart;
