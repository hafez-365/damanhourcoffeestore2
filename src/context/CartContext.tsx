// src/context/CartContext.tsx
import { createContext } from 'react';
import { CartContextType } from '@/types/cartTypes';

export const CartContext = createContext<CartContextType | null>(null);
