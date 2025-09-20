// backend/server.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("./middleware/logger");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(logger); 

// MySQL connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "vidhiroot",  
  database: "url_shortener",
});

function generateShortCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API: create short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { longUrl, validity, customCode } = req.body;
    if (!longUrl || !/^https?:\/\/.+/.test(longUrl)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let shortCode = customCode || generateShortCode();
    // Ensure uniqueness
    const [existing] = await db.query("SELECT * FROM urls WHERE short_code = ?", [shortCode]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Shortcode already exists" });
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + (validity || 30) * 60000);

    await db.query(
      "INSERT INTO urls (long_url, short_code, created_at, expires_at) VALUES (?, ?, ?, ?)",
      [longUrl, shortCode, createdAt, expiresAt]
    );

    res.json({ shortUrl: `http://localhost:5000/${shortCode}`, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API: redirect
app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const [rows] = await db.query("SELECT * FROM urls WHERE short_code = ?", [shortCode]);
    if (rows.length === 0) return res.status(404).send("URL not found");

    const url = rows[0];
    if (new Date() > url.expires_at) return res.status(410).send("URL expired");

    // Increment click count and log click
    await db.query("UPDATE urls SET click_count = click_count + 1 WHERE id = ?", [url.id]);
    await db.query(
      "INSERT INTO clicks (url_id, clicked_at, source, location) VALUES (?, NOW(), ?, ?)",
      [url.id, req.get("Referrer") || "direct", req.ip]
    );

    res.redirect(url.long_url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// API: get statistics
app.get("/api/stats", async (req, res) => {
  try {
    const [urls] = await db.query("SELECT * FROM urls ORDER BY created_at DESC");
    const stats = [];

    for (let url of urls) {
      const [clicks] = await db.query("SELECT * FROM clicks WHERE url_id = ?", [url.id]);
      stats.push({ ...url, clicks });
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
