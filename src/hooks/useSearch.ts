import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { SearchFilters } from '@/components/search/SearchBar';

interface UseSearchResult {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  search: (query: string, filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
}

const ITEMS_PER_PAGE = 12;

export const useSearch = (): UseSearchResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  const buildQuery = useCallback((query: string, filters: SearchFilters, from: number) => {
    let supabaseQuery = supabase
      .from('products')
      .select('*')
      .range(from, from + ITEMS_PER_PAGE - 1);

    if (query) {
      supabaseQuery = supabaseQuery.textSearch('name', query);
    }

    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category);
    }

    if (filters.minPrice !== undefined) {
      supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'السعر: من الأقل للأعلى':
          supabaseQuery = supabaseQuery.order('price', { ascending: true });
          break;
        case 'السعر: من الأعلى للأقل':
          supabaseQuery = supabaseQuery.order('price', { ascending: false });
          break;
        case 'الأحدث':
          supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
          break;
        case 'الأكثر مبيعاً':
          supabaseQuery = supabaseQuery.order('sales_count', { ascending: false });
          break;
      }
    }

    return supabaseQuery;
  }, []);

  const search = useCallback(async (query: string, filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentFilters(filters);
    setCurrentPage(0);

    try {
      const { data, error } = await buildQuery(query, filters, 0);

      if (error) throw error;

      setProducts(data || []);
      setHasMore((data || []).length === ITEMS_PER_PAGE);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const from = nextPage * ITEMS_PER_PAGE;

    try {
      const { data, error } = await buildQuery(currentQuery, currentFilters, from);

      if (error) throw error;

      if (data) {
        setProducts(prev => [...prev, ...data]);
        setHasMore(data.length === ITEMS_PER_PAGE);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery, currentFilters, currentPage, currentQuery, hasMore, isLoading]);

  return {
    products,
    isLoading,
    hasMore,
    error,
    search,
    loadMore,
  };
}; 