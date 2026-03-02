import React from 'react';
import type { College } from '../types';

interface Props {
  college: College;
  onViewDetails: (college: College) => void;
}

export const CollegeCard: React.FC<Props> = ({ college, onViewDetails }) => {
  const branches = college.branches || [];
  
  return (
    <div className="college-card">
      <h3>{college.name}</h3>
      <p>College Code: {college.code}</p>
      <div className="branches-preview">
        <p>Available Branches: {branches.length}</p>
        <div className="branches-list">
          {branches.slice(0, 3).map((branch, idx) => (
            <span key={`${college.code}-${branch}-${idx}`} className="branch-tag">{branch}</span>
          ))}
          {branches.length > 3 && <span key={`${college.code}-more`}>+{branches.length - 3} more</span>}
        </div>
      </div>
      <button onClick={() => onViewDetails(college)} className="view-details-btn">
        View Details
      </button>
    </div>
  );
};