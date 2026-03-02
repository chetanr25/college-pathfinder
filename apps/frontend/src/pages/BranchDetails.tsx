import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, ArrowBack, School } from '@mui/icons-material';
import { collegeApi, type CollegeList } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Grid, Button, Card, Badge } from '../components/ui';
import theme from '../theme';

const BranchDetails: React.FC = () => {
  const { branchName } = useParams<{ branchName: string }>();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<CollegeList['colleges']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState(1);

  const fetchColleges = async () => {
    if (!branchName) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await collegeApi.getCollegesByBranch(
        decodeURIComponent(branchName),
        selectedRound
      );
      setColleges(data.colleges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [branchName, selectedRound]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading colleges..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchColleges} fullScreen />;
  }

  const decodedBranchName = branchName ? decodeURIComponent(branchName) : '';

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <Hero
        icon={<Category />}
        title={decodedBranchName}
        subtitle={`${colleges.length} colleges offering this branch`}
        size="md"
        background={theme.colors.secondary.gradient}
        actions={
          <Button
            variant="outline"
            size="md"
            icon={<ArrowBack />}
            onClick={() => navigate('/branches')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderColor: 'rgba(255, 255, 255, 0.5)', 
              color: '#fff' 
            }}
          >
            Back to Branches
          </Button>
        }
      />

      {/* Round Selector */}
      <Section background="paper" padding="md">
        <Container maxWidth="md">
          <Card variant="elevated" padding={4}>
            <div style={styles.roundSelectorWrapper}>
              <label style={styles.roundLabel}>Select Counselling Round:</label>
        <div style={styles.roundSelector}>
          {[1, 2, 3].map((round) => (
            <button
              key={round}
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
          </Card>
        </Container>
      </Section>

      {/* Colleges Grid */}
      <Section background="default" padding="lg">
        <Container maxWidth="xl">
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              Colleges Offering {decodedBranchName}
            </h2>
            <Badge variant="primary" gradient size="lg">
              Round {selectedRound}
            </Badge>
          </div>

        {colleges.length === 0 ? (
          <div style={styles.emptyState}>
            <School style={styles.emptyIcon} />
            <p style={styles.emptyText}>
              No colleges found offering {decodedBranchName} in Round {selectedRound}
            </p>
              <p style={styles.emptyHint}>
                Try selecting a different round
              </p>
          </div>
        ) : (
            <Grid columns="auto" minItemWidth="320px" gap={5}>
              {colleges.map((college, index) => (
                <div
                  key={college.college_code}
                  style={{ animation: `fadeInUp 0.5s ease-out ${Math.min(index * 0.03, 0.3)}s both` }}
                >
              <CollegeCardModern
                collegeCode={college.college_code}
                collegeName={college.college_name}
                cutoffRank={college.cutoff_rank}
              />
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
  roundSelectorWrapper: {
    textAlign: 'center' as const,
  },
  roundLabel: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  roundSelector: {
    display: 'flex',
    gap: theme.spacing[2],
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  roundButton: {
    flex: 1,
    maxWidth: '120px',
    minWidth: '90px',
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    background: theme.colors.background.paper,
    color: theme.colors.text.secondary,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  roundButtonActive: {
    background: theme.colors.secondary.gradient,
    color: theme.colors.text.inverse,
    borderColor: 'transparent',
    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
    flexWrap: 'wrap' as const,
  },
  resultsTitle: {
    margin: 0,
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    fontWeight: theme.typography.fontWeight.bold,
    background: theme.colors.secondary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
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

export default BranchDetails;
