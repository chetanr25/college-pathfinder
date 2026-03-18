import React, { useEffect, useState } from 'react';
import { Category, Search as SearchIcon } from '@mui/icons-material';
import { branchApi } from '../services/api';
import BranchCard from '../components/BranchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Grid, Input } from '../components/ui';
import theme from '../theme';
import SEO from '../components/SEO';

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
      <SEO title="Engineering Branches" description="Explore 50+ engineering branches available in KCET and find colleges offering each specialization." />
      {/* Hero Section */}
      <Hero
        icon={<Category />}
        title="Engineering Branches"
        subtitle={`Explore ${branches.length} engineering branches and find colleges offering them`}
        size="md"
        background={theme.colors.secondary.gradient}
      />

      {/* Search & Results */}
      <Section background="default" padding="lg">
        <Container maxWidth="lg">
          <div style={styles.searchOuter}>
            <div style={styles.searchWrapper}>
              <Input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<SearchIcon />}
                style={{ fontSize: theme.typography.fontSize.lg }}
              />
            </div>
            <div style={styles.resultBadge}>
              <span style={styles.resultCount}>
                <strong style={styles.resultNumber}>{filteredBranches.length}</strong>
                <span style={styles.resultLabel}>&nbsp;{filteredBranches.length === 1 ? 'branch' : 'branches'} available</span>
              </span>
            </div>
          </div>

          {filteredBranches.length === 0 ? (
            <div style={styles.emptyState}>
              <Category style={styles.emptyIcon} />
              <p style={styles.emptyText}>
                No branches found matching "{searchTerm}"
              </p>
              <p style={styles.emptyHint}>
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <Grid columns="auto" minItemWidth="320px" gap={5}>
              {filteredBranches.map((branch, index) => (
                <div
                  key={branch}
                  style={{ animation: `fadeInUp 0.5s ease-out ${Math.min(index * 0.02, 0.3)}s both` }}
                >
                  <BranchCard branchName={branch} />
                </div>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  searchOuter: {
    maxWidth: '640px',
    margin: '-32px auto 0',
    marginBottom: theme.spacing[8],
    padding: `0 ${theme.spacing[4]}`,
    position: 'relative' as const,
    zIndex: 5,
  },
  searchWrapper: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
    marginBottom: theme.spacing[4],
  },
  resultBadge: {
    display: 'flex',
    justifyContent: 'center',
  },
  resultCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  resultNumber: {
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: theme.typography.fontSize.lg,
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: 500 as const,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
  },
  emptyIcon: {
    fontSize: '4rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[3],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  emptyHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
};

export default Branches;
