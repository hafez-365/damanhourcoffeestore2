import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from 'use-debounce';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  categories?: string[];
  sortOptions?: string[];
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  categories = [],
  sortOptions = ['السعر: من الأقل للأعلى', 'السعر: من الأعلى للأقل', 'الأحدث', 'الأكثر مبيعاً'],
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    onSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, onSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              تصفية
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {categories.length > 0 && (
              <>
                <DropdownMenuLabel>الفئات</DropdownMenuLabel>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleFilterChange('category', category)}
                    className="cursor-pointer"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel>السعر</DropdownMenuLabel>
            <div className="p-2 space-y-2">
              <Input
                type="number"
                placeholder="السعر الأدنى"
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="السعر الأقصى"
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>الترتيب</DropdownMenuLabel>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => handleFilterChange('sortBy', option)}
                className="cursor-pointer"
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('category', undefined)}
            >
              {filters.category} ×
            </Button>
          )}
          {filters.minPrice && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('minPrice', undefined)}
            >
              السعر الأدنى: {filters.minPrice} ×
            </Button>
          )}
          {filters.maxPrice && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('maxPrice', undefined)}
            >
              السعر الأقصى: {filters.maxPrice} ×
            </Button>
          )}
          {filters.sortBy && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('sortBy', undefined)}
            >
              {filters.sortBy} ×
            </Button>
          )}
          {Object.keys(filters).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              مسح الكل
            </Button>
          )}
        </div>
      )}
    </div>
  );
}; 