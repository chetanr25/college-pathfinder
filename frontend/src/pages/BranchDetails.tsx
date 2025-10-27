import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, ArrowBack, School } from '@mui/icons-material';
import { collegeApi, type CollegeList } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
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
    return <ErrorMessage message={error} onRetry={fetchColleges} />;
  }

  const decodedBranchName = branchName ? decodeURIComponent(branchName) : '';

  return (
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={() => navigate('/branches')}>
            <ArrowBack />
            <span>Back to Branches</span>
          </button>
          
          <div style={styles.iconWrapper}>
            <Category style={styles.headerIcon} />
          </div>
          
          <h1 style={styles.title}>{decodedBranchName}</h1>
          <p style={styles.subtitle}>
            {colleges.length} colleges offering this branch
          </p>
        </div>
      </section>

      {/* Round Selector */}
      <section style={styles.roundSection}>
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
      </section>

      {/* Colleges Grid */}
      <section style={styles.collegesSection}>
        {colleges.length === 0 ? (
          <div style={styles.emptyState}>
            <School style={styles.emptyIcon} />
            <p style={styles.emptyText}>
              No colleges found offering {decodedBranchName} in Round {selectedRound}
            </p>
          </div>
        ) : (
          <div style={styles.collegesGrid}>
            {colleges.map((college) => (
              <CollegeCardModern
                key={college.college_code}
                collegeCode={college.college_code}
                collegeName={college.college_name}
                cutoffRank={college.cutoff_rank}
              />
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
    background: theme.colors.secondary.gradient,
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: theme.transitions.base,
    marginBottom: theme.spacing[6],
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
  roundSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  roundSelector: {
    display: 'flex',
    gap: theme.spacing[3],
    justifyContent: 'center',
  },
  roundButton: {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    background: theme.colors.background.paper,
    color: theme.colors.text.secondary,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
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
  collegesSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[12]}`,
  },
  collegesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing[6],
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

export default BranchDetails;
