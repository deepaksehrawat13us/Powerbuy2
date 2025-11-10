// server.js  (CommonJS, works on Windows)
console.log("🚀  RUNNING Powerbuy2 backend from:", __filename);
const fs = require("fs-extra");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
console.log("📢 Powerbuy2 backend started!");
console.log("📂 Current working directory:", process.cwd());
console.log("📁 __dirname:", __dirname);


// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Health check route (only once)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "powerbuy2", version: "0.1.0" });
});

// ✅ POST /api/signup — Save signup data locally in signups.json
app.post("/api/signup", async (req, res) => {
  try {
    console.log("✅ /api/signup route reached");
    const { name, email, phone, confirmPhone } = req.body;
    console.log("📥 Incoming signup:", req.body);

    // Basic validation
    if (!name || !email || !phone) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (phone !== confirmPhone) {
      console.log("❌ Phone numbers do not match");
      return res.status(400).json({ error: "Phone numbers do not match" });
    }

    const newSignup = {
      name,
      email,
      phone,
      timestamp: new Date().toISOString(),
    };

    const filePath = path.join(__dirname, "signups.json");
    console.log("🧾 File path:", filePath);

    // Read existing signups if file exists
    let signups = [];
    if (await fs.pathExists(filePath)) {
      console.log("📄 signups.json found, reading...");
      const data = await fs.readFile(filePath, "utf8");
      signups = JSON.parse(data || "[]");
    } else {
      console.log("⚠️ signups.json not found, creating new one...");
    }

    // Add new signup
    signups.push(newSignup);

    // Save updated array back to file
    console.log("💾 Writing new signup data...");
    await fs.writeFile(filePath, JSON.stringify(signups, null, 2));

    console.log("✅ New signup saved successfully!");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving signup:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Optional: View all signups (for admin/testing)
app.get("/api/signups", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "signups.json");
    if (await fs.pathExists(filePath)) {
      const data = await fs.readFile(filePath, "utf8");
      const signups = JSON.parse(data || "[]");
      res.status(200).json(signups);
    } else {
      res.status(200).json([]);
    }
  } catch (err) {
    console.error("❌ Error reading signups:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the server



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🧩 Registered routes:");
  app._router.stack
    .filter(r => r.route)
    .forEach(r => console.log(Object.keys(r.route.methods)[0].toUpperCase(), r.route.path));
});
