import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Download,
  Search,
  School,
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';

interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  type?: 'string' | 'number';
}

interface TableRow {
  [key: string]: string | number;
}

interface TableMessageProps {
  title?: string;
  columns: TableColumn[];
  rows: TableRow[];
  highlightRules?: {
    column: string;
    threshold: number;
    color: 'success' | 'warning' | 'error';
  }[];
}

/**
 * Smart table component for chat messages
 * Features: Sorting, filtering, search, visual enhancements, CSV export
 */
const TableMessage: React.FC<TableMessageProps> = ({
  title,
  columns,
  rows,
  highlightRules = [],
}) => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Sorting logic
  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [rows, sortColumn, sortDirection]);

  // Search/filter logic
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return sortedRows;

    const query = searchQuery.toLowerCase();
    return sortedRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [sortedRows, searchQuery]);

  // Handle column header click for sorting
  const handleSort = (field: string) => {
    if (sortColumn === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(field);
      setSortDirection('asc');
    }
  };

  // Render simple markdown in cell content
  const renderMarkdown = (text: string | number): React.ReactNode => {
    if (typeof text !== 'string') {
      return <>{text}</>;
    }

    // Parse **bold**, *italic*, `code`
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Match **bold**, *italic*, or `code`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
      }

      const matched = match[0];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        // Bold
        parts.push(<strong key={key++}>{matched.slice(2, -2)}</strong>);
      } else if (matched.startsWith('`') && matched.endsWith('`')) {
        // Code
        parts.push(
          <code
            key={key++}
            style={{
              background: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
            }}
          >
            {matched.slice(1, -1)}
          </code>
        );
      } else if (matched.startsWith('*') && matched.endsWith('*')) {
        // Italic
        parts.push(<em key={key++}>{matched.slice(1, -1)}</em>);
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      // Header row
      columns.map((col) => col.headerName).join(','),
      // Data rows
      ...filteredRows.map((row) =>
        columns.map((col) => {
          const val = row[col.field];
          // Escape commas and quotes
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'table'}_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get cell highlight color based on rules
  const getCellColor = (column: string, value: any): string | undefined => {
    const rule = highlightRules.find((r) => r.column === column);
    if (!rule || typeof value !== 'number') return undefined;

    if (value <= rule.threshold && rule.color === 'success') {
      return '#d4edda'; // Light green
    }
    if (value > rule.threshold && value <= rule.threshold * 2 && rule.color === 'warning') {
      return '#fff3cd'; // Light yellow
    }
    if (value > rule.threshold * 2 && rule.color === 'error') {
      return '#f8d7da'; // Light red
    }
    return undefined;
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank <= 1000) return { icon: <EmojiEvents />, color: 'gold' };
    if (rank <= 5000) return { icon: <School />, color: 'silver' };
    if (rank <= 20000) return { icon: <TrendingUp />, color: 'bronze' };
    return null;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        marginTop: '12px',
        marginBottom: '12px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        maxWidth: '100%',
      }}
    >
      {/* Table Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <School fontSize="small" />
          {title || `${filteredRows.length} Results`}
        </Typography>

        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Search">
            <IconButton
              size="small"
              onClick={() => setShowSearch(!showSearch)}
              sx={{ color: '#ffffff' }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton
              size="small"
              onClick={handleExport}
              sx={{ color: '#ffffff' }}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search Bar */}
      {showSearch && (
        <Box sx={{ padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search in table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              background: '#ffffff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}

      {/* Table */}
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '400px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: '#f9fafb',
              zIndex: 1,
            }}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable !== false && handleSort(col.field)}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    borderBottom: '2px solid #e5e7eb',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.headerName}
                    {sortColumn === col.field && (
                      <span style={{ fontSize: '12px' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Box>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#9ca3af',
                  }}
                >
                  No results found
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((col) => {
                    const value = row[col.field];
                    const bgColor = getCellColor(col.field, value);
                    const isRankColumn = col.field.toLowerCase().includes('cutoff') || col.field.toLowerCase().includes('rank');
                    const rankBadge = isRankColumn && typeof value === 'number' ? getRankBadge(value) : null;

                    return (
                      <td
                        key={col.field}
                        style={{
                          padding: '12px 16px',
                          color: '#1f2937',
                          backgroundColor: bgColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {rankBadge && (
                            <Box
                              sx={{
                                color: rankBadge.color,
                                display: 'flex',
                                fontSize: '16px',
                              }}
                            >
                              {rankBadge.icon}
                            </Box>
                          )}
                          <span>{renderMarkdown(value)}</span>
                        </Box>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: '8px 16px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {filteredRows.length} of {rows.length} entries
        </Typography>
        {searchQuery && (
          <Chip
            label={`Filtered by: "${searchQuery}"`}
            size="small"
            onDelete={() => setSearchQuery('')}
            sx={{ fontSize: '11px' }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default TableMessage;
