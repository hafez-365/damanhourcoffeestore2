import { Database } from './supabase';

type BaseProduct = Database['public']['Tables']['products']['Row'];

export interface Product extends BaseProduct {
  category?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
} 