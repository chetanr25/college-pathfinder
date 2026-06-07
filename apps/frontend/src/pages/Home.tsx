import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Category,
  TrendingUp,
  SmartToy,
  ArrowForward,
  Psychology,
  AutoAwesome,
  InsightsOutlined,
  EmojiEvents,
  Speed,
  StarRounded
} from '@mui/icons-material';
import theme from '../theme';
import SEO from '../components/SEO';

const KEYFRAMES = `
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(1deg); }
  66% { transform: translateY(-10px) rotate(-1deg); }
}
@keyframes floatReverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(15px) rotate(-1.5deg); }
  66% { transform: translateY(8px) rotate(1deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes floatCard1 {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-12px) translateX(4px); }
}
@keyframes floatCard2 {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(10px) translateX(-6px); }
}
@keyframes floatCard3 {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-8px) translateX(-4px); }
}
@keyframes orb1 {
  0%, 100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(40px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 50px) scale(0.95); }
  75% { transform: translate(60px, 20px) scale(1.05); }
}
@keyframes orb2 {
  0%, 100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(-60px, 40px) scale(1.15); }
  50% { transform: translate(30px, -50px) scale(0.9); }
  75% { transform: translate(-40px, -20px) scale(1.1); }
}
@keyframes orb3 {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(50px, 30px) scale(1.1); }
  66% { transform: translate(-30px, -40px) scale(0.95); }
}
@keyframes dotPulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.4; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6), 0 0 60px rgba(118, 75, 162, 0.3); }
}
@keyframes scanLine {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(400px); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.largeFeatureCard:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 30px 80px rgba(0,0,0,0.4) !important; }
.largeFeatureCard:hover .featureCardGlow { opacity: 1 !important; }
.largeFeatureCard:hover .featureCardAction { gap: 16px !important; color: #a78bfa !important; }
.whyCard:hover { transform: translateY(-4px); border-left-color: #a78bfa !important; background: rgba(255,255,255,0.08) !important; }
.heroPrimaryBtn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important; }
.heroSecondaryBtn:hover { background: rgba(255,255,255,0.25) !important; transform: translateY(-3px); }
.aiCtaBtn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 50px rgba(102,126,234,0.5) !important; }
.ctaMainBtn:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 24px 60px rgba(0,0,0,0.35) !important; }
.statBadge { transition: all 0.3s ease; }
.statBadge:hover { transform: scale(1.05) translateY(-3px); }
@media (max-width: 900px) {
  .heroInnerGrid { grid-template-columns: 1fr !important; text-align: center; }
  .heroRight { display: none !important; }
  .heroLeft { align-items: center; }
}
`;

const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 6,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? '#fbbf24' : p.id % 3 === 1 ? '#a78bfa' : '#60a5fa',
            animation: `dotPulse ${p.duration}s ${p.delay}s ease-in-out infinite`,
            opacity: 0.2,
          }}
        />
      ))}
    </div>
  );
};

