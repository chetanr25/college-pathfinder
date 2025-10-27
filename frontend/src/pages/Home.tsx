import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  Category, 
  Search, 
  TrendingUp,
  Speed,
  CheckCircle 
} from '@mui/icons-material';
import theme from '../theme';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <School />,
      title: 'Browse Colleges',
      description: 'Explore all colleges offering engineering programs',
      action: () => navigate('/colleges'),
      gradient: theme.colors.primary.gradient,
    },
    {
      icon: <Category />,
      title: 'View Branches',
      description: 'Check available engineering branches and specializations',
      action: () => navigate('/branches'),
      gradient: theme.colors.secondary.gradient,
    },
    {
      icon: <Search />,
      title: 'Advanced Search',
      description: 'Filter colleges by rank, branch, and counseling round',
      action: () => navigate('/search'),
      gradient: theme.colors.accent.gradient,
    },
    {
      icon: <TrendingUp />,
      title: 'Rank Predictor',
      description: 'Find colleges accessible with your KCET rank',
      action: () => navigate('/predictor'),
      gradient: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
    },
  ];

  const stats = [
    { value: '200+', label: 'Colleges', icon: <School /> },
    { value: '50+', label: 'Branches', icon: <Category /> },
    { value: '3', label: 'Rounds', icon: <CheckCircle /> },
    { value: 'Real-time', label: 'Data', icon: <Speed /> },
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Find Your Perfect Engineering College
          </h1>
          <p style={styles.heroSubtitle}>
            Predict your college admission chances with KCET 2024 cutoff data. 
            Make informed decisions for your engineering career.
          </p>
          <div style={styles.heroButtons}>
            <button 
              style={styles.primaryButton}
              onClick={() => navigate('/predictor')}
            >
              <TrendingUp style={styles.buttonIcon} />
              Check My Rank
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => navigate('/colleges')}
            >
              <School style={styles.buttonIcon} />
              Browse Colleges
            </button>
          </div>
        </div>
        
        {/* Decorative gradient blob */}
        <div style={styles.heroBlob}></div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Explore Our Features</h2>
        <p style={styles.sectionSubtitle}>
          Everything you need to make the right college choice
        </p>
        
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onClick={feature.action}
            >
              <div style={{ ...styles.featureIcon, background: feature.gradient }}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
              <button style={styles.featureButton}>
                Explore →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Find Your College?</h2>
          <p style={styles.ctaSubtitle}>
            Start your journey by checking which colleges you can get with your rank
          </p>
          <button 
            style={styles.ctaButton}
            onClick={() => navigate('/predictor')}
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
  },
  hero: {
    position: 'relative' as const,
    padding: `${theme.spacing[20]} ${theme.spacing[6]}`,
    background: theme.colors.background.mesh,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute' as const,
    top: '-50%',
    right: '-20%',
    width: '800px',
    height: '800px',
    borderRadius: '50%',
    background: theme.colors.primary.gradient,
    opacity: 0.1,
    filter: 'blur(100px)',
    pointerEvents: 'none' as const,
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
    position: 'relative' as const,
    zIndex: 1,
  },
  heroTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    fontFamily: theme.typography.fontFamily.heading,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing[6],
    lineHeight: theme.typography.lineHeight.tight,
  },
  heroSubtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[8],
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  heroButtons: {
    display: 'flex',
    gap: theme.spacing[4],
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.base,
    boxShadow: theme.shadows.lg,
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
    background: theme.colors.background.paper,
    color: theme.colors.primary.main,
    border: `2px solid ${theme.colors.primary.main}`,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.base,
  },
  buttonIcon: {
    fontSize: '1.5rem',
  },
  statsSection: {
    padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
    background: theme.colors.background.paper,
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[6],
  },
  statCard: {
    textAlign: 'center' as const,
    padding: theme.spacing[6],
  },
  statIcon: {
    fontSize: '2.5rem',
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[3],
  },
  statValue: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing[2],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  featuresSection: {
    padding: `${theme.spacing[16]} ${theme.spacing[6]}`,
    background: theme.colors.background.default,
  },
  sectionTitle: {
    margin: 0,
    textAlign: 'center' as const,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  sectionSubtitle: {
    margin: 0,
    textAlign: 'center' as const,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[12],
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing[6],
  },
  featureCard: {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[8],
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.border.light}`,
    cursor: 'pointer',
    transition: theme.transitions.base,
    textAlign: 'center' as const,
  },
  featureIcon: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.xl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[5],
    fontSize: '2.5rem',
    color: theme.colors.text.inverse,
    boxShadow: theme.shadows.lg,
  },
  featureTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  featureDescription: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[5],
  },
  featureButton: {
    background: 'transparent',
    color: theme.colors.primary.main,
    border: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.base,
  },
  ctaSection: {
    padding: `${theme.spacing[16]} ${theme.spacing[6]}`,
    background: theme.colors.primary.gradient,
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[4],
  },
  ctaSubtitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: theme.spacing[8],
  },
  ctaButton: {
    padding: `${theme.spacing[4]} ${theme.spacing[10]}`,
    background: theme.colors.background.paper,
    color: theme.colors.primary.main,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    cursor: 'pointer',
    transition: theme.transitions.base,
    boxShadow: theme.shadows.xl,
  },
};

export default Home;
