import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, TrendingUp, LocationOn } from '@mui/icons-material';
import theme, { cardStyles, hoverCardEffect } from '../theme';

interface CollegeCardProps {
  collegeCode: string;
  collegeName: string;
  branchCount?: number;
  branches?: string[];
  cutoffRank?: number;
  compact?: boolean;
}

const CollegeCardModern: React.FC<CollegeCardProps> = ({
  collegeCode,
  collegeName,
  branchCount,
  branches = [],
  cutoffRank,
  compact = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/college/${collegeCode}`);
  };

  return (
    <div
      style={{
        ...cardStyles,
        ...styles.card,
        ...(compact ? styles.cardCompact : {}),
      }}
      onClick={handleClick}
    >
      {/* College Icon */}
      <div style={styles.iconWrapper}>
        <School style={styles.icon} />
      </div>

      {/* College Info */}
      <div style={styles.content}>
        <h3 style={styles.collegeName} title={collegeName}>{collegeName}</h3>
        <p style={styles.collegeCode} title={`Code: ${collegeCode}`}>Code: {collegeCode}</p>

        {/* Stats */}
        <div style={styles.stats}>
          {branchCount !== undefined && (
            <div style={styles.stat}>
              <LocationOn style={styles.statIcon} />
              <span>{branchCount} Branches</span>
            </div>
          )}
          {cutoffRank && (
            <div style={styles.stat}>
              <TrendingUp style={styles.statIcon} />
              <span>Cutoff: {cutoffRank.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Branch Tags */}
        {branches.length > 0 && !compact && (
          <div style={styles.branchTags}>
            {branches.slice(0, 3).map((branch, idx) => (
              <span key={idx} style={styles.branchTag} title={branch}>
                {branch}
              </span>
            ))}
            {branches.length > 3 && (
              <span style={styles.branchTagMore}>
                +{branches.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* View Details Button */}
      <div style={styles.footer}>
        <button style={styles.viewButton}>
          View Details
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
    padding: theme.spacing[6],
    minWidth: 0, // Important for text truncation in flex items
    ...hoverCardEffect,
  },
  cardCompact: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: theme.borderRadius.lg,
    background: theme.colors.primary.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows.glow,
  },
  icon: {
    fontSize: '2rem',
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
    minWidth: 0, // Important for text truncation in flex items
  },
  collegeName: {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4',
  },
  collegeCode: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  stats: {
    display: 'flex',
    gap: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statIcon: {
    fontSize: '1rem',
    color: theme.colors.primary.main,
  },
  branchTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  branchTag: {
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '150px',
  },
  branchTagMore: {
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    background: theme.colors.neutral[200],
    color: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    borderTop: `1px solid ${theme.colors.border.light}`,
    paddingTop: theme.spacing[4],
    marginTop: 'auto',
  },
  viewButton: {
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.base,
    boxShadow: theme.shadows.sm,
  },
};

export default CollegeCardModern;