const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <style>{KEYFRAMES}</style>
      <SEO />

      {/* ── HERO ── */}
      <section style={styles.hero}>
        {/* Background orbs */}
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.orb3} />

        {/* Dot grid */}
        <div style={styles.dotGrid} />

        {/* Particles */}
        <ParticleField />

        <div className="heroInnerGrid" style={styles.heroInner}>
          {/* LEFT: copy */}
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>
              <StarRounded style={{ fontSize: '0.9rem', color: '#fbbf24' }} />
              <span>KCET 2025 · 200+ Colleges · AI Powered</span>
            </div>

            <h1 style={styles.heroTitle}>
              Find Your{' '}
              <span style={styles.titleGradient}>Perfect</span>
              <br />
              Engineering{' '}
              <span style={styles.titleGlow}>College</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Enter your KCET rank and instantly discover which top Karnataka engineering
              colleges you qualify for powered by real 2025 cutoff data and AI guidance.
            </p>

            <div style={styles.heroActions}>
              <button
                className="heroPrimaryBtn"
                style={styles.heroPrimaryBtn}
                onClick={() => navigate('/predictor')}
              >
                <TrendingUp style={{ fontSize: '1.3rem' }} />
                <span>Find Colleges for My Rank</span>
                <ArrowForward style={{ fontSize: '1.1rem' }} />
              </button>
              <button
                className="heroSecondaryBtn"
                style={styles.heroSecondaryBtn}
                onClick={() => navigate('/ai-chat')}
              >
                <SmartToy style={{ fontSize: '1.3rem' }} />
                <span>Talk to AI Counselor</span>
              </button>
            </div>

            <div style={styles.trustRow}>
              <span style={styles.trustItem}>✓ Free forever</span>
              <span style={styles.trustDot} />
              <span style={styles.trustItem}>✓ No sign-up needed</span>
              <span style={styles.trustDot} />
              <span style={styles.trustItem}>✓ Real KCET data</span>
            </div>
          </div>

          {/* RIGHT: visual panel */}
          <div style={styles.heroRight}>
            {/* Main glass card */}
            <div style={styles.rankCard}>
              <div style={styles.scanLine} />
              <div style={styles.rankCardHeader}>
                <div style={styles.rankCardDot} />
                <div style={{ ...styles.rankCardDot, background: '#fbbf24' }} />
                <div style={{ ...styles.rankCardDot, background: '#34d399' }} />
                <span style={styles.rankCardLabel}>KCET Rank Predictor</span>
              </div>
              <div style={styles.rankInputRow}>
                <span style={styles.rankInputLabel}>Your KCET Rank</span>
                <div style={styles.rankInputField}>
                  <span style={styles.rankInputValue}>5,420</span>
                  <span style={styles.cursor}>|</span>
                </div>
              </div>
              <div style={styles.rankDivider} />
              <div style={styles.rankResultRow}>
                <EmojiEvents style={{ color: '#fbbf24', fontSize: '1.4rem' }} />
                <div>
                  <div style={styles.rankResultLabel}>You qualify for</div>
                  <div style={styles.rankResultValue}>47 colleges · 12 branches</div>
                </div>
              </div>
              <div style={styles.rankCollegeList}>
                {['RV College of Engineering', 'PES University', 'BMS College of Engineering', 'NITK Surathkal'].map((c, i) => (
                  <div key={c} style={{ ...styles.rankCollegeItem, animationDelay: `${i * 0.15}s` }}>
                    <div style={styles.rankCollegeDot} />
                    <span>{c}</span>
                    <span style={styles.rankCollegeTag}>{['CSE', 'ECE', 'ISE', 'CSE'][i]}</span>
                  </div>
                ))}
              </div>
              <div style={styles.rankCardFooter}>
                <Speed style={{ fontSize: '0.9rem', color: '#60a5fa' }} />
                <span>Live data · All 3 counselling rounds</span>
              </div>
            </div>

            {/* Floating stat badges */}
            <div className="statBadge" style={{ ...styles.statBadge, ...styles.badge1 }}>
              <div style={styles.badgeIcon}>🎓</div>
              <div>
                <div style={styles.badgeNum}>200+</div>
                <div style={styles.badgeLabel}>Colleges</div>
              </div>
            </div>
            <div className="statBadge" style={{ ...styles.statBadge, ...styles.badge2 }}>
              <div style={styles.badgeIcon}>🤖</div>
              <div>
                <div style={styles.badgeNum}>AI</div>
                <div style={styles.badgeLabel}>Counselor</div>
              </div>
            </div>
            <div className="statBadge" style={{ ...styles.statBadge, ...styles.badge3 }}>
              <div style={styles.badgeIcon}>⚡</div>
              <div>
                <div style={styles.badgeNum}>50+</div>
                <div style={styles.badgeLabel}>Branches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={styles.heroBottomFade} />
      </section>

      {/* ── STATS STRIP ── */}
      <section style={styles.statsStrip}>
        <div style={styles.statsInner}>
          {[
            { num: 200, suffix: '+', label: 'Engineering Colleges' },
            { num: 50, suffix: '+', label: 'Branches Available' },
            { num: 30000, suffix: '+', label: 'Cutoff Data Points' },
            { num: 3, suffix: '', label: 'Counselling Rounds' },
          ].map(({ num, suffix, label }) => (
            <div key={label} style={styles.statItem}>
              <div style={styles.statNum}>
                <AnimatedCounter end={num} suffix={suffix} />
              </div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI COUNSELOR ── */}
      <section style={styles.aiSection}>
        <div style={styles.aiSectionInner}>
          <div style={styles.aiContent}>
            <div style={styles.aiIconWrapper}>
              <Psychology style={styles.aiIcon} />
              <div style={styles.aiIconGlow} />
            </div>
            <div style={styles.aiText}>
              <div style={styles.aiLabel}>Powered by Google Gemini 2.5</div>
              <h2 style={styles.aiTitle}>Meet Your Personal AI College Counselor</h2>
              <p style={styles.aiDescription}>
                Ask anything about KCET cutoffs, compare colleges, get branch recommendations based on
                your rank, and request a personalized report emailed directly to you.
              </p>
              <div style={styles.aiFeatures}>
                <div style={styles.aiFeatureItem}>
                  <AutoAwesome style={{ fontSize: '1.5rem', color: '#fbbf24' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>Smart Recommendations</div>
                    <div style={styles.aiFeatureDesc}>AI-powered college matches for your rank</div>
                  </div>
                </div>
                <div style={styles.aiFeatureItem}>
                  <InsightsOutlined style={{ fontSize: '1.5rem', color: '#60a5fa' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>KCET Data Lookup</div>
                    <div style={styles.aiFeatureDesc}>Queries the full KCET cutoff database</div>
                  </div>
                </div>
                <div style={styles.aiFeatureItem}>
                  <Psychology style={{ fontSize: '1.5rem', color: '#a78bfa' }} />
                  <div>
                    <div style={styles.aiFeatureTitle}>24/7 Available</div>
                    <div style={styles.aiFeatureDesc}>Always ready to help you decide</div>
                  </div>
                </div>
              </div>
              <button
                className="aiCtaBtn"
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

      {/* ── FEATURES ── */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Powerful Tools for Your Success</h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to make informed decisions about your engineering career
            </p>
          </div>

          <div style={styles.featuresGrid}>
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
                Enter your KCET rank and instantly see which engineering colleges you qualify for.
                Filter by branch and counselling round for exact results.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ Round 1, 2 & 3 data</span>
                <span>✓ Branch filter</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Predict Now</span>
                <ArrowForward />
              </div>
            </div>

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
                Browse 200+ engineering colleges in Karnataka with KCET cutoff data.
                View branch-wise cutoff ranks across all three counselling rounds.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ 200+ colleges</span>
                <span>✓ Branch-wise cutoffs</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Browse Colleges</span>
                <ArrowForward />
              </div>
            </div>

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
                Browse all engineering branches available in KCET. Select a branch to see
                which colleges offer it and what the admission cutoffs are.
              </p>
              <div style={styles.featureCardMeta}>
                <span>✓ 50+ branches</span>
                <span>✓ College lists per branch</span>
              </div>
              <div className="featureCardAction" style={styles.featureCardAction}>
                <span>Explore Branches</span>
                <ArrowForward />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={styles.whySection}>
        <div style={styles.whyContainer}>
          <h2 style={styles.whySectionTitle}>What You Get</h2>
          <div style={styles.whyGrid}>
            {[
              { num: '01', title: 'KCET Data', desc: 'Official KCET cutoff ranks across all three counselling rounds for 200+ engineering colleges in Karnataka.' },
              { num: '02', title: 'AI Counselor', desc: 'Ask anything rank-based recommendations, branch comparisons, admission chances, and personalized email reports.' },
              { num: '03', title: 'Easy to Use', desc: 'Clean, intuitive interface designed for students. Find what you need in seconds without any technical knowledge.' },
              { num: '04', title: 'Always Free', desc: 'All features are completely free. No hidden charges, no premium plans. Every student deserves quality guidance.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="whyCard" style={styles.whyCard}>
                <div style={styles.whyNumber}>{num}</div>
                <h3 style={styles.whyTitle}>{title}</h3>
                <p style={styles.whyDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaOrb1} />
        <div style={styles.ctaOrb2} />
        <div style={styles.ctaContent}>
          <div style={styles.ctaBadge}>🚀 Get Started in Seconds</div>
          <h2 style={styles.ctaTitle}>Ready to Find Your Perfect College?</h2>
          <p style={styles.ctaSubtitle}>
            Enter your rank and instantly see which colleges and branches you can get admitted to
          </p>
          <button
            className="ctaMainBtn"
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
    background: '#080810',
    paddingTop: 'var(--navbar-height, 72px)',
  },

  // ── Hero ──
  hero: {
    position: 'relative',
    minHeight: 'calc(100vh - var(--navbar-height, 72px))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #080810 0%, #0f0f20 50%, #0a0818 100%)',
    overflow: 'hidden',
    padding: '60px 24px 100px',
  },
  orb1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102,126,234,0.18) 0%, transparent 65%)',
    filter: 'blur(1px)',
    animation: 'orb1 22s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '5%',
    right: '5%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(118,75,162,0.2) 0%, transparent 65%)',
    filter: 'blur(1px)',
    animation: 'orb2 28s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%)',
    filter: 'blur(1px)',
    animation: 'orb3 18s ease-in-out infinite',
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1280px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: 'rgba(251,191,36,0.1)',
    border: '1px solid rgba(251,191,36,0.25)',
    borderRadius: '100px',
    color: '#fbbf24',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    marginBottom: '28px',
    width: 'fit-content',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
    fontWeight: 900,
    color: 'white',
    margin: '0 0 24px 0',
    lineHeight: 1.1,
    fontFamily: theme.typography.fontFamily.heading,
    letterSpacing: '-1px',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  titleGlow: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ef4444 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 40px 0',
    lineHeight: 1.75,
    maxWidth: '520px',
  },
  heroActions: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  heroPrimaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 8px 30px rgba(102,126,234,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
    animation: 'glow 3s ease-in-out infinite',
  },
  heroSecondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 28px',
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    backdropFilter: 'blur(10px)',
  },
  trustRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  trustItem: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
  },
  trustDot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'inline-block',
  },

  // Right panel
  heroRight: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '440px',
  },
  rankCard: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '28px',
    width: '100%',
    maxWidth: '380px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    animation: 'floatCard1 6s ease-in-out infinite',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.8), transparent)',
    animation: 'scanLine 4s linear infinite',
    pointerEvents: 'none',
  },
  rankCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '20px',
  },
  rankCardDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#ef4444',
  },
  rankCardLabel: {
    marginLeft: '8px',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  rankInputRow: {
    marginBottom: '16px',
  },
  rankInputLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '8px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  rankInputField: {
    background: 'rgba(102,126,234,0.1)',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  rankInputValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'white',
    fontFamily: 'monospace',
  },
  cursor: {
    fontSize: '1.5rem',
    color: '#667eea',
    fontWeight: 300,
    animation: 'blink 1s step-end infinite',
  },
  rankDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
    margin: '16px 0',
  },
  rankResultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    background: 'rgba(251,191,36,0.08)',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid rgba(251,191,36,0.15)',
  },
  rankResultLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  rankResultValue: {
    fontSize: '0.95rem',
    color: 'white',
    fontWeight: 700,
  },
  rankCollegeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  rankCollegeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
    animation: 'slideUp 0.5s ease both',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.8)',
  },
  rankCollegeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#667eea',
    flexShrink: 0,
  },
  rankCollegeTag: {
    marginLeft: 'auto',
    fontSize: '0.65rem',
    color: '#a78bfa',
    background: 'rgba(167,139,250,0.1)',
    padding: '2px 8px',
    borderRadius: '100px',
    fontWeight: 600,
  },
  rankCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 500,
  },

  // Floating badges
  statBadge: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    padding: '12px 16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    cursor: 'default',
  },
  badge1: {
    top: '30px',
    right: '-20px',
    animation: 'floatCard2 5s ease-in-out infinite',
  },
  badge2: {
    bottom: '80px',
    right: '-30px',
    animation: 'floatCard3 7s ease-in-out infinite',
  },
  badge3: {
    bottom: '20px',
    left: '-20px',
    animation: 'floatCard1 8s ease-in-out infinite 1s',
  },
  badgeIcon: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  badgeNum: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'white',
    lineHeight: 1,
  },
  badgeLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 500,
  },
  heroBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '120px',
    background: 'linear-gradient(to bottom, transparent, #080810)',
    pointerEvents: 'none',
  },

  // ── Stats Strip ──
  statsStrip: {
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '40px 24px',
  },
  statsInner: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '32px',
    textAlign: 'center',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
  },
  statNum: {
    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #667eea 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 500,
  },

  // ── AI Section ──
  aiSection: {
    background: 'linear-gradient(180deg, #080810 0%, #0f0f1e 100%)',
    padding: 'clamp(60px,10vw,100px) 24px',
    position: 'relative',
  },
  aiSectionInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  aiContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(30px,5vw,60px)',
    background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
    borderRadius: '28px',
    padding: 'clamp(30px,5vw,60px)',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
    flexWrap: 'wrap',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  aiIconWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  aiIcon: {
    fontSize: 'clamp(80px,12vw,130px)',
    color: '#667eea',
    position: 'relative',
    zIndex: 2,
    filter: 'drop-shadow(0 0 30px rgba(102,126,234,0.5))',
  } as React.CSSProperties,
  aiIconGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '180px',
    height: '180px',
    background: 'radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  aiText: {
    flex: 1,
    minWidth: '280px',
  },
  aiLabel: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(102,126,234,0.15)',
    borderRadius: '100px',
    color: '#a78bfa',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '1px solid rgba(167,139,250,0.2)',
  },
  aiTitle: {
    fontSize: 'clamp(1.5rem,4vw,2.5rem)',
    fontWeight: 800,
    color: 'white',
    margin: '0 0 20px 0',
    lineHeight: 1.2,
  },
  aiDescription: {
    fontSize: 'clamp(0.9rem,2vw,1.05rem)',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.8,
    marginBottom: '32px',
  },
  aiFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
    gap: '16px',
    marginBottom: '36px',
  },
  aiFeatureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  aiFeatureTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '3px',
  },
  aiFeatureDesc: {
    fontSize: '0.775rem',
    color: 'rgba(255,255,255,0.5)',
  },
  aiCtaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 8px 30px rgba(102,126,234,0.35)',
  },

  // ── Features ──
  featuresSection: {
    background: '#080810',
    padding: 'clamp(60px,10vw,100px) 24px',
  },
  featuresContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 'clamp(40px,7vw,70px)',
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem,5vw,2.75rem)',
    fontWeight: 800,
    color: 'white',
    margin: '0 0 16px 0',
    lineHeight: 1.25,
  },
  sectionSubtitle: {
    fontSize: 'clamp(0.9rem,2vw,1.05rem)',
    color: 'rgba(255,255,255,0.5)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.7,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
    gap: '24px',
  },
  largeFeatureCard: {
    position: 'relative',
    padding: 'clamp(24px,4vw,40px)',
    borderRadius: '22px',
    cursor: 'pointer',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  featureCard1: {
    background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.03) 100%)',
  },
  featureCard2: {
    background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(59,130,246,0.03) 100%)',
  },
  featureCard3: {
    background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(139,92,246,0.03) 100%)',
  },
  featureCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    background: 'radial-gradient(circle at top left, rgba(102,126,234,0.2) 0%, transparent 60%)',
    transition: 'opacity 0.35s ease',
    pointerEvents: 'none',
  },
  featureIconLarge: {
    width: 'clamp(60px,10vw,80px)',
    height: 'clamp(60px,10vw,80px)',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    color: 'white',
    boxShadow: '0 12px 40px rgba(102,126,234,0.35)',
  },
  featureCardTitle: {
    fontSize: 'clamp(1.2rem,3vw,1.5rem)',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 12px 0',
  },
  featureCardDescription: {
    fontSize: 'clamp(0.85rem,2vw,0.95rem)',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.75,
    marginBottom: '24px',
  },
  featureCardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '24px',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.4)',
  },
  featureCardAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#667eea',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'all 0.25s ease',
  },

  // ── Why ──
  whySection: {
    background: 'linear-gradient(180deg, #0f0f1e 0%, #0a0a14 100%)',
    padding: 'clamp(60px,10vw,100px) 24px',
  },
  whyContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  whySectionTitle: {
    fontSize: 'clamp(1.75rem,5vw,2.75rem)',
    fontWeight: 800,
    color: 'white',
    textAlign: 'center',
    margin: '0 0 clamp(40px,7vw,70px) 0',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))',
    gap: '24px',
  },
  whyCard: {
    padding: 'clamp(24px,4vw,36px)',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.07)',
    borderLeft: '3px solid #667eea',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  whyNumber: {
    fontSize: 'clamp(2rem,4vw,2.5rem)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px',
    lineHeight: 1,
  },
  whyTitle: {
    fontSize: 'clamp(1.05rem,2.5vw,1.25rem)',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 10px 0',
  },
  whyDesc: {
    fontSize: 'clamp(0.85rem,2vw,0.925rem)',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.75,
    margin: 0,
  },

  // ── CTA ──
  ctaSection: {
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    padding: 'clamp(80px,12vw,120px) 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaOrb1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102,126,234,0.25) 0%, transparent 65%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  ctaOrb2: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 65%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  ctaBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '100px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem,5vw,3rem)',
    fontWeight: 900,
    color: 'white',
    margin: '0 0 20px 0',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 'clamp(1rem,2.5vw,1.15rem)',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '40px',
    lineHeight: 1.7,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 16px 50px rgba(102,126,234,0.45)',
  },
};

export default Home;
