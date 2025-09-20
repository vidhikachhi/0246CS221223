// frontend/src/Stats.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <Box p={5}>
      <Typography variant="h4">URL Statistics</Typography>
      <Box mt={2} mb={2}>
        <Link to="/">Back to Shortener</Link>
      </Box>
      {stats.map((url) => (
        <Box key={url.id} mt={2} p={2} border="1px solid #ccc" borderRadius="5px">
          <Typography>
            Short URL:{" "}
            <a href={`http://localhost:5000/${url.short_code}`} target="_blank" rel="noopener noreferrer">
              {url.short_code}
            </a>
          </Typography>
          <Typography>
            Created: {new Date(url.created_at).toLocaleString()} | Expires: {new Date(url.expires_at).toLocaleString()}
          </Typography>
          <Typography>Clicks: {url.click_count}</Typography>
          {url.clicks.map((c) => (
            <Typography key={c.id} sx={{ ml: 2 }}>
              Clicked at: {new Date(c.clicked_at).toLocaleString()} | Source: {c.source} | Location: {c.location}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}
