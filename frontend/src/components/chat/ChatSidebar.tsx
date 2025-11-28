import React, { useState } from 'react';
import {
  Add,
  Chat,
  Delete,
  Edit,
  MoreVert,
  Check,
  Close,
  ChevronLeft,
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Drawer } from '@mui/material';
import type { ChatSession } from '../../services/chatService';
import theme from '../../theme';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  loading?: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onHide?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  loading = false,
  isMobile = false,
  isOpen = true,
  onClose,
  onHide,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSessionId(null);
  };

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setEditTitle(currentTitle);
    handleMenuClose();
  };

  const handleSaveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (sessionId: string) => {
    onDeleteSession(sessionId);
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sidebarContent = (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div style={styles.headerContent}>
            <Chat style={styles.headerIcon} />
            <h2 style={styles.headerTitle}>Chat History</h2>
          </div>
          {!isMobile && onHide && (
            <IconButton
              onClick={onHide}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}
              title="Hide sidebar"
            >
              <ChevronLeft style={{ fontSize: '1.25rem' }} />
            </IconButton>
          )}
        </div>
        <button style={styles.newChatButton} onClick={onNewChat}>
          <Add style={{ fontSize: '1.25rem' }} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Sessions List */}
      <div style={styles.sessionsList}>
        {loading ? (
          <div style={styles.loading}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={styles.emptyState}>
            <Chat style={styles.emptyIcon} />
            <p style={styles.emptyText}>No conversations yet</p>
            <p style={styles.emptyHint}>Start a new chat to begin</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                style={{
                  ...styles.sessionItem,
                  ...(isActive ? styles.sessionItemActive : {}),
                }}
                onClick={() => !isEditing && onSelectSession(session.id)}
              >
                <div style={styles.sessionContent}>
                  {isEditing ? (
                    <div style={styles.editWrapper}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={styles.editInput}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                      />
                      <div style={styles.editActions}>
                        <IconButton
                          size="small"
                          onClick={handleSaveRename}
                          sx={{ padding: '4px' }}
                        >
                          <Check style={{ fontSize: '1rem', color: theme.colors.success.main }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleCancelRename}
                          sx={{ padding: '4px' }}
                        >
                          <Close style={{ fontSize: '1rem', color: theme.colors.error.main }} />
                        </IconButton>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={styles.sessionInfo}>
                        <div style={styles.sessionTitle}>{session.title}</div>
                        <div style={styles.sessionMeta}>
                          {formatDate(session.updated_at)}
                          {session.preview && (
                            <span style={styles.sessionPreview}>
                              {' • '}{session.preview.substring(0, 30)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, session.id)}
                        sx={{ padding: '4px', opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <MoreVert style={{ fontSize: '1rem' }} />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedSessionId) {
              const session = sessions.find((s) => s.id === selectedSessionId);
              if (session) {
                handleRename(selectedSessionId, session.title);
              }
            }
          }}
        >
          <Edit style={{ fontSize: '1rem', marginRight: '8px' }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => selectedSessionId && handleDelete(selectedSessionId)}
          sx={{ color: theme.colors.error.main }}
        >
          <Delete style={{ fontSize: '1rem', marginRight: '8px' }} />
          Delete
        </MenuItem>
      </Menu>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
            background: styles.sidebar.background,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return sidebarContent;
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '280px',
    height: '100%',
    background: theme.colors.neutral[900],
    borderRight: `1px solid ${theme.colors.neutral[800]}`,
    display: 'flex',
    flexDirection: 'column',
    color: theme.colors.text.inverse,
  },
  header: {
    padding: theme.spacing[5],
    borderBottom: `1px solid ${theme.colors.neutral[800]}`,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  headerIcon: {
    fontSize: '1.5rem',
    color: theme.colors.primary.light,
  },
  headerTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  newChatButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: theme.shadows.md,
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing[2],
  },
  sessionItem: {
    padding: theme.spacing[3],
    marginBottom: theme.spacing[1],
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'transparent',
    position: 'relative' as const,
  },
  sessionItemActive: {
    background: 'rgba(102, 126, 234, 0.2)',
    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.4)',
  },
  sessionContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[1],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sessionMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[400],
  },
  sessionPreview: {
    color: theme.colors.neutral[500],
  },
  editWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  editInput: {
    flex: 1,
    padding: theme.spacing[2],
    background: theme.colors.neutral[800],
    border: `1px solid ${theme.colors.primary.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    outline: 'none',
  },
  editActions: {
    display: 'flex',
    gap: theme.spacing[1],
  },
  loading: {
    textAlign: 'center',
    padding: theme.spacing[8],
    color: theme.colors.neutral[400],
    fontSize: theme.typography.fontSize.sm,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing[12],
  },
  emptyIcon: {
    fontSize: '3rem',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing[3],
  },
  emptyText: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[400],
    marginBottom: theme.spacing[1],
  },
  emptyHint: {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
  },
};

export default ChatSidebar;
