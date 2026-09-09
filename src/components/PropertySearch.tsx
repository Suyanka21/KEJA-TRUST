import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { KENYA_COUNTIES } from '../data/kenyaData';

interface PropertySearchProps {
  selectedCounty: number | null;
  onSelectCounty: (countyCode: number | null) => void;
  estateSearch: string;
  onEstateSearchChange: (val: string) => void;
  keywordSearch: string;
  onKeywordSearchChange: (val: string) => void;
  popularEstates: string[];
  onSelectPopularEstate: (estate: string) => void;
  resultCount: number;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  selectedCounty,
  onSelectCounty,
  estateSearch,
  onEstateSearchChange,
  keywordSearch,
  onKeywordSearchChange,
  popularEstates,
  onSelectPopularEstate,
  resultCount,
}) => {
  // Local state for debounced estate typing
  const [localEstate, setLocalEstate] = useState(estateSearch);

  useEffect(() => {
    setLocalEstate(estateSearch);
  }, [estateSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onEstateSearchChange(localEstate);
    }, 280); // 280ms debounce for mobile keystrokes
    return () => clearTimeout(timer);
  }, [localEstate, onEstateSearchChange]);

  const handleResetFilters = () => {
    onSelectCounty(null);
    setLocalEstate('');
    onEstateSearchChange('');
    onKeywordSearchChange('');
  };

  const hasActiveFilters = selectedCounty !== null || estateSearch.trim() !== '' || keywordSearch.trim() !== '';

  return (
    <div id="property-search-section" className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm">
      <div className="space-y-4">
        {/* Title & Introduction */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 id="search-heading" className="text-lg sm:text-xl font-bold text-neutral-900">
              Find &amp; Review Kenyan Properties
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Lookup rental histories, deposit return reliability, and water cartels across 47 counties.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              id="clear-filters-btn"
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium self-start sm:self-auto py-1 px-2 rounded-md hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* County Dropdown (ISO 1-47) */}
          <div className="relative">
            <label htmlFor="county-select" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              County (ISO 1–47)
            </label>
            <div className="relative">
              <select
                id="county-select"
                value={selectedCounty ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onSelectCounty(val ? parseInt(val, 10) : null);
                }}
                className="w-full appearance-none pl-9 pr-8 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All 47 Counties</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code.toString().padStart(2, '0')} – {c.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Estate Search with Debounce */}
          <div className="relative">
            <label htmlFor="estate-search-input" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Estate / Neighborhood
            </label>
            <div className="relative">
              <input
                id="estate-search-input"
                type="text"
                value={localEstate}
                onChange={(e) => setLocalEstate(e.target.value)}
                placeholder="e.g. Kilimani, Roysambu, Westlands..."
                className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              <Filter className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              {localEstate && (
                <button
                  type="button"
                  onClick={() => setLocalEstate('')}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Building Name or Street Search */}
          <div className="relative">
            <label htmlFor="keyword-search-input" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Building or Street
            </label>
            <div className="relative">
              <input
                id="keyword-search-input"
                type="text"
                value={keywordSearch}
                onChange={(e) => onKeywordSearchChange(e.target.value)}
                placeholder="e.g. Silvercrest, Kindaruma Rd..."
                className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              {keywordSearch && (
                <button
                  type="button"
                  onClick={() => onKeywordSearchChange('')}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Estate Suggestion Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-neutral-500 font-medium mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Quick Estates:
          </span>
          {popularEstates.map((estate) => {
            const isSelected = estateSearch.toLowerCase() === estate.toLowerCase();
            return (
              <button
                key={estate}
                type="button"
                onClick={() => onSelectPopularEstate(isSelected ? '' : estate)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {estate}
              </button>
            );
          })}
        </div>

        {/* Results summary bar */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing <strong className="text-neutral-900">{resultCount}</strong>{' '}
            {resultCount === 1 ? 'property' : 'properties'}
          </span>
          {selectedCounty && (
            <span className="text-emerald-700 font-medium">
              Filtered by County: {KENYA_COUNTIES.find((c) => c.code === selectedCounty)?.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
