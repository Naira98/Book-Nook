import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilters {
  category: string;
  author: string;
  status: 'borrow' | 'purchase';
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  pageType: 'borrow' | 'purchase';
}

const categories = [
  'Fiction',
  'Science',
  'Biography',
  'Technology',
  'Art',
  'History',
  'Children',
  'Other',
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search books...", pageType }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    author: '',
    status: pageType, // Set initial status based on the page type
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, status: pageType }));
  }, [pageType]);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-6 fade-in-up">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="block w-full pl-10 pr-28 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] shadow-sm transition-all"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors duration-200"
            type="button"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-hover)] transition-colors duration-200"
            type="button"
          >
            Search
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-md fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-1">
                Author
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                placeholder="Author name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-1">
                Availability
              </label>
              <select
                value={filters.status}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              >
                <option value={pageType}>
                  {pageType === 'borrow' ? 'Available for Borrow' : 'Available for Purchase'}
                </option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;