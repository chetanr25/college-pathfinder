import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, ArrowForward } from '@mui/icons-material';
import { Card, IconBox } from './ui';
import theme from '../theme';

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

  const gradient = getGradient(branchName);

  return (
    <Card
      variant="elevated"
      hoverable
      glow
      gradient={gradient}
      onClick={handleClick}
      padding={5}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing[3] }}>
        <IconBox size="sm" gradient={gradient}>
          <Category style={{ fontSize: '1.25rem' }} />
        </IconBox>

        <div style={styles.content}>
          <h3 style={styles.branchName} title={branchName}>
            {branchName}
          </h3>
          {description && (
            <p style={styles.description} title={description}>
              {description}
            </p>
          )}
          {collegeCount !== undefined && (
            <p style={styles.collegeCount}>
              {collegeCount} {collegeCount === 1 ? 'college' : 'colleges'} available
            </p>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.viewDetails}>
          <span>View Colleges</span>
          <ArrowForward style={{ fontSize: '1rem' }} />
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  branchName: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.heading,
    lineHeight: 1.35,
    marginBottom: theme.spacing[1],
  },
  description: {
    margin: 0,
    fontSize: theme.typography.fontSize.xs,
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
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
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
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default BranchCard;
