// server.js — Complete backend for Powerbuy2
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "powerbuy2", version: "1.0.0" });
});

// JSON file paths
const signupsFile = path.join(__dirname, "signups.json");
const joinsFile = path.join(__dirname, "joins.json");

// =============== SIGNUP ROUTE ===============
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, confirmPhone } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ error: "Missing required fields" });
    if (phone !== confirmPhone)
      return res.status(400).json({ error: "Phone numbers do not match" });

    let signups = [];
    if (await fs.pathExists(signupsFile)) {
      const data = await fs.readFile(signupsFile, "utf8");
      signups = JSON.parse(data || "[]");
    }

    // prevent duplicate users
    const existing = signups.find(
      (u) => u.email === email || u.phone === phone
    );
    if (existing)
      return res.status(400).json({ error: "User already registered" });

    const newUser = { name, email, phone, timestamp: new Date().toISOString() };
    signups.push(newUser);
    await fs.writeFile(signupsFile, JSON.stringify(signups, null, 2));

    console.log(`✅ New signup: ${email}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error in signup:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =============== JOIN POWERBUY ===============
app.post("/api/join-powerbuy", async (req, res) => {
  try {
    const { name, email, phone, brand, type, specs, notes } = req.body;
    if (!name || !email || !phone || !brand || !type)
      return res.status(400).json({ error: "Missing required fields" });

    let joins = [];
    if (await fs.pathExists(joinsFile)) {
      const data = await fs.readFile(joinsFile, "utf8");
      joins = JSON.parse(data || "[]");
    }

    const duplicate = joins.find(
      (j) => j.user.email === email && j.powerbuy.brand === brand && j.powerbuy.type === type
    );
    if (duplicate)
      return res.status(400).json({ error: "You have already joined this PowerBuy" });

    const newJoin = {
      user: { name, email, phone },
      powerbuy: { brand, type },
      specs: specs || {},
      notes: notes || "",
      joinedAt: new Date().toISOString(),
    };

    joins.push(newJoin);
    await fs.writeFile(joinsFile, JSON.stringify(joins, null, 2));
    console.log(`✅ ${email} joined ${brand} (${type})`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Join error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =============== USER POWERBUYS ROUTES ===============
app.get("/api/user-powerbuys", async (req, res) => {
  try {
    if (await fs.pathExists(joinsFile)) {
      const data = await fs.readFile(joinsFile, "utf8");
      const joins = JSON.parse(data || "[]");
      res.status(200).json(joins);
    } else {
      res.status(200).json([]);
    }
  } catch (err) {
    console.error("❌ Error reading joins.json:", err);
    res.status(500).json({ error: "Unable to load PowerBuys" });
  }
});

app.post("/api/leave-powerbuy", async (req, res) => {
  try {
    const { email, brand, type } = req.body;
    if (!email || !brand || !type)
      return res.status(400).json({ error: "Missing required fields" });

    if (!(await fs.pathExists(joinsFile)))
      return res.status(404).json({ error: "No PowerBuys found" });

    const data = await fs.readFile(joinsFile, "utf8");
    let joins = JSON.parse(data || "[]");
    const updated = joins.filter(
      (j) => !(j.user.email === email && j.powerbuy.brand === brand && j.powerbuy.type === type)
    );

    await fs.writeFile(joinsFile, JSON.stringify(updated, null, 2));
    console.log(`👋 ${email} left ${brand} (${type})`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Leave error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =============== START SERVER ===============
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Powerbuy2 backend running at http://localhost:${PORT}`);
});
