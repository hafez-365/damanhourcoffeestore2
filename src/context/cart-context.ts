import { createContext, useContext } from 'react';
import { CartContextType } from '@/types/cartTypes';

export const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart يجب أن يستخدم داخل CartProvider');
  }
  return context;
};