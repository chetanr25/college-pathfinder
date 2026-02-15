import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  School,
  LocationOn,
  TrendingUp,
  Info,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

interface Branch {
  branch_name: string;
  cutoff_ranks: {
    round1?: number;
    round2?: number;
    round3?: number;
  };
}

interface CollegeDetails {
  college_name: string;
  branches: Branch[];
}

const CollegeDetails: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<CollegeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/colleges/${collegeCode}/branches`
        );
        setCollege(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch college details. Please try again.');
        console.error('Error fetching college details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (collegeCode) {
      fetchCollegeDetails();
    }
  }, [collegeCode]);

  const handleBackToColleges = () => {
    navigate('/colleges');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !college) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'College not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBackToColleges}
          sx={{ color: 'white' }}
        >
          Back to Colleges
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBackToColleges}
          sx={{ 
            mb: 2,
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Back to Colleges
        </Button>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <School sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {college.college_name}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                College Code: {collegeCode}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* College Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <School color="primary" />
                <Typography variant="h6">Total Branches</Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {college.branches.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp color="primary" />
                <Typography variant="h6">Best Cutoff</Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {Math.min(
                  ...college.branches
                    .map((b) => b.cutoff_ranks.round1 || Infinity)
                    .filter((r) => r !== Infinity)
                ).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Info color="primary" />
                <Typography variant="h6">Rounds Available</Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Branches List */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Available Branches
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {college.branches.map((branch, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {branch.branch_name}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Round 1 Cutoff
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {branch.cutoff_ranks.round1
                            ? branch.cutoff_ranks.round1.toLocaleString()
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Round 2 Cutoff
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {branch.cutoff_ranks.round2
                            ? branch.cutoff_ranks.round2.toLocaleString()
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Round 3 Cutoff
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {branch.cutoff_ranks.round3
                            ? branch.cutoff_ranks.round3.toLocaleString()
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Trend Indicator */}
                  {branch.cutoff_ranks.round1 &&
                    branch.cutoff_ranks.round3 &&
                    branch.cutoff_ranks.round3 < branch.cutoff_ranks.round1 && (
                      <Chip
                        label="Cutoff Decreasing"
                        color="success"
                        size="small"
                        sx={{ mt: 2 }}
                      />
                    )}
                  {branch.cutoff_ranks.round1 &&
                    branch.cutoff_ranks.round3 &&
                    branch.cutoff_ranks.round3 > branch.cutoff_ranks.round1 && (
                      <Chip
                        label="Cutoff Increasing"
                        color="warning"
                        size="small"
                        sx={{ mt: 2 }}
                      />
                    )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Back Button at Bottom */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBackToColleges}
          size="large"
          sx={{ color: 'white' }}
        >
          Back to Colleges
        </Button>
      </Box>
    </Container>
  );
};

export default CollegeDetails;
