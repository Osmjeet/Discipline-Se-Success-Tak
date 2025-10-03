import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static
app.use(express.static(path.join(__dirname, "public")));

// Ensure results.json
const RESULTS_FILE = path.join(__dirname, "results.json");
if (!fs.existsSync(RESULTS_FILE)) fs.writeFileSync(RESULTS_FILE, "[]");

// Save response
app.post("/api/save", (req, res) => {
  try {
    const { name, email, phone, city, score, answers } = req.body || {};
    if (!name || !email || !phone || typeof score !== "number") {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }
    const arr = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
    arr.push({
      name, email, phone, city: city || "",
      score, answers: answers || {},
      ts: new Date().toISOString(),
      ua: (req.headers["user-agent"] || "").slice(0, 200)
    });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(arr, null, 2));
    res.json({ ok: true, total: arr.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Admin APIs
app.get("/api/results", (_req, res) => {
  try {
    const arr = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
    res.json({ ok: true, items: arr });
  } catch {
    res.status(500).json({ ok: false, error: "Cannot read results" });
  }
});

app.get("/api/top", (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "10", 10)));
    const items = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
    const sorted = items
      .slice()
      .sort((a, b) => (b.score - a.score) || (new Date(a.ts) - new Date(b.ts)))
      .slice(0, limit);
    res.json({ ok: true, items: sorted });
  } catch {
    res.status(500).json({ ok: false, error: "Cannot compute top" });
  }
});

// Root → quiz
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "quiz.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
