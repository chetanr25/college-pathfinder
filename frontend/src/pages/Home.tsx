import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  Category, 
  TrendingUp,
  SmartToy,
  ArrowForward,
  Psychology,
  AutoAwesome,
  InsightsOutlined
} from '@mui/icons-material';
import theme from '../theme';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Hero Section - Epic Landing */}
      <section style={styles.hero}>
        <div style={styles.heroBlob1} />
        <div style={styles.heroBlob2} />
        <div style={styles.heroContent}>
          <div style={styles.heroTextContainer}>
          <h1 style={styles.heroTitle}>
              Your Journey to
              <br />
              <span style={styles.heroTitleGradient}>Engineering Excellence</span>
          </h1>
          <p style={styles.heroSubtitle}>
              Navigate your college admissions with confidence. Get real-time cutoff predictions, 
              personalized AI guidance, and make the smartest college choice.
          </p>
            <div style={styles.heroActions}>
            <button 
                style={styles.heroPrimaryButton}
              onClick={() => navigate('/predictor')}
            >
                <TrendingUp style={{ fontSize: '1.5rem' }} />
                <span>Predict My College</span>
                <ArrowForward style={{ fontSize: '1.25rem' }} />
            </button>
            <button 
                style={styles.heroSecondaryButton}
                onClick={() => navigate('/ai-chat')}
            >
                <SmartToy style={{ fontSize: '1.5rem' }} />
                <span>Talk to AI Counselor</span>
            </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Counselor Feature - Main Highlight */}
      <section style={styles.aiSection}>
        <div style={styles.aiSectionInner}>
          <div style={styles.aiContent}>
            <div style={styles.aiIconWrapper}>
              <Psychology style={styles.aiIcon} />
              <div style={styles.aiIconGlow} />
            </div>
            <div style={styles.aiText}>
              <div style={styles.aiLabel}>Powered by Advanced AI</div>
              <h2 style={styles.aiTitle}>Meet Your Personal AI College Counselor</h2>
              <p style={styles.aiDescription}>
                Get instant, intelligent answers to all your college admission questions. Our AI counselor 
                analyzes thousands of college data points to provide personalized recommendations based on 
                your rank, preferences, and career goals.
              </p>
              <div style={styles.aiFeatures}>
                <div style={styles.aiFeatureItem}>
                  <AutoAwesome style={{ fontSize: '1.5rem', color: '#fbbf24' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>Smart Recommendations</div>
                    <div style={styles.aiFeatureDesc}>AI-powered college matches</div>
                  </div>
                </div>
                <div style={styles.aiFeatureItem}>
                  <InsightsOutlined style={{ fontSize: '1.5rem', color: '#60a5fa' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>Real-time Analysis</div>
                    <div style={styles.aiFeatureDesc}>Instant cutoff predictions</div>
                  </div>
                </div>
                <div style={styles.aiFeatureItem}>
                  <Psychology style={{ fontSize: '1.5rem', color: '#a78bfa' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>24/7 Available</div>
                    <div style={styles.aiFeatureDesc}>Always ready to help</div>
                  </div>
                </div>
              </div>
              <button 
                style={styles.aiCtaButton}
                onClick={() => navigate('/ai-chat')}
              >
                <SmartToy style={{ fontSize: '1.5rem' }} />
                <span>Start Chatting with AI Counselor</span>
                <ArrowForward style={{ fontSize: '1.25rem' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features - Large Cards */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Powerful Tools for Your Success</h2>
        <p style={styles.sectionSubtitle}>
              Everything you need to make informed decisions about your engineering career
        </p>
          </div>
        
        <div style={styles.featuresGrid}>
            {/* Rank Predictor Card */}
            <div 
              className="largeFeatureCard"
              style={{ ...styles.largeFeatureCard, ...styles.featureCard1 }}
              onClick={() => navigate('/predictor')}
            >
              <div className="featureCardGlow" style={styles.featureCardGlow} />
              <div style={styles.featureIconLarge}>
                <TrendingUp style={{ fontSize: '3rem' }} />
              </div>
              <h3 style={styles.featureCardTitle}>Rank Predictor</h3>
              <p style={styles.featureCardDescription}>
                Enter your rank and instantly discover which engineering colleges you can get into. 
                Our advanced algorithm analyzes cutoff trends across all counselling rounds to give 
                you accurate predictions. Filter by branch, location, and college type to find your perfect match.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ Accurate Predictions</span>
                <span>✓ Multi-Round Analysis</span>
                <span>✓ Smart Filtering</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Predict Now</span>
                <ArrowForward />
              </div>
            </div>

            {/* Colleges Card */}
            <div 
              className="largeFeatureCard"
              style={{ ...styles.largeFeatureCard, ...styles.featureCard2 }}
              onClick={() => navigate('/colleges')}
            >
              <div className="featureCardGlow" style={styles.featureCardGlow} />
              <div style={styles.featureIconLarge}>
                <School style={{ fontSize: '3rem' }} />
              </div>
              <h3 style={styles.featureCardTitle}>Explore 200+ Colleges</h3>
              <p style={styles.featureCardDescription}>
                Browse through comprehensive information about 200+ engineering colleges in Karnataka. 
                View detailed cutoff ranks for every branch, compare colleges side-by-side, and discover 
                hidden gems that match your profile. Get insights into placement records and campus facilities.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ Complete Database</span>
                <span>✓ Branch-wise Details</span>
                <span>✓ Easy Comparison</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Browse Colleges</span>
                <ArrowForward />
              </div>
            </div>

            {/* Branches Card */}
            <div 
              className="largeFeatureCard"
              style={{ ...styles.largeFeatureCard, ...styles.featureCard3 }}
              onClick={() => navigate('/branches')}
            >
              <div className="featureCardGlow" style={styles.featureCardGlow} />
              <div style={styles.featureIconLarge}>
                <Category style={{ fontSize: '3rem' }} />
              </div>
              <h3 style={styles.featureCardTitle}>50+ Engineering Branches</h3>
              <p style={styles.featureCardDescription}>
                Explore diverse engineering branches from Computer Science to Emerging Technologies. 
                Understand career prospects, industry demand, and salary trends for each branch. 
                Find colleges offering your preferred specialization and compare admission cutoffs.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ Complete Guide</span>
                <span>✓ Career Insights</span>
                <span>✓ College Lists</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Explore Branches</span>
                <ArrowForward />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={styles.whySection}>
        <div style={styles.whyContainer}>
          <h2 style={styles.whySectionTitle}>Why Students Trust Us</h2>
          <div style={styles.whyGrid}>
            <div className="whyCard" style={styles.whyCard}>
              <div style={styles.whyNumber}>01</div>
              <h3 style={styles.whyTitle}>100% Accurate Data</h3>
              <p style={styles.whyDesc}>
                Official cutoff data from reliable sources. Updated regularly 
                to ensure you always have the most accurate information.
              </p>
            </div>
            <div className="whyCard" style={styles.whyCard}>
              <div style={styles.whyNumber}>02</div>
              <h3 style={styles.whyTitle}>AI-Powered Insights</h3>
              <p style={styles.whyDesc}>
                Advanced machine learning algorithms analyze patterns and trends to 
                provide intelligent recommendations tailored to your profile.
              </p>
            </div>
            <div className="whyCard" style={styles.whyCard}>
              <div style={styles.whyNumber}>03</div>
              <h3 style={styles.whyTitle}>Easy to Use</h3>
              <p style={styles.whyDesc}>
                Clean, intuitive interface designed for students. Find what you need 
                in seconds without any technical knowledge.
              </p>
            </div>
            <div className="whyCard" style={styles.whyCard}>
              <div style={styles.whyNumber}>04</div>
              <h3 style={styles.whyTitle}>Always Free</h3>
              <p style={styles.whyDesc}>
                All features are completely free. No hidden charges, no premium plans. 
                We believe every student deserves access to quality guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Find Your Perfect College?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of students who found their dream engineering college with our help
          </p>
          <button 
            style={styles.ctaButton}
            onClick={() => navigate('/predictor')}
          >
            <TrendingUp style={{ fontSize: '1.5rem' }} />
            <span>Get Started - It's Free</span>
            <ArrowForward style={{ fontSize: '1.25rem' }} />
          </button>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  
  // Hero Section
  hero: {
    position: 'relative' as const,
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflow: 'hidden',
    padding: '80px 24px',
  },
  heroBlob1: {
    position: 'absolute' as const,
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float 20s ease-in-out infinite',
  },
  heroBlob2: {
    position: 'absolute' as const,
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float 25s ease-in-out infinite reverse',
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1200px',
    width: '100%',
  },
  heroTextContainer: {
    textAlign: 'center' as const,
  },
  heroTitle: {
    fontSize: '4.5rem',
    fontWeight: 800,
    color: 'white',
    margin: 0,
    marginBottom: '24px',
    lineHeight: 1.1,
    fontFamily: theme.typography.fontFamily.heading,
  },
  heroTitleGradient: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '800px',
    margin: '0 auto 48px',
    lineHeight: 1.6,
  },
  heroActions: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  heroPrimaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 40px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.125rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  heroSecondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 40px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '16px',
    fontSize: '1.125rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
  },

  // AI Counselor Section
  aiSection: {
    background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
    padding: '120px 24px',
    position: 'relative' as const,
  },
  aiSectionInner: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  aiContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '80px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: '32px',
    padding: '80px',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  aiIconWrapper: {
    position: 'relative' as const,
    flexShrink: 0,
  },
  aiIcon: {
    fontSize: '160px',
    color: '#667eea',
    position: 'relative' as const,
    zIndex: 2,
  },
  aiIconGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
    filter: 'blur(40px)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  aiText: {
    flex: 1,
  },
  aiLabel: {
    display: 'inline-block',
    padding: '8px 20px',
    background: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '24px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  aiTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    color: 'white',
    margin: '0 0 24px 0',
    lineHeight: 1.2,
  },
  aiDescription: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.8,
    marginBottom: '48px',
  },
  aiFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  aiFeatureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  aiFeatureTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '4px',
  },
  aiFeatureDesc: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
  },
  aiCtaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.125rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
  },

  // Features Section
  featuresSection: {
    background: '#0a0a0f',
    padding: '120px 24px',
  },
  featuresContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '80px',
  },
  sectionTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'white',
    margin: '0 0 24px 0',
    lineHeight: 1.2,
  },
  sectionSubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: '700px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '40px',
  },
  largeFeatureCard: {
    position: 'relative' as const,
    padding: '48px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  featureCard1: {
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
  },
  featureCard2: {
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
  },
  featureCard3: {
    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
  },
  featureCardGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none' as const,
  },
  featureIconLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    color: 'white',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
  },
  featureCardTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 20px 0',
  },
  featureCardDescription: {
    fontSize: '1.125rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.8,
    marginBottom: '32px',
  },
  featureCardMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '32px',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
  },
  featureCardAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#667eea',
    fontSize: '1.125rem',
    fontWeight: 600,
  },

  // Why Section
  whySection: {
    background: '#1a1a2e',
    padding: '120px 24px',
  },
  whyContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  whySectionTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'white',
    textAlign: 'center' as const,
    margin: '0 0 80px 0',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
  },
  whyCard: {
    padding: '40px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  },
  whyNumber: {
    fontSize: '3rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '24px',
  },
  whyTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 16px 0',
  },
  whyDesc: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.8,
    margin: 0,
  },

  // CTA Section
  ctaSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '120px 24px',
  },
  ctaContent: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'white',
    margin: '0 0 24px 0',
    lineHeight: 1.2,
  },
  ctaSubtitle: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '48px',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 48px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
};

export default Home;
