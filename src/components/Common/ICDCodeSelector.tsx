import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, AlertCircle, Info } from 'lucide-react';
import { ICDCodeSearchResult, ICD10Code, ICD11Code } from '../../types';

interface ICDCodeSelectorProps {
  onCodeSelect: (code: ICDCodeSearchResult) => void;
  onCodeRemove?: (code: string) => void;
  selectedCodes?: ICDCodeSearchResult[];
  multiple?: boolean;
  codeType?: 'ICD-10' | 'ICD-11' | 'both';
  placeholder?: string;
  className?: string;
}

export function ICDCodeSelector({
  onCodeSelect,
  onCodeRemove,
  selectedCodes = [],
  multiple = false,
  codeType = 'both',
  placeholder = 'Search for ICD codes...',
  className = ''
}: ICDCodeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [icd10Codes, setIcd10Codes] = useState<ICD10Code[]>([]);
  const [icd11Codes, setIcd11Codes] = useState<ICD11Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ICD codes from API
  useEffect(() => {
    const fetchICDCodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = [];
        
        if (codeType === 'ICD-10' || codeType === 'both') {
          promises.push(
            fetch('/api/icd10-codes')
              .then(res => res.json())
              .then(data => setIcd10Codes(data))
          );
        }
        
        if (codeType === 'ICD-11' || codeType === 'both') {
          promises.push(
            fetch('/api/icd11-codes')
              .then(res => res.json())
              .then(data => setIcd11Codes(data))
          );
        }
        
        await Promise.all(promises);
      } catch (err) {
        setError('Failed to load ICD codes');
        console.error('Error fetching ICD codes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchICDCodes();
  }, [codeType]);

  // Filter and combine codes based on search term
  const filteredCodes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const results: ICDCodeSearchResult[] = [];
    
    if (codeType === 'ICD-10' || codeType === 'both') {
      icd10Codes
        .filter(code => 
          code.isActive && (
            code.code.toLowerCase().includes(searchLower) ||
            code.description.toLowerCase().includes(searchLower) ||
            code.category.toLowerCase().includes(searchLower)
          )
        )
        .slice(0, 50) // Limit results for performance
        .forEach(code => {
          results.push({
            codeType: 'ICD-10',
            code: code.code,
            description: code.description,
            category: code.category,
            subcategory: code.subcategory,
            isActive: code.isActive,
            createdAt: code.createdAt,
            updatedAt: code.updatedAt
          });
        });
    }
    
    if (codeType === 'ICD-11' || codeType === 'both') {
      icd11Codes
        .filter(code => 
          code.isActive && (
            code.code.toLowerCase().includes(searchLower) ||
            code.description.toLowerCase().includes(searchLower) ||
            code.category.toLowerCase().includes(searchLower)
          )
        )
        .slice(0, 50) // Limit results for performance
        .forEach(code => {
          results.push({
            codeType: 'ICD-11',
            code: code.code,
            description: code.description,
            category: code.category,
            subcategory: code.subcategory,
            isActive: code.isActive,
            createdAt: code.createdAt,
            updatedAt: code.updatedAt
          });
        });
    }
    
    return results;
  }, [searchTerm, icd10Codes, icd11Codes, codeType]);

  const handleCodeSelect = (code: ICDCodeSearchResult) => {
    onCodeSelect(code);
    if (!multiple) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleCodeRemove = (code: string) => {
    if (onCodeRemove) {
      onCodeRemove(code);
    }
  };

  const isCodeSelected = (code: string) => {
    return selectedCodes.some(selected => selected.code === code);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Selected Codes Display */}
      {selectedCodes.length > 0 && (
        <div className="mt-2 space-y-1">
          {selectedCodes.map((code) => (
            <div
              key={code.code}
              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {code.codeType}
                </span>
                <span className="font-mono text-sm font-medium text-blue-900">
                  {code.code}
                </span>
                <span className="text-sm text-blue-700">
                  {code.description}
                </span>
              </div>
              {onCodeRemove && (
                <button
                  onClick={() => handleCodeRemove(code.code)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading ICD codes...</span>
            </div>
          )}
          
          {error && (
            <div className="px-4 py-2 text-sm text-red-600 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {!loading && !error && filteredCodes.length === 0 && searchTerm && (
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>No ICD codes found for "{searchTerm}"</span>
            </div>
          )}
          
          {!loading && !error && filteredCodes.length > 0 && (
            <>
              {filteredCodes.map((code) => (
                <div
                  key={`${code.codeType}-${code.code}`}
                  onClick={() => handleCodeSelect(code)}
                  className={`cursor-pointer select-none relative py-2 px-4 hover:bg-blue-50 ${
                    isCodeSelected(code.code) ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {code.codeType}
                      </span>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {code.code}
                      </span>
                      <span className="text-sm text-gray-700 truncate">
                        {code.description}
                      </span>
                    </div>
                    {isCodeSelected(code.code) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {code.category} {code.subcategory && `• ${code.subcategory}`}
                  </div>
                </div>
              ))}
            </>
          )}
          
          {!loading && !error && !searchTerm && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Start typing to search for ICD codes...
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Helper component for displaying ICD codes in a compact format
export function ICDCodeDisplay({ 
  codes, 
  onRemove, 
  showType = true 
}: { 
  codes: ICDCodeSearchResult[]; 
  onRemove?: (code: string) => void;
  showType?: boolean;
}) {
  if (codes.length === 0) return null;

  return (
    <div className="space-y-2">
      {codes.map((code) => (
        <div
          key={`${code.codeType}-${code.code}`}
          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
        >
          <div className="flex items-center space-x-2">
            {showType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {code.codeType}
              </span>
            )}
            <span className="font-mono text-sm font-medium text-gray-900">
              {code.code}
            </span>
            <span className="text-sm text-gray-700">
              {code.description}
            </span>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(code.code)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

