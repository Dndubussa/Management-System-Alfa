import React, { useState } from 'react';
import { ICD10Search } from './ICD10Search';
import { X, Plus } from 'lucide-react';

interface ICD10Code {
  code: string;
  description: string;
  category: string;
  chapter?: string;
}

interface ICD10SelectorProps {
  selectedCodes: ICD10Code[];
  onCodesChange: (codes: ICD10Code[]) => void;
  maxCodes?: number;
  className?: string;
}

export function ICD10Selector({ 
  selectedCodes, 
  onCodesChange, 
  maxCodes = 10,
  className = ""
}: ICD10SelectorProps) {
  const [showSearch, setShowSearch] = useState(false);

  const handleAddCode = (code: ICD10Code) => {
    // Check if code is already selected
    if (selectedCodes.some(selected => selected.code === code.code)) {
      return;
    }

    // Check max codes limit
    if (selectedCodes.length >= maxCodes) {
      alert(`Maximum ${maxCodes} ICD-10 codes allowed`);
      return;
    }

    onCodesChange([...selectedCodes, code]);
    setShowSearch(false);
  };

  const handleRemoveCode = (codeToRemove: ICD10Code) => {
    onCodesChange(selectedCodes.filter(code => code.code !== codeToRemove.code));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Codes */}
      {selectedCodes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected ICD-10 Codes ({selectedCodes.length}/{maxCodes})
          </h4>
          <div className="space-y-2">
            {selectedCodes.map((code, index) => (
              <div
                key={code.code}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium text-green-600">
                      {code.code}
                    </span>
                    <span className="text-sm text-gray-900">
                      {code.description}
                    </span>
                    {code.category && (
                      <span className="text-xs text-gray-500">
                        {code.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCode(code)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove code"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Code Button */}
      {selectedCodes.length < maxCodes && (
        <div>
          {!showSearch ? (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add ICD-10 Code</span>
            </button>
          ) : (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Search and Add ICD-10 Code
                </h4>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ICD10Search
                onSelect={handleAddCode}
                selectedCodes={selectedCodes}
                placeholder="Search by code or description..."
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Max Codes Reached Message */}
      {selectedCodes.length >= maxCodes && (
        <div className="text-sm text-gray-500 text-center py-2">
          Maximum {maxCodes} ICD-10 codes reached
        </div>
      )}
    </div>
  );
}
