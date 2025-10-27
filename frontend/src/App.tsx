import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import Branches from './pages/Branches';
import CollegeDetails from './pages/CollegeDetails';
import BranchDetails from './pages/BranchDetails';
import RankPredictor from './pages/RankPredictor';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/college/:collegeCode" element={<CollegeDetails />} />
          <Route path="/branch/:branchName" element={<BranchDetails />} />
          <Route path="/predictor" element={<RankPredictor />} />
          <Route path="/search" element={<RankPredictor />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
