import React from 'react';
import type { SearchFilters } from '../types';

interface Props {
  filters: SearchFilters;
  branches: string[];
  onFilterChange: (filters: SearchFilters) => void;
}

export const SearchFiltersComponent: React.FC<Props> = ({ filters, branches, onFilterChange }) => {
  return (
    <div className="search-filters">
      <div className="filter-group">
        <input
          type="number"
          placeholder="Min Rank"
          value={filters.minRank || ''}
          onChange={(e) => onFilterChange({
            ...filters,
            minRank: e.target.value ? parseInt(e.target.value) : undefined
          })}
        />
        <input
          type="number"
          placeholder="Max Rank"
          value={filters.maxRank || ''}
          onChange={(e) => onFilterChange({
            ...filters,
            maxRank: e.target.value ? parseInt(e.target.value) : undefined
          })}
        />
      </div>
      <select
        value={filters.branch || ''}
        onChange={(e) => onFilterChange({ ...filters, branch: e.target.value || undefined })}
      >
        <option value="">All Branches</option>
        {branches.map(branch => (
          <option key={branch} value={branch}>{branch}</option>
        ))}
      </select>
      <select
        value={filters.round}
        onChange={(e) => onFilterChange({ ...filters, round: parseInt(e.target.value) })}
      >
        <option value={1}>Round 1</option>
        <option value={2}>Round 2</option>
        <option value={3}>Round 3</option>
      </select>
    </div>
  );
};