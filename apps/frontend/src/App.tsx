import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import { useServerStatus } from './hooks/useServerStatus';
import ServerDownCard from './components/ServerDownCard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

const ScrollManager: React.FC = () => {
  useScrollRestoration();
  return null;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { status: serverStatus } = useServerStatus();

  if (loading || serverStatus === 'checking') {
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

  if (serverStatus === 'down') {
    return <ServerDownCard />;
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
  
  const hideNavbar = ['/auth/callback', '/ai-chat'].includes(location.pathname) ||
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
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <ScrollManager />
            <AppContent />
            <Analytics />
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
};

export default App;
