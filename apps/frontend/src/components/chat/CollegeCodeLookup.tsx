import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import axios from 'axios';

interface College {
  college_code: string;
  college_name: string;
}

interface CollegeCodeLookupProps {
  open: boolean;
  onClose: () => void;
  onCodeSelect: (code: string) => void;
}

const CollegeCodeLookup: React.FC<CollegeCodeLookupProps> = ({
  open,
  onClose,
  onCodeSelect,
}) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string>('');

  // Fetch colleges on mount
  useEffect(() => {
    if (open && colleges.length === 0) {
      fetchColleges();
    }
  }, [open]);

  const fetchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';
      const response = await axios.get(`${API_BASE_URL}/colleges/all`);
      setColleges(response.data.colleges || []);
    } catch (err) {
      setError('Failed to load colleges. Please try again.');
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter colleges based on search query (real-time)
  const filteredColleges = useMemo(() => {
    if (!searchQuery.trim()) {
      return colleges;
    }

    const query = searchQuery.toLowerCase().trim();
    return colleges.filter((college) =>
      college.college_name.toLowerCase().includes(query)
    );
  }, [colleges, searchQuery]);

  // Handle college row click
  const handleCollegeClick = async (college: College) => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(college.college_code);
      
      // Show success feedback
      setCopiedCode(college.college_code);
      setCopySuccess(true);
      
      // Pass code to parent component (auto-paste to input)
      onCodeSelect(college.college_code);
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSearchQuery(''); // Reset search
      }, 500);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy college code');
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 24px',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '4px' }}>
              🔍 College Code Lookup
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Search and copy college codes for queries
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: '24px' }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search colleges by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            sx={{
              marginBottom: '20px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />

          {/* Instruction */}
          <Alert
            severity="info"
            icon={<CopyIcon />}
            sx={{
              marginBottom: '16px',
              borderRadius: '8px',
              '& .MuiAlert-message': {
                fontSize: '14px',
              },
            }}
          >
            💡 Click any row to copy college code and paste it to chat
          </Alert>

          {/* Error Message */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ marginBottom: '16px', borderRadius: '8px' }}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <CircularProgress />
            </Box>
          )}

          {/* Table */}
          {!loading && !error && (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: '400px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px',
                        width: '150px',
                      }}
                    >
                      College Code
                    </TableCell>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      College Name
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredColleges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ padding: '40px' }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchQuery ? 'No colleges found matching your search' : 'No colleges available'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredColleges.map((college) => (
                      <TableRow
                        key={college.college_code}
                        onClick={() => handleCollegeClick(college)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                            transform: 'scale(1.01)',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                          },
                          '&:active': {
                            transform: 'scale(0.99)',
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#667eea',
                          }}
                        >
                          {college.college_code}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', color: '#1f2937' }}>
                          {college.college_name}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Results Count */}
          {!loading && !error && filteredColleges.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                marginTop: '12px',
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Showing {filteredColleges.length} of {colleges.length} colleges
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }}
        >
          ✅ College code <strong>{copiedCode}</strong> copied and pasted!
        </Alert>
      </Snackbar>
    </>
  );
};

export default CollegeCodeLookup;
