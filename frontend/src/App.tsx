import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import Branches from './pages/Branches';
import CollegeDetails from './pages/CollegeDetails';
import BranchDetails from './pages/BranchDetails';
import RankPredictor from './pages/RankPredictor';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import './styles/globals.css';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ color: '#fff', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Content with Navbar
const AppContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Hide navbar on login, callback, and ai-chat pages
  const hideNavbar = ['/login', '/auth/callback', '/ai-chat'].includes(location.pathname) || 
                     location.pathname.startsWith('/ai-chat');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNavbar && (
        <Navbar 
          user={user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
          } : null}
          onSignOut={signOut}
        />
      )}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/college/:collegeCode" element={<CollegeDetails />} />
          <Route path="/branch/:branchName" element={<BranchDetails />} />
        <Route path="/predictor" element={<RankPredictor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/ai-chat" 
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
    </Router>
    </AuthProvider>
  );
};

export default App;
