
import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Stats from "./Stats";

function Shortener() {
  const [urls, setUrls] = useState([{ longUrl: "", validity: "", customCode: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (index, field, value) => {
    const copy = [...urls];
    copy[index][field] = value;
    setUrls(copy);
  };

  const handleAdd = () => {
    if (urls.length < 5) setUrls([...urls, { longUrl: "", validity: "", customCode: "" }]);
  };

  const handleSubmit = async () => {
    const resArr = [];
    for (let url of urls) {
      try {
        const res = await axios.post("http://localhost:5000/api/shorten", url);
        resArr.push(res.data);
      } catch (err) {
        resArr.push({ error: err.response?.data?.error || "Server error" });
      }
    }
    setResults(resArr);
  };

  return (
    <Box p={5}>
      <Typography variant="h4">URL Shortener</Typography>
      {urls.map((u, i) => (
        <Box key={i} mt={2}>
          <TextField
            label="Long URL"
            value={u.longUrl}
            onChange={(e) => handleChange(i, "longUrl", e.target.value)}
            fullWidth
          />
          <TextField
            label="Validity (minutes)"
            value={u.validity}
            onChange={(e) => handleChange(i, "validity", e.target.value)}
            fullWidth
          />
          <TextField
            label="Custom Shortcode"
            value={u.customCode}
            onChange={(e) => handleChange(i, "customCode", e.target.value)}
            fullWidth
          />
        </Box>
      ))}
      <Button onClick={handleAdd} disabled={urls.length >= 5} variant="contained" sx={{ mt: 2 }}>
        Add URL
      </Button>
      <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, ml: 2 }}>
        Shorten
      </Button>

      {results.map((r, i) => (
        <Box key={i} mt={2}>
          {r.shortUrl ? (
            <Typography>
              <a href={r.shortUrl} target="_blank" rel="noopener noreferrer">
                {r.shortUrl}
              </a>{" "}
              - Expires: {new Date(r.expiresAt).toLocaleString()}
            </Typography>
          ) : (
            <Typography color="error">{r.error}</Typography>
          )}
        </Box>
      ))}

      <Box mt={3}>
        <Link to="/stats">View Statistics</Link>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shortener />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}
