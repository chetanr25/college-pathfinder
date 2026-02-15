import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";

type College = {
  college_code: string;
  college_name: string;
  branch_name?: string;
  cutoff_rank?: number;
};

/**
 * CollegeDetails page
 *
 * NOTE: This file was updated to ensure the "Back to colleges" button text is
 * clearly visible against the page background (text color forced to white).
 * The change is intentionally minimal and only affects the button text color.
 */
const CollegeDetails: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCollege = async () => {
      try {
        setLoading(true);
        // Try to fetch college branches/details from backend if available
        if (!collegeCode) {
          throw new Error("No college code provided");
        }

        const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8005";
        const res = await fetch(`${base}/colleges/${encodeURIComponent(collegeCode)}/branches`);
        if (!res.ok) {
          throw new Error(`Failed to fetch college details: ${res.statusText}`);
        }

        const data = await res.json();

        // The route returns { college_name, branches: [...] }
        const payload = data as any;

        if (mounted) {
          setCollege({
            college_code: collegeCode,
            college_name: payload.college_name || collegeCode,
            branch_name: payload.branches && payload.branches[0]?.branch_name,
            cutoff_rank: payload.branches && payload.branches[0]?.cutoff_ranks?.round1,
          });
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Unable to load college details");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCollege();

    return () => {
      mounted = false;
    };
  }, [collegeCode]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        {/* Back button - text colour forced to white to improve contrast */}
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            // Only changed line: ensure button text is white so it's visible on the background
            color: "#ffffff",
          }}
        >
          Back to colleges
        </Button>

        <Box>
          <Button variant="outlined" onClick={() => window.print()}>
            Print
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : college ? (
          <Box>
            <Typography variant="h4" gutterBottom>
              {college.college_name}
            </Typography>
            {college.branch_name && (
              <Typography variant="subtitle1" gutterBottom>
                Branch: {college.branch_name}
              </Typography>
            )}

            {college.cutoff_rank !== undefined && (
              <Typography sx={{ mt: 2 }}>
                Example Round 1 Cutoff: {college.cutoff_rank?.toLocaleString()}
              </Typography>
            )}

            <Typography sx={{ mt: 3 }}>
              This page shows basic information about the college. Use the "Back
              to colleges" button to return to the list.
            </Typography>
          </Box>
        ) : (
          <Typography>No college information available.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default CollegeDetails;
