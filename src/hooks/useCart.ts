import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CART_STORAGE_KEY = "damanhour_cart";

export interface CartItem {
  id: number; // product id
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

      // داخل useEffect الذي يحمل السلة من Supabase
      try {
        if (user) {
          const { data, error } = await supabase
            .from("cart_items")
            .select(
              `
              id,
              quantity,
              products (
                id,
                name_ar,
                description_ar,
                price,
                image_url
              )
            `
            )
            .eq("user_id", user.id);

          if (error) throw error;

          const cartItems = data
            .map((item) => {
              // تحقق هل products مصفوفة ام كائن مفرد
              const product = Array.isArray(item.products)
                ? item.products[0]
                : item.products;
              return {
                id: product?.id,
                cartItemId: item.id,
                name_ar: product?.name_ar,
                description_ar: product?.description_ar,
                price: product?.price,
                image_url: product?.image_url || "",
                quantity: item.quantity,
              };
            })
            .filter((item) => item.id !== undefined) as CartItem[];

          setCart(cartItems);
        } else {
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        toast.error("فشل في تحميل سلة المشتريات");
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
          const updatedCart = existingItem
            ? prevCart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...prevCart, { ...product, quantity }];

          return updatedCart;
        });

        setToastState({
          show: true,
          message: `تم إضافة ${product.name_ar} إلى السلة`,
          type: "success",
        });
        return;
      }

      // Authenticated user - sync with Supabase
      try {
        setLoading(true);

        // Check if product already exists in cart
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          // Update quantity in Supabase
          const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + quantity })
            .eq("id", existingItem.cartItemId);

          if (error) throw error;

          // Update local state
          setCart((prev) =>
            prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          // Insert new item to Supabase
          const { data, error } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity,
            })
            .select()
            .single();

          if (error) throw error;

          // Update local state
          setCart((prev) => [
            ...prev,
            {
              ...product,
              quantity,
              cartItemId: data.id,
            },
          ]);
        }

        setToastState({
          show: true,
          message: `تم إضافة ${product.name_ar} إلى السلة`,
          type: "success",
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        setToastState({
          show: true,
          message: "فشل في إضافة المنتج إلى السلة",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, cart]
  );

  // Remove from cart with Supabase sync
  const removeFromCart = useCallback(
    async (productId: number) => {
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
    async (productId: number, newQuantity: number) => {
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
