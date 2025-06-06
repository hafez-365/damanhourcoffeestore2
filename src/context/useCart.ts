import { useContext } from 'react';
import { CartContext } from './CartContext.tsx';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart ??? ?? ?????? ???? CartProvider');
  }
  return context;
};
