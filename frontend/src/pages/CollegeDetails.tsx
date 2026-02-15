import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * CollegeDetails page
 *
 * Note: This component intentionally keeps the UI minimal. The change requested in
 * Issue #11 is to ensure the "Back to colleges" button text is clearly visible
 * against the page background. To make the button text visible we explicitly
 * set the button text color to white. No new components were introduced.
 */
const CollegeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { collegeCode } = useParams<{ collegeCode?: string }>();

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ color: "white" }} />}
        onClick={() => navigate("/colleges")}
        variant="contained"
        // Important: explicitly set the text/icon color to white so it is visible
        // against dark / gradient backgrounds (requested in Issue #11)
        sx={{
          background: "transparent",
          textTransform: "none",
          padding: "6px 12px",
          color: "#fff", // <-- Changed color to white as per the issue request
          alignItems: "center",
          boxShadow: "none",
          // keep a subtle hover so UX is good on dark backgrounds
          "&:hover": {
            background: "rgba(255,255,255,0.08)",
          },
        }}
      >
        Back to colleges
      </Button>

      <Typography variant="h4" sx={{ mt: 2 }}>
        College Details {collegeCode ? `- ${collegeCode}` : ""}
      </Typography>

      {/*
        Placeholder for college details content. The actual page in the project
        may contain more complex layout and data fetching. This file focuses on
        the single requested UI fix: making the "Back to colleges" button text
        white so it is visible on the page background (Issue #11).
      */}
    </Box>
  );
};

export default CollegeDetails;
