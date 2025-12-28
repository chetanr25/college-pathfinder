import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  Category, 
  Home as HomeIcon,
 TrendingUp,
  SmartToy,
  Login,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import theme from '../theme';

// Auth context placeholder - will be replaced when auth is fully set up
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface NavbarProps {
  user?: User | null;
  onSignOut?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/colleges', label: 'Colleges', icon: <School /> },
    { path: '/branches', label: 'Branches', icon: <Category /> },
   { path: '/predictor', label: 'Predictor', icon: <TrendingUp /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <SmartToy />, requiresAuth: true },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    if (onSignOut) onSignOut();
  };

  return (
    <nav style={{
      ...styles.navbar,
      boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIconWrapper}>
          <School style={styles.logoIcon} />
          </div>
          <div style={styles.logoTextWrapper}>
            <span style={styles.logoText}>College Path</span>
            <span style={styles.logoSubtext}>Finder</span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.requiresAuth && !user ? '/login' : link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              <span style={styles.navLinkIcon}>{link.icon}</span>
              <span style={styles.navLinkLabel}>{link.label}</span>
            </Link>
          ))}

          {/* Auth Section */}
          {user ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ marginLeft: '8px' }}>
                {user.avatar_url ? (
                  <Avatar src={user.avatar_url} sx={{ width: 36, height: 36 }} />
                ) : (
                  <AccountCircle sx={{ fontSize: 36, color: '#667eea' }} />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <span style={{ fontWeight: 600 }}>{user.name}</span>
                </MenuItem>
                <MenuItem disabled>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</span>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Logout sx={{ mr: 1, fontSize: '1.25rem' }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link to="/login" style={styles.loginButton}>
              <Login style={{ fontSize: '1.25rem' }} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  logoIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  logoIcon: {
    fontSize: '1.75rem',
    color: '#ffffff',
  },
  logoTextWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
  },
  logoSubtext: {
    fontSize: '0.75rem',
    color: '#6B7280',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  navLinks: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    textDecoration: 'none',
    color: '#4B5563',
    fontWeight: 500,
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
  },
  navLinkIcon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
  },
  navLinkLabel: {
    fontFamily: theme.typography.fontFamily.primary,
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '0.875rem',
    marginLeft: '8px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
