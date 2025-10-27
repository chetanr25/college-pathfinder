import React, { useState } from 'react';
import { TrendingUp } from '@mui/icons-material';
import { collegeApi, type CollegeList } from '../services/api';
import CollegeCardModern from '../components/CollegeCardModern';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import theme from '../theme';

const RankPredictor: React.FC = () => {
  const [rank, setRank] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState(1);
  const [limit, setLimit] = useState<string>('10');
  const [colleges, setColleges] = useState<CollegeList['colleges']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

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
      const data = await collegeApi.getCollegesByRank(rankNum, selectedRound, limitNum, 'asc');
      setColleges(data.colleges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict colleges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconWrapper}>
            <TrendingUp style={styles.headerIcon} />
          </div>
          <h1 style={styles.title}>KCET Rank Predictor</h1>
          <p style={styles.subtitle}>
            Enter your KCET rank to find colleges you can get admitted to
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your KCET Rank</label>
            <input
              type="number"
              placeholder="e.g., 5000"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              style={styles.input}
              min="1"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Number of Colleges</label>
            <input
              type="number"
              placeholder="e.g., 10"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              style={styles.input}
              min="1"
              max="500"
              required
            />
            <small style={styles.hint}>Show top 1-500 colleges (default: 10)</small>
          </div>

          <div style={styles.inputGroup}>
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

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Searching...' : 'Find Colleges'}
          </button>
        </form>
      </section>

      {/* Results */}
      {loading && <LoadingSpinner message="Finding colleges for your rank..." />}
      
      {error && !loading && (
        <div style={styles.errorSection}>
          <ErrorMessage message={error} />
        </div>
      )}

      {!loading && !error && hasSearched && (
        <section style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              {colleges.length} {colleges.length === 1 ? 'College' : 'Colleges'} Found
            </h2>
            <p style={styles.resultsSubtitle}>
              Based on rank {parseInt(rank).toLocaleString()} in Round {selectedRound}
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
            <div style={styles.collegesGrid}>
              {colleges.map((college) => (
                <CollegeCardModern
                  key={`${college.college_code}-${college.branch_name}`}
                  collegeCode={college.college_code}
                  collegeName={college.college_name}
                  branches={college.branch_name ? [college.branch_name] : []}
                  cutoffRank={college.cutoff_rank}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Info Section */}
      {!hasSearched && (
        <section style={styles.infoSection}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>How it works</h3>
            <ol style={styles.infoList}>
              <li>Enter your KCET rank</li>
              <li>Select the counselling round</li>
              <li>Get a list of colleges where you have a chance of admission</li>
              <li>View detailed cutoff information for each college</li>
            </ol>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Tips</h3>
            <ul style={styles.infoList}>
              <li>Check all three rounds for better options</li>
              <li>Consider colleges slightly above your rank as well</li>
              <li>Compare cutoffs across different branches</li>
              <li>Keep your preferences ready before counselling</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.background.default,
  },
  header: {
    background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    marginBottom: theme.spacing[8],
  },
  headerContent: {
    maxWidth: '800px',
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
    maxWidth: '600px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[8]}`,
  },
  form: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[8],
    boxShadow: theme.shadows.xl,
    border: `1px solid ${theme.colors.border.light}`,
  },
  inputGroup: {
    marginBottom: theme.spacing[6],
  },
  label: {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  input: {
    width: '100%',
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.lg,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: theme.transitions.base,
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
    padding: theme.spacing[3],
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
  submitButton: {
    width: '100%',
    padding: theme.spacing[4],
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    cursor: 'pointer',
    transition: theme.transitions.base,
    boxShadow: theme.shadows.lg,
  },
  errorSection: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]}`,
  },
  resultsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[6]} ${theme.spacing[12]}`,
  },
  resultsHeader: {
    textAlign: 'center' as const,
    marginBottom: theme.spacing[8],
  },
  resultsTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  resultsSubtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  collegesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing[6],
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: theme.spacing[12],
  },
  emptyIcon: {
    fontSize: '4rem',
    color: theme.colors.neutral[300],
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  emptyHint: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  infoSection: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: `${theme.spacing[8]} ${theme.spacing[6]} ${theme.spacing[12]}`,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing[6],
  },
  infoCard: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.border.light}`,
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
