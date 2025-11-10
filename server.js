// server.js  (CommonJS, rock-solid on Windows)
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "powerbuy2", version: "0.1.0" });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
