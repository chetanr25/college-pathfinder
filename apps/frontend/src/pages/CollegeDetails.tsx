import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { School, ArrowBack, Category } from '@mui/icons-material';
import { collegeApi, type CollegeBranches } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Hero, Container, Section, Button, Card, Badge, Grid, StatCard } from '../components/ui';
import theme from '../theme';

const CollegeDetails: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();
  const [collegeData, setCollegeData] = useState<CollegeBranches | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchCollegeDetails = async () => {
    if (!collegeCode) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await collegeApi.getCollegeBranches(collegeCode);
      setCollegeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load college details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeDetails();
  }, [collegeCode]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading college details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCollegeDetails} fullScreen />;
  }

  if (!collegeData) {
    return <ErrorMessage message="College not found" fullScreen />;
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <Hero
        icon={<School />}
        title={collegeData.college_name}
        subtitle={`College Code: ${collegeCode}`}
        size="md"
        background="gradient"
        actions={
          <Button
            variant="outline"
            size="md"
            icon={<ArrowBack />}
            onClick={() => navigate('/colleges')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderColor: 'rgba(255, 255, 255, 0.5)', 
              color: '#fff' 
            }}
          >
            Back to Colleges
          </Button>
        }
      />

      {/* Stats Section */}
      <Section background="paper" padding="md">
        <Container maxWidth="xl">
          <Grid columns={3} gap={6}>
            <StatCard
              icon={<Category />}
              value={collegeData.branches.length}
              label="Branches Available"
              color={theme.colors.primary.main}
              gradient={theme.colors.primary.gradient}
            />
            <StatCard
              icon={<School />}
              value={collegeCode || 'N/A'}
              label="College Code"
              color={theme.colors.secondary.main}
              gradient={theme.colors.secondary.gradient}
            />
            <StatCard
              icon={<Category />}
              value="KCET 2024"
              label="Data Year"
              color={theme.colors.accent.main}
              gradient={theme.colors.accent.gradient}
            />
          </Grid>
        </Container>
      </Section>

      {/* Branches Table */}
      <Section background="default" padding="lg">
        <Container maxWidth="xl">
          <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Available Branches & Cutoff Ranks</h2>
            <p style={styles.sectionSubtitle}>
              Cutoff ranks for all counseling rounds
            </p>
          </div>
        
          <Card variant="elevated" padding={0} style={{ overflow: 'hidden' }}>
            <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.tableHeader, width: '40%' }}>Branch Name</th>
                    <th style={{ ...styles.tableHeader, width: '20%', textAlign: 'center' }}>Round 1</th>
                    <th style={{ ...styles.tableHeader, width: '20%', textAlign: 'center' }}>Round 2</th>
                    <th style={{ ...styles.tableHeader, width: '20%', textAlign: 'center' }}>Round 3</th>
              </tr>
            </thead>
            <tbody>
              {collegeData.branches.map((branch, index) => (
                <tr
                  key={index}
                  style={{
                    ...styles.tableRow,
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                      <td style={styles.tableCellBranch}>
                        <div style={styles.branchInfo}>
                          <Category style={styles.branchIcon} />
                    <strong>{branch.branch_name}</strong>
                        </div>
                  </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <Badge 
                          variant={branch.cutoff_ranks?.round1 ? 'primary' : 'info'} 
                          size="md"
                          gradient={!!branch.cutoff_ranks?.round1}
                        >
                      {branch.cutoff_ranks?.round1?.toLocaleString() || 'N/A'}
                        </Badge>
                  </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <Badge 
                          variant={branch.cutoff_ranks?.round2 ? 'primary' : 'info'} 
                          size="md"
                          gradient={!!branch.cutoff_ranks?.round2}
                        >
                      {branch.cutoff_ranks?.round2?.toLocaleString() || 'N/A'}
                        </Badge>
                  </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <Badge 
                          variant={branch.cutoff_ranks?.round3 ? 'primary' : 'info'} 
                          size="md"
                          gradient={!!branch.cutoff_ranks?.round3}
                        >
                      {branch.cutoff_ranks?.round3?.toLocaleString() || 'N/A'}
                        </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </Card>
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
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    margin: 0,
    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing[2],
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: theme.borderRadius.lg,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    minWidth: '600px',
  },
  tableHeaderRow: {
    background: theme.colors.primary.gradient,
  },
  tableHeader: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    textAlign: 'left' as const,
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  tableCellBranch: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  },
  tableCell: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  },
  branchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  branchIcon: {
    fontSize: '1.1rem',
    color: theme.colors.primary.main,
  },
};

export default CollegeDetails;
