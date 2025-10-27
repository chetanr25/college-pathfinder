import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, ArrowForward } from '@mui/icons-material';
import theme, { cardStyles, hoverCardEffect } from '../theme';

interface BranchCardProps {
  branchName: string;
  collegeCount?: number;
  description?: string;
}

const BranchCard: React.FC<BranchCardProps> = ({
  branchName,
  collegeCount,
  description,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/branch/${encodeURIComponent(branchName)}`);
  };

  // Generate a gradient based on branch name hash
  const getGradient = (name: string) => {
    const gradients = [
      theme.colors.primary.gradient,
      theme.colors.secondary.gradient,
      theme.colors.accent.gradient,
      'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
      'linear-gradient(135deg, #FFD3A5 0%, #FD6585 100%)',
      'linear-gradient(135deg, #C471F5 0%, #FA71CD 100%)',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <div
      style={{
        ...cardStyles,
        ...styles.card,
      }}
      onClick={handleClick}
    >
      {/* Icon with dynamic gradient */}
      <div style={{ ...styles.iconWrapper, background: getGradient(branchName) }}>
        <Category style={styles.icon} />
      </div>

      {/* Branch Info */}
      <div style={styles.content}>
        <h3 style={styles.branchName} title={branchName}>{branchName}</h3>
        {description && <p style={styles.description} title={description}>{description}</p>}
        {collegeCount !== undefined && (
          <p style={styles.collegeCount}>
            {collegeCount} {collegeCount === 1 ? 'college' : 'colleges'} available
          </p>
        )}
      </div>

      {/* Arrow Icon */}
      <div style={styles.arrowWrapper}>
        <ArrowForward style={styles.arrow} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[5],
    minWidth: 0, // Important for text truncation in flex items
    ...hoverCardEffect,
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: theme.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: theme.shadows.md,
  },
  icon: {
    fontSize: '1.75rem',
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    minWidth: 0, // Important for text truncation in flex items
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  branchName: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  description: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  collegeCount: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
  },
  arrowWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.full,
    background: theme.colors.neutral[100],
    transition: theme.transitions.base,
  },
  arrow: {
    fontSize: '1.25rem',
    color: theme.colors.text.secondary,
  },
};

export default BranchCard;
