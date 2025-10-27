import React, { useEffect, useState } from 'react';
import type { College, SearchFilters } from './types';
import { CollegeCard } from './components/CollegeCard';
import { SearchFiltersComponent } from './components/SearchFilters';
import './styles/color-blend.css';

const App: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    round: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch branches on component mount
    fetch('http://localhost:8000/branches/list')
      .then(res => res.json())
      .then(data => setBranches(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch colleges when filters change
    const params = new URLSearchParams();
    if (filters.minRank) params.append('min_rank', filters.minRank.toString());
    if (filters.maxRank) params.append('max_rank', filters.maxRank.toString());
    if (filters.branch) params.append('branch', filters.branch);
    params.append('round', filters.round.toString());

    setLoading(true);
    fetch(`http://localhost:8000/colleges/search?${params}`)
      .then(res => res.json())
      .then(data => setColleges(data.colleges))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1>KCET College Predictor</h1>
      </header>
      
      <main className="layout-main">
        <div className="container">
          <SearchFiltersComponent
            filters={filters}
            branches={branches}
            onFilterChange={setFilters}
          />
          
          {loading ? (
            <div className="loading">Loading colleges...</div>
          ) : (
            <div className="colleges-grid">
              {colleges.map(college => (
                <CollegeCard
                  key={college.code}
                  college={college}
                  onViewDetails={(college) => {
                    // Handle college details view
                    console.log('View details for:', college);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="layout-footer">
        <p>© 2025 KCET College Predictor</p>
      </footer>
    </div>
  );
};

export default App;