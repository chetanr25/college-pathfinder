import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { School, ArrowBack } from '@mui/icons-material';
import { collegeApi, type CollegeBranches } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
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
    return <ErrorMessage message={error} onRetry={fetchCollegeDetails} />;
  }

  if (!collegeData) {
    return <ErrorMessage message="College not found" />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={() => navigate('/colleges')}>
            <ArrowBack />
            <span>Back to Colleges</span>
          </button>
          
          <div style={styles.iconWrapper}>
            <School style={styles.headerIcon} />
          </div>
          
          <h1 style={styles.title}>{collegeData.college_name}</h1>
          <p style={styles.collegeCode}>College Code: {collegeCode}</p>
          <p style={styles.subtitle}>
            {collegeData.branches.length} branches available
          </p>
        </div>
      </section>

      {/* Branches Table */}
      <section style={styles.branchesSection}>
        <h2 style={styles.sectionTitle}>Available Branches & Cutoff Ranks</h2>
        
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Branch Name</th>
                <th style={styles.tableHeader}>Round 1</th>
                <th style={styles.tableHeader}>Round 2</th>
                <th style={styles.tableHeader}>Round 3</th>
              </tr>
            </thead>
            <tbody>
              {collegeData.branches.map((branch, index) => (
                <tr
                  key={index}
                  style={{
                    ...styles.tableRow,
                    ...(index % 2 === 0 ? styles.tableRowEven : {}),
                  }}
                >
                  <td style={styles.tableCell}>
                    <strong>{branch.branch_name}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.rankBadge}>
                      {branch.cutoff_ranks?.round1?.toLocaleString() || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.rankBadge}>
                      {branch.cutoff_ranks?.round2?.toLocaleString() || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.rankBadge}>
                      {branch.cutoff_ranks?.round3?.toLocaleString() || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  },
  collegeCode: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    fontFamily: theme.typography.fontFamily.mono,
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  branchesSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[12]}`,
  },
  sectionTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
    textAlign: 'center' as const,
  },
  tableContainer: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.border.light}`,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    background: theme.colors.primary.gradient,
  },
  tableHeader: {
    padding: theme.spacing[4],
    textAlign: 'left' as const,
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableRow: {
    transition: theme.transitions.fast,
  },
  tableRowEven: {
    background: theme.colors.neutral[50],
  },
  tableCell: {
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  rankBadge: {
    display: 'inline-block',
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    background: theme.colors.info.bg,
    color: theme.colors.info.dark,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.mono,
  },
};

export default CollegeDetails;
