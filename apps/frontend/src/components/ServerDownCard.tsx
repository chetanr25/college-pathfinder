import React from 'react';
import { Card, Container } from './ui';
import theme from '../theme';

const LinkedInLogo: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubLogo: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const GlobeLogo: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const EmailLogo: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

interface LinkCardConfig {
  href: string;
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  bgGradient: string;
  iconColor: string;
  iconColorHovered: string;
  external?: boolean;
}

const LINKS: LinkCardConfig[] = [
  {
    href: 'https://linkedin.chetanr25.in',
    icon: LinkedInLogo,
    label: 'LinkedIn',
    bgGradient: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
    iconColor: '#0077B5',
    iconColorHovered: '#ffffff',
  },
  {
    href: 'https://github.chetanr25.in',
    icon: GitHubLogo,
    label: 'GitHub',
    bgGradient: 'linear-gradient(135deg, #24292e 0%, #40464e 100%)',
    iconColor: '#24292e',
    iconColorHovered: '#ffffff',
  },
  {
    href: 'https://chetanr25.in',
    icon: GlobeLogo,
    label: 'Portfolio',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconColor: '#667eea',
    iconColorHovered: '#ffffff',
  },
  {
    href: 'mailto:chetan250204@gmail.com',
    icon: EmailLogo,
    label: 'Email',
    bgGradient: 'linear-gradient(135deg, #EA4335 0%, #F4A261 100%)',
    iconColor: '#EA4335',
    iconColorHovered: '#ffffff',
    external: false,
  },
];

const LinkCard: React.FC<LinkCardConfig> = ({
  href,
  icon: Icon,
  label,
  bgGradient,
  iconColor,
  iconColorHovered,
  external = true,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', flex: '1 1 90px', minWidth: '90px', maxWidth: '130px' }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '18px 12px',
          borderRadius: '16px',
          background: hovered ? bgGradient : '#ffffff',
          border: `1.5px solid ${hovered ? 'transparent' : theme.colors.border.light}`,
          boxShadow: hovered
            ? '0 10px 28px rgba(0,0,0,0.18)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: hovered ? 'rgba(255,255,255,0.18)' : `${iconColor}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.22s ease',
          }}
        >
          <Icon size={22} color={hovered ? iconColorHovered : iconColor} />
        </div>
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: hovered ? '#ffffff' : theme.colors.text.primary,
            transition: 'color 0.22s ease',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      </div>
    </a>
  );
};

const FooterLink: React.FC = () => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href="https://chetanr25.in"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        marginTop: '28px',
        fontSize: theme.typography.fontSize.xs,
        color: hovered ? theme.colors.primary.main : theme.colors.text.disabled,
        textDecoration: 'none',
        fontWeight: hovered ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
        letterSpacing: hovered ? '0.04em' : '0.02em',
        borderBottom: `1px solid ${hovered ? theme.colors.primary.main : 'transparent'}`,
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      chetanr25.in
    </a>
  );
};

const ServerDownCard: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: theme.colors.background.default,
        padding: '24px 16px',
      }}
    >
      <Container maxWidth="sm">
        <Card
          variant="elevated"
          padding={8}
          style={{
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
            borderRadius: '24px',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f5576c 100%)',
              borderRadius: '24px 24px 0 0',
            }}
          />

          {/* Status icon */}
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: '24px',
              fontSize: '38px',
              boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
            }}
          >
            🌙
          </div>

          {/* Title */}
          <h2
            style={{
              margin: 0,
              marginBottom: '12px',
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            Server is offline
          </h2>

          {/* Description */}
          <p
            style={{
              margin: '0 auto',
              marginBottom: '8px',
              maxWidth: '380px',
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}
          >
            This is a personal project the backend is intentionally shut down when not in use.
          </p>

          <p
            style={{
              margin: '0 auto',
              marginBottom: '36px',
              maxWidth: '340px',
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.disabled,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}
          >
            Reach out to the developer to spin it back up or learn more about the project.
          </p>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${theme.colors.border.light}, transparent)`,
              marginBottom: '28px',
            }}
          />

          {/* Section label */}
          <p
            style={{
              margin: 0,
              marginBottom: '18px',
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Connect with the developer
          </p>

          {/* Link cards */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {LINKS.map((link) => (
              <LinkCard key={link.label} {...link} />
            ))}
          </div>

          {/* Footer */}
          <FooterLink />
        </Card>
      </Container>
    </div>
  );
};

export default ServerDownCard;
