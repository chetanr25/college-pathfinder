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
  AccountCircle,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';
import { Menu, MenuItem, IconButton, Avatar, Drawer, useMediaQuery } from '@mui/material';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    setMobileMenuOpen(false);
    if (onSignOut) onSignOut();
  };

  const renderNavLinks = (mobile = false) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.requiresAuth && !user ? '/login' : link.path}
          style={{
            ...styles.navLink,
            ...(mobile ? styles.mobileNavLink : {}),
            ...(isActive(link.path) ? styles.navLinkActive : {}),
          }}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <span style={styles.navLinkIcon}>{link.icon}</span>
          <span style={styles.navLinkLabel}>{link.label}</span>
        </Link>
      ))}
    </>
  );

  const renderAuthSection = (mobile = false) => (
    <>
      {user ? (
        <>
          <IconButton onClick={handleMenuOpen} sx={{ marginLeft: mobile ? 0 : '8px' }}>
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
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                minWidth: '200px',
              }
            }}
          >
            <MenuItem disabled>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
            </MenuItem>
            <MenuItem disabled>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</span>
            </MenuItem>
            <MenuItem onClick={handleSignOut} sx={{ color: '#ef4444' }}>
              <Logout sx={{ mr: 1, fontSize: '1.25rem' }} />
              Sign Out
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Link 
          to="/login" 
          style={{
            ...styles.loginButton,
            ...(mobile ? styles.mobileLoginButton : {}),
          }}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <Login style={{ fontSize: '1.25rem' }} />
          <span>Sign In</span>
        </Link>
      )}
    </>
  );

  return (
    <nav style={{
      ...styles.navbar,
      boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.08)',
    }}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIconWrapper}>
            <School style={styles.logoIcon} />
          </div>
          <div style={styles.logoTextWrapper}>
            <span style={styles.logoText}>College Path</span>
            <span style={styles.logoSubtext}>FINDER</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={styles.navLinks}>
            {renderNavLinks()}
            {renderAuthSection()}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div style={styles.mobileActions}>
            {renderAuthSection(true)}
            <IconButton 
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: '#667eea' }}
            >
              <MenuIcon />
            </IconButton>
          </div>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen && isMobile}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            sx: {
              width: '280px',
              background: '#fff',
              padding: '20px',
            }
          }}
        >
          <div style={styles.mobileDrawerHeader}>
            <span style={styles.mobileDrawerTitle}>Menu</span>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </div>
          <div style={styles.mobileNavLinks}>
            {renderNavLinks(true)}
          </div>
        </Drawer>
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
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '48px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  logoIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.35)',
  },
  logoIcon: {
    fontSize: '1.5rem',
    color: '#ffffff',
  },
  logoTextWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logoText: {
    fontSize: '1.15rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
  },
  logoSubtext: {
    fontSize: '0.65rem',
    color: '#9CA3AF',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },
  navLinks: {
    display: 'flex',
    gap: '6px',
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
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.875rem',
  },
  mobileNavLink: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '4px',
  },
  navLinkIcon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
  },
  navLinkLabel: {
    fontFamily: theme.typography.fontFamily.primary,
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.35)',
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
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  mobileLoginButton: {
    marginLeft: 0,
    marginRight: '8px',
    padding: '8px 16px',
    fontSize: '0.8rem',
  },
  mobileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  mobileDrawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB',
  },
  mobileDrawerTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1F2937',
  },
  mobileNavLinks: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
};

export default Navbar;
