// src/types/cartTypes.ts

export type CartItem = {
  id: string;
  name_ar: string;
  price: number;
  image_url: string;
  quantity: number;
};

export type CartProduct = {
  id: string;
  name_ar: string;
  price: number;
  image_url: string;
  description_ar: string; // ✅ تمت إضافتها هنا
};

export type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  loading: boolean;
};
