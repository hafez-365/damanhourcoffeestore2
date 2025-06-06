// src/types/cartTypes.ts

export type CartItem = {
  id: number;
  name_ar: string;
  price: number;
  image_url: string;
  quantity: number;
};

export type CartProduct = {
  id: number;
  name_ar: string;
  price: number;
  image_url: string;
  description_ar: string; // ✅ تمت إضافتها هنا
};

export type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  loading: boolean;
};
