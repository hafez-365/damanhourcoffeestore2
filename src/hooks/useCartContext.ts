// src/hooks/useCartContext.ts
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { CartContextType } from '@/types/cartTypes';

const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext يجب أن يستخدم داخل CartProvider');
  }
  return context;
};

export default useCartContext;