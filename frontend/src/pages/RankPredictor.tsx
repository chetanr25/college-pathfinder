import React, { useState, useEffect } from 'react';
import { TrendingUp } from '@mui/icons-material';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { collegeApi, branchApi, type CollegeList } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Grid, Card, Input, Button, Badge } from '../components/ui';
import theme from '../theme';

const RankPredictor: React.FC = () => {
  const [rank, setRank] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState(1);
  const [limit, setLimit] = useState<string>('10');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [colleges, setColleges] = useState<CollegeList['colleges']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const branches = await branchApi.getAllBranches();
        setAvailableBranches(branches);
      } catch (err) {
        console.error('Failed to load branches:', err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rankNum = parseInt(rank);
    const limitNum = parseInt(limit);
    
    if (!rankNum || rankNum <= 0) {
      setError('Please enter a valid rank');
      return;
    }

    if (!limitNum || limitNum <= 0 || limitNum > 500) {
      setError('Please enter a valid limit (1-500)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      
      if (selectedBranches.length > 0) {
        const data = await collegeApi.searchColleges({
          min_rank: rankNum,
          branches: selectedBranches,
          round: selectedRound,
          limit: limitNum,
          sort_order: 'asc'
        });
        setColleges(data.colleges);
      } else {
        const data = await collegeApi.getCollegesByRank(rankNum, selectedRound, limitNum, 'asc');
        setColleges(data.colleges);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict colleges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <Hero
        icon={<TrendingUp />}
        title="KCET Rank Predictor"
        subtitle="Enter your KCET rank to find colleges you can get admitted to"
        size="md"
        background="linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)"
      />

      {/* Search Form */}
      <Section background="default" padding="lg">
        <Container maxWidth="md">
          <Card variant="elevated" padding={8} style={{ boxShadow: theme.shadows.xl }}>
            <form onSubmit={handleSearch}>
              <div style={styles.formGrid}>
                <Input
              type="number"
                  label="Your KCET Rank"
              placeholder="e.g., 5000"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
                  required
              min="1"
            />

                <Input
              type="number"
                  label="Number of Colleges"
              placeholder="e.g., 10"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
                  hint="Show top 1-500 colleges (default: 10)"
                  required
              min="1"
              max="500"
            />

                <div>
            <label style={styles.label}>Filter by Branches (Optional)</label>
            <Autocomplete
              multiple
              options={availableBranches}
              value={selectedBranches}
              onChange={(_, newValue) => setSelectedBranches(newValue)}
              loading={loadingBranches}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={selectedBranches.length === 0 ? "Search and select branches..." : ""}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: theme.colors.border.light,
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: theme.colors.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.colors.primary.main,
                      },
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                      background: theme.colors.primary.gradient,
                      color: theme.colors.text.inverse,
                      fontWeight: 500,
                    }}
                  />
                ))
              }
            />
            <small style={styles.hint}>
              {selectedBranches.length > 0 
                ? `Filtering by ${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''}`
                : 'Leave empty to show all branches'}
            </small>
          </div>

                <div>
            <label style={styles.label}>Counselling Round</label>
            <div style={styles.roundSelector}>
              {[1, 2, 3].map((round) => (
                <button
                  key={round}
                  type="button"
                  style={{
                    ...styles.roundButton,
                    ...(selectedRound === round ? styles.roundButtonActive : {}),
                  }}
                  onClick={() => setSelectedRound(round)}
                >
                  Round {round}
                </button>
              ))}
            </div>
          </div>

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Searching...' : 'Find Colleges'}
                </Button>
              </div>
        </form>
          </Card>
        </Container>
      </Section>

      {/* Results */}
      {loading && <LoadingSpinner message="Finding colleges for your rank..." />}
      
      {error && !loading && (
        <Section background="default" padding="md">
          <Container maxWidth="lg">
          <ErrorMessage message={error} />
          </Container>
        </Section>
      )}

      {!loading && !error && hasSearched && (
        <Section background="paper" padding="lg">
          <Container maxWidth="xl">
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              {colleges.length} {colleges.length === 1 ? 'College' : 'Colleges'} Found
            </h2>
            <p style={styles.resultsSubtitle}>
              Based on rank {parseInt(rank).toLocaleString()} in Round {selectedRound}
              {selectedBranches.length > 0 && (
                  <Badge variant="primary" gradient style={{ marginLeft: theme.spacing[3] }}>
                    Filtered by {selectedBranches.length} branch{selectedBranches.length > 1 ? 'es' : ''}
                  </Badge>
              )}
            </p>
          </div>

          {colleges.length === 0 ? (
            <div style={styles.emptyState}>
              <TrendingUp style={styles.emptyIcon} />
              <p style={styles.emptyText}>
                No colleges found for rank {parseInt(rank).toLocaleString()} in Round {selectedRound}
              </p>
              <p style={styles.emptyHint}>
                Try adjusting your rank or selecting a different round
              </p>
            </div>
          ) : (
              <Grid columns="auto" minItemWidth="350px" gap={6}>
                {colleges.map((college, index) => (
                  <div
                    key={`${college.college_code}-${college.branch_name}`}
                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}
                  >
                <CollegeCardModern
                  collegeCode={college.college_code}
                  collegeName={college.college_name}
                  branches={college.branch_name ? [college.branch_name] : []}
                  cutoffRank={college.cutoff_rank}
                />
                  </div>
              ))}
              </Grid>
          )}
          </Container>
        </Section>
      )}

      {/* Info Section */}
      {!hasSearched && (
        <Section background="mesh" padding="xl">
          <Container maxWidth="lg">
            <Grid columns={2} gap={6}>
              <Card variant="glass">
            <h3 style={styles.infoTitle}>How it works</h3>
            <ol style={styles.infoList}>
              <li>Enter your KCET rank</li>
              <li>Select the counselling round</li>
              <li>Get a list of colleges where you have a chance of admission</li>
              <li>View detailed cutoff information for each college</li>
            </ol>
              </Card>

              <Card variant="glass">
            <h3 style={styles.infoTitle}>Tips</h3>
            <ul style={styles.infoList}>
              <li>Check all three rounds for better options</li>
              <li>Consider colleges slightly above your rank as well</li>
              <li>Compare cutoffs across different branches</li>
              <li>Keep your preferences ready before counselling</li>
            </ul>
              </Card>
            </Grid>
          </Container>
        </Section>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[6],
  },
  label: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  hint: {
    display: 'block',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  roundSelector: {
    display: 'flex',
    gap: theme.spacing[3],
  },
  roundButton: {
    flex: 1,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    background: theme.colors.background.paper,
    color: theme.colors.text.secondary,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: theme.transitions.base,
  },
  roundButtonActive: {
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    borderColor: 'transparent',
    boxShadow: theme.shadows.glow,
  },
  resultsHeader: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing[8],
  },
  resultsTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing[3],
  },
  resultsSubtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: theme.spacing[2],
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: theme.spacing[12],
  },
  emptyIcon: {
    fontSize: '5rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  emptyHint: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  infoTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  infoList: {
    margin: 0,
    paddingLeft: theme.spacing[6],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
};

export default RankPredictor;
