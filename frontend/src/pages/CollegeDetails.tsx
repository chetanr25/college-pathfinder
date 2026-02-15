import React from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Typography, Card, CardContent } from "@mui/material";

interface CollegeDetailsProps {}

const CollegeDetails: React.FC<CollegeDetailsProps> = () => {
  const navigate = useNavigate();
  const { collegeCode } = useParams<{ collegeCode: string }>();

  // Placeholder data - in the real app this would come from an API call
  const college = {
    college_code: collegeCode || "E000",
    college_name: "Example Institute of Engineering",
    college_place: "Bengaluru",
    description:
      "This is a sample description of the college. Replace with real data fetched from the backend.",
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">{college.college_name}</Typography>

        {/*
          Back to colleges button
          NOTE: The button text color was previously showing as a purplish/blue color
          which made it hard to read against the background. We explicitly set the
          text color to white so it is visible. Only color was changed as requested.
        */}
        <Button
          component={RouterLink}
          to="/colleges"
          variant="contained"
          color="primary"
          sx={{
            // Ensure the button text is white for better contrast (fix for Issue #15)
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Back to colleges
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {college.college_place}
          </Typography>

          <Typography variant="body1" paragraph>
            {college.description}
          </Typography>

          <Box mt={2}>
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              Go back
            </Button>
            <Button variant="contained" color="secondary" onClick={() => alert("Shortlist added (placeholder)") }>
              Add to shortlist
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CollegeDetails;
