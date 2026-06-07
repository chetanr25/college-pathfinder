import React, { useState } from 'react';
import { Share, ContentCopy, Check, Close, School } from '@mui/icons-material';
import type { College } from '../services/api';
import theme from '../theme';

interface ShareModalProps {
  rank: number;
  round: number;
  branches: string[];
  colleges: College[];
  shareBaseUrl: string;
  onClose: () => void;
}

function buildFrontendUrl(rank: number, round: number, branches: string[], limit: number): string {
  const params = new URLSearchParams({
    rank: String(rank),
    round: String(round),
    limit: String(Math.min(limit, 500)),
  });
  branches.forEach(b => params.append('branches', b));
  return `${window.location.origin}/predictor?${params.toString()}`;
}

function buildBackendShareUrl(baseUrl: string, rank: number, round: number, branches: string[], limit: number, count: number): string {
  const params = new URLSearchParams({
    rank: String(rank),
    round: String(round),
    limit: String(Math.min(limit, 500)),
    count: String(count),
    v: '2',   // cache-bust — increment if OG scraper needs to re-fetch
  });
  branches.forEach(b => params.append('branches', b));
  return `${baseUrl}/share?${params.toString()}`;
}

function buildShareText(rank: number, round: number, branches: string[], colleges: College[]): string {
  const top = colleges.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const branchStr = branches.length > 0
    ? ` | ${branches.slice(0, 2).join(', ')}${branches.length > 2 ? ` +${branches.length - 2}` : ''}`
    : '';

  const collegeLines = top.map((c, i) =>
    `${medals[i]} ${c.college_name} - ${c.branch_name} (Cutoff: ${c.cutoff_rank?.toLocaleString()})`
  );

  // No URL in text URL goes in the `url` param of Web Share API so
  // WhatsApp scrapes the backend share page (which has og:image).
  return [
    `🎓 KCET College Eligibility Rank ${rank.toLocaleString()}`,
    ``,
    `Round ${round}${branchStr}`,
    `✅ ${colleges.length} college${colleges.length !== 1 ? 's' : ''} eligible!`,
    ``,
    `Top picks:`,
    ...collegeLines,
    colleges.length > 3 ? `... and ${colleges.length - 3} more colleges` : null,
    ``,
    `Check which colleges YOU can get into 👇`,
  ].filter((l): l is string => l !== null).join('\n');
}

