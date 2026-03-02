import React, { useEffect, useState } from 'react';
import { Category, Search as SearchIcon } from '@mui/icons-material';
import { branchApi } from '../services/api';
import BranchCard from '../components/BranchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Grid, Input } from '../components/ui';
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
          <div style={styles.searchWrapper}>
            <Input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<SearchIcon />}
              style={{ fontSize: theme.typography.fontSize.lg }}
            />
            
            <div style={styles.resultCount}>
              Showing <strong>{filteredBranches.length}</strong> of <strong>{branches.length}</strong> branches
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
  searchWrapper: {
    maxWidth: '600px',
    margin: '0 auto',
    marginBottom: theme.spacing[6],
    padding: `0 ${theme.spacing[4]}`,
  },
  resultCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
    textAlign: 'center' as const,
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
