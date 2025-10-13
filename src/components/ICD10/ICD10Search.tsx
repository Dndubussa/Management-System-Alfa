import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';

interface ICD10Code {
  code: string;
  description: string;
  category: string;
  chapter?: string;
}

interface ICD10SearchProps {
  onSelect: (code: ICD10Code) => void;
  selectedCodes?: ICD10Code[];
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export function ICD10Search({ 
  onSelect, 
  selectedCodes = [], 
  multiple = false, 
  placeholder = "Search ICD-10 codes...",
  className = ""
}: ICD10SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ICD10Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string, category: string) => {
      if (term.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: term,
          limit: '20'
        });
        
        if (category) {
          params.append('category', category);
        }

        const response = await fetch(`http://localhost:3001/api/icd10/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Error searching ICD-10 codes:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/icd10/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Handle search term changes
  useEffect(() => {
    debouncedSearch(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, debouncedSearch]);

  const handleSelect = (code: ICD10Code) => {
    onSelect(code);
    if (!multiple) {
      setSearchTerm('');
      setShowResults(false);
    }
  };

  const isSelected = (code: ICD10Code) => {
    return selectedCodes.some(selected => selected.code === code.code);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mt-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Results */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Searching...</div>
          ) : (
            results.map((code) => (
              <div
                key={code.code}
                onClick={() => handleSelect(code)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-green-50 ${
                  isSelected(code) ? 'bg-green-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-mono text-sm font-medium text-green-600">
                        {code.code}
                      </span>
                      {isSelected(code) && (
                        <Check className="ml-2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900 truncate">
                      {code.description}
                    </span>
                    {code.category && (
                      <span className="text-xs text-gray-500">
                        {code.category}
                      </span>
                    )}
                  </div>
                  {!isSelected(code) && (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Codes Display */}
      {multiple && selectedCodes.length > 0 && (
        <div className="mt-2 space-y-1">
          {selectedCodes.map((code) => (
            <div
              key={code.code}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm font-medium text-green-600">
                  {code.code}
                </span>
                <span className="text-sm text-gray-900">
                  {code.description}
                </span>
              </div>
              <button
                onClick={() => {
                  const updated = selectedCodes.filter(c => c.code !== code.code);
                  // This would need to be handled by parent component
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
