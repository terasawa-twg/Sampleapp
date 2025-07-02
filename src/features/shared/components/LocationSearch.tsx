// src/features/shared/components/LocationSearch.tsx
// 訪問先名検索コンポーネント

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LocationSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export function LocationSearch({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "訪問先名で検索" 
}: LocationSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-80"
      />
    </div>
  );
}