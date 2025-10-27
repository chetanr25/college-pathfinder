import React, { useEffect, useState } from 'react';
import { Category, Search as SearchIcon } from '@mui/icons-material';
import { branchApi } from '../services/api';
import BranchCard from '../components/BranchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import theme from '../theme';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await branchApi.getAllBranches();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading branches..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBranches} />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconWrapper}>
            <Category style={styles.headerIcon} />
          </div>
          <h1 style={styles.title}>Engineering Branches</h1>
          <p style={styles.subtitle}>
            Explore {branches.length} engineering branches and find colleges offering them
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <SearchIcon style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </section>

      {/* Branches Grid */}
      <section style={styles.branchesSection}>
        {filteredBranches.length === 0 ? (
          <div style={styles.emptyState}>
            <Category style={styles.emptyIcon} />
            <p style={styles.emptyText}>
              No branches found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          <div style={styles.branchesGrid}>
            {filteredBranches.map((branch) => (
              <BranchCard key={branch} branchName={branch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  header: {
    background: theme.colors.primary.gradient,
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.xl,
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[5],
  },
  headerIcon: {
    fontSize: '2.5rem',
    color: theme.colors.text.inverse,
  },
  title: {
    margin: 0,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  searchSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  searchWrapper: {
    position: 'relative' as const,
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: theme.spacing[4],
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.5rem',
    color: theme.colors.text.secondary,
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    padding: `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[12]}`,
    fontSize: theme.typography.fontSize.base,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.lg,
    outline: 'none',
    transition: theme.transitions.base,
    background: theme.colors.background.paper,
    boxShadow: theme.shadows.sm,
  },
  branchesSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[12]}`,
  },
  branchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing[4],
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: `${theme.spacing[16]} ${theme.spacing[4]}`,
  },
  emptyIcon: {
    fontSize: '4rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
};

export default Branches;