const ShareModal: React.FC<ShareModalProps> = ({ rank, round, branches, colleges, shareBaseUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);

  const frontendUrl = buildFrontendUrl(rank, round, branches, colleges.length);
  const backendUrl = buildBackendShareUrl(shareBaseUrl, rank, round, branches, colleges.length, colleges.length);
  const shareText = buildShareText(rank, round, branches, colleges);
  const top5 = colleges.slice(0, 5);

  const branchLabel = branches.length > 0
    ? branches.slice(0, 2).join(', ') + (branches.length > 2 ? ` +${branches.length - 2}` : '')
    : 'All Branches';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy'); // eslint-disable-line
      document.body.removeChild(el);
    }
  };

  // "Copy Link" copies the backend share URL — this is what WhatsApp scrapes
  // to generate the rich preview card with og:image.
  const handleCopyLink = async () => {
    await copyToClipboard(backendUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Separate button to copy the direct frontend URL (for bookmarking / browser)
  const handleCopyDirect = async () => {
    await copyToClipboard(frontendUrl);
    setCopiedDirect(true);
    setTimeout(() => setCopiedDirect(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KCET Rank ${rank.toLocaleString()} ${colleges.length} Colleges Eligible`,
          text: shareText,
          url: backendUrl,   // WhatsApp scrapes this URL → sees og:image
        });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    handleCopyLink();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Share Results</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <Close fontSize="small" />
          </button>
        </div>

        <p style={styles.previewLabel}>Preview card</p>

        {/* Share Card */}
        <div style={styles.shareCard}>
          <div style={styles.cardHeader}>
            <div style={styles.cardBrand}>
              <School style={{ fontSize: '1rem' }} />
              <span>College Path Finder</span>
            </div>
            <span style={styles.kcetBadge}>KCET 2025</span>
          </div>

          <h3 style={styles.cardTitle}>
            Rank {rank.toLocaleString()} - {colleges.length} Colleges Eligible
          </h3>

          <div style={styles.badgeRow}>
            <span style={styles.pill}>Round {round}</span>
            <span style={styles.pill}>{branchLabel}</span>
          </div>

          <div style={styles.collegeBox}>
            {top5.map((c, i) => (
              <div
                key={`${c.college_code}-${c.branch_name}`}
                style={{
                  ...styles.collegeRow,
                  borderBottom: i < top5.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
              >
                <span style={styles.rankCircle}>{i + 1}</span>
                <div style={styles.collegeInfo}>
                  <span style={styles.collegeName}>{c.college_name}</span>
                  <span style={styles.collegeMeta}>
                    {c.branch_name} · Cutoff: {c.cutoff_rank?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {colleges.length > 5 && (
              <p style={styles.moreText}>+ {colleges.length - 5} more colleges</p>
            )}
          </div>

          <p style={styles.cardFooter}>collegepathfinder.app/predictor</p>
        </div>

        {/* Actions */}
        <div style={styles.actionRow}>
          <button style={styles.copyBtn} onClick={handleCopyLink}>
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button style={styles.shareBtn} onClick={handleShare}>
            <Share fontSize="small" />
            <span>Share</span>
          </button>
        </div>

        <p style={styles.shareNote}>
          Paste this link on WhatsApp, Telegram, or iMessage to get a rich preview card with the college list image.
        </p>

        <div style={styles.directLinkRow}>
          <span style={styles.directLinkLabel}>Want a direct app link instead?</span>
          <button style={styles.directLinkBtn} onClick={handleCopyDirect}>
            {copiedDirect ? <Check style={{ fontSize: '0.8rem' }} /> : <ContentCopy style={{ fontSize: '0.8rem' }} />}
            <span>{copiedDirect ? 'Copied!' : 'Copy direct link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
    animation: 'slideUp 0.2s ease',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.colors.text.primary,
  },
  closeBtn: {
    background: theme.colors.neutral[100],
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.text.secondary,
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  previewLabel: {
    margin: '0 0 14px',
    fontSize: '0.7rem',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  shareCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '20px',
    color: '#fff',
    marginBottom: '20px',
    boxShadow: '0 8px 30px rgba(102,126,234,0.4)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  cardBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    opacity: 0.9,
  },
  kcetBadge: {
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '3px 9px',
    borderRadius: '20px',
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '1.1rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  pill: {
    background: 'rgba(255,255,255,0.18)',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  collegeBox: {
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '12px',
    padding: '10px 12px',
    marginBottom: '14px',
  },
  collegeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  rankCircle: {
    width: '22px',
    height: '22px',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '50%',
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1px',
  },
  collegeInfo: {
    flex: 1,
    minWidth: 0,
  },
  collegeName: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.35,
    marginBottom: '2px',
  },
  collegeMeta: {
    display: 'block',
    fontSize: '0.7rem',
    opacity: 0.75,
  },
  moreText: {
    margin: '8px 0 0',
    fontSize: '0.72rem',
    opacity: 0.75,
    textAlign: 'center',
  },
  cardFooter: {
    margin: 0,
    fontSize: '0.68rem',
    opacity: 0.55,
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  copyBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: theme.colors.background.default,
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.text.primary,
    transition: 'all 0.2s',
  },
  shareBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    boxShadow: '0 4px 15px rgba(102,126,234,0.35)',
    transition: 'all 0.2s',
  },
  shareNote: {
    margin: '0 0 12px',
    fontSize: '0.7rem',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  directLinkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  directLinkLabel: {
    fontSize: '0.7rem',
    color: theme.colors.text.secondary,
  },
  directLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: theme.colors.primary.main,
    padding: '2px 4px',
  },
};

export default ShareModal;
