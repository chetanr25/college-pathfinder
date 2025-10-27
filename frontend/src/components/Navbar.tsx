import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  Category, 
  Search, 
  Home as HomeIcon,
  TrendingUp 
} from '@mui/icons-material';
import theme from '../theme';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/colleges', label: 'Colleges', icon: <School /> },
    { path: '/branches', label: 'Branches', icon: <Category /> },
    { path: '/search', label: 'Search', icon: <Search /> },
    { path: '/predictor', label: 'Predictor', icon: <TrendingUp /> },
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <School style={styles.logoIcon} />
          <span style={styles.logoText}>KCET Predictor</span>
        </Link>

        <div style={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              <span style={styles.navLinkIcon}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    background: theme.colors.background.paper,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    boxShadow: theme.shadows.sm,
    position: 'sticky' as const,
    top: 0,
    zIndex: theme.zIndex.sticky,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    textDecoration: 'none',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
  },
  logoIcon: {
    fontSize: '2rem',
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoText: {
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    textDecoration: 'none',
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.md,
    transition: theme.transitions.base,
    fontSize: theme.typography.fontSize.sm,
  },
  navLinkIcon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
  },
  navLinkActive: {
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    boxShadow: theme.shadows.glow,
  },
};

export default Navbar;
