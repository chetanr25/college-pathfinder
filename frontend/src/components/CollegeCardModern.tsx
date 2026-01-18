import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, TrendingUp, Category, ArrowForward } from '@mui/icons-material';
import { Card, IconBox, Badge } from './ui';
import theme from '../theme';

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
    <Card
      variant="elevated"
      hoverable
      glow
      gradient={theme.colors.primary.gradient}
      onClick={handleClick}
      padding={compact ? 4 : 5}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing[3] }}>
        <IconBox size="sm" gradient={theme.colors.primary.gradient}>
          <School style={{ fontSize: '1.25rem' }} />
        </IconBox>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={styles.collegeName} title={collegeName}>
            {collegeName}
          </h3>
          <p style={styles.collegeCode}>Code: {collegeCode}</p>
        </div>
      </div>

        {/* Stats */}
        <div style={styles.stats}>
          {branchCount !== undefined && (
          <div style={styles.statItem}>
            <Category style={styles.statIcon} />
            <span style={styles.statText}>{branchCount} Branches</span>
            </div>
          )}
          {cutoffRank && (
          <div style={styles.statItem}>
              <TrendingUp style={styles.statIcon} />
            <span style={styles.statText}>Cutoff: {cutoffRank.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Branch Tags */}
        {branches.length > 0 && !compact && (
          <div style={styles.branchTags}>
            {branches.slice(0, 3).map((branch, idx) => (
            <Badge key={idx} variant="primary" size="sm" gradient>
              {branch.length > 25 ? `${branch.slice(0, 25)}...` : branch}
            </Badge>
            ))}
            {branches.length > 3 && (
            <Badge variant="info" size="sm">
                +{branches.length - 3} more
            </Badge>
            )}
          </div>
        )}

      {/* View Details */}
      <div style={styles.footer}>
        <div style={styles.viewDetails}>
          <span>View Details</span>
          <ArrowForward style={{ fontSize: '1rem' }} />
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  collegeName: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: 1.35,
    marginBottom: theme.spacing[1],
  },
  collegeCode: {
    margin: 0,
    fontSize: '0.7rem',
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: '0.02em',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
    paddingTop: theme.spacing[3],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statIcon: {
    fontSize: '1.1rem',
    color: theme.colors.primary.main,
  },
  statText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  branchTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: theme.spacing[3],
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing[3],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  viewDetails: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    color: theme.colors.primary.main,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default CollegeCardModern;
