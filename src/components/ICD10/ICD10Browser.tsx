import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';

interface ICD10Code {
  id: string;
  code: string;
  description: string;
  category: string;
  chapter: string;
  subcategory?: string;
  block?: string;
}

interface ICD10Chapter {
  id: string;
  chapter_number: number;
  title: string;
  description?: string;
}

interface ICD10BrowserProps {
  onSelect?: (code: ICD10Code) => void;
  selectedCodes?: ICD10Code[];
  className?: string;
}

export function ICD10Browser({ 
  onSelect, 
  selectedCodes = [], 
  className = "" 
}: ICD10BrowserProps) {
  const [codes, setCodes] = useState<ICD10Code[]>([]);
  const [chapters, setChapters] = useState<ICD10Chapter[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load chapters
        const chaptersResponse = await fetch('http://localhost:3001/api/icd10/chapters');
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
        }

        // Load categories
        const categoriesResponse = await fetch('http://localhost:3001/api/icd10/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Load initial codes
        await loadCodes();
      } catch (error) {
        console.error('Error loading ICD-10 data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load codes with filters
  const loadCodes = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((page - 1) * itemsPerPage).toString()
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedChapter) {
        params.append('chapter', selectedChapter);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`http://localhost:3001/api/icd10?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
        // Calculate total pages (this is a simplified approach)
        setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    }
  };

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadCodes(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedChapter, selectedCategory]);

  // Handle page changes
  useEffect(() => {
    loadCodes(currentPage);
  }, [currentPage]);

  const toggleChapter = (chapterNumber: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNumber)) {
      newExpanded.delete(chapterNumber);
    } else {
      newExpanded.add(chapterNumber);
    }
    setExpandedChapters(newExpanded);
  };

  const isSelected = (code: ICD10Code) => {
    return selectedCodes.some(selected => selected.code === code.code);
  };

  const handleCodeClick = (code: ICD10Code) => {
    if (onSelect) {
      onSelect(code);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedChapter('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">Loading ICD-10 codes...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ICD-10 codes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.title}>
                    {chapter.chapter_number}. {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {(searchTerm || selectedChapter || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Codes List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {codes.map((code) => (
            <div
              key={code.id}
              onClick={() => handleCodeClick(code)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected(code) ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      {code.code}
                    </span>
                    {isSelected(code) && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-900">
                    {code.description}
                  </p>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    {code.category && (
                      <span>Category: {code.category}</span>
                    )}
                    {code.chapter && (
                      <span>Chapter: {code.chapter}</span>
                    )}
                  </div>
                </div>
                {onSelect && (
                  <button className="ml-4 text-gray-400 hover:text-green-600">
                    {isSelected(code) ? '✓' : '+'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
