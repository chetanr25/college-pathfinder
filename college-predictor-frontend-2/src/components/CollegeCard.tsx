import React from 'react';
import { College } from '../types';

interface Props {
  college: College;
  onViewDetails: (college: College) => void;
}

export const CollegeCard: React.FC<Props> = ({ college, onViewDetails }) => {
  return (
    <div className="college-card">
      <h3>{college.name}</h3>
      <p>College Code: {college.code}</p>
      <div className="branches-preview">
        <p>Available Branches: {college.branches.length}</p>
        <div className="branches-list">
          {college.branches.slice(0, 3).map(branch => (
            <span key={branch} className="branch-tag">{branch}</span>
          ))}
          {college.branches.length > 3 && <span>+{college.branches.length - 3} more</span>}
        </div>
      </div>
      <button onClick={() => onViewDetails(college)} className="view-details-btn">
        View Details
      </button>
    </div>
  );
};