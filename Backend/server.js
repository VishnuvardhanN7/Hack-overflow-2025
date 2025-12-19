import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import AdmZip from "adm-zip";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import validator from "validator";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- MongoDB connection ---
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) console.warn("Warning: MONGODB_URI not set in .env");

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected")).catch(err => console.error("MongoDB connection error:", err.message));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  createdAt: { type: Date, default: () => new Date() }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// --- Nodemailer transporter ---
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn("SMTP credentials not found in .env; emails will fail until configured.");
}

// --- Helpers ---
function validatePassword(pw) {
  const minLen = 8;
  if (typeof pw !== "string") return { ok: false, reason: "Password must be a string" };
  if (pw.length < minLen) return { ok: false, reason: `Password must be at least ${minLen} characters` };
  if (!/[a-z]/.test(pw)) return { ok: false, reason: "Password must contain a lowercase letter" };
  if (!/[A-Z]/.test(pw)) return { ok: false, reason: "Password must contain an uppercase letter" };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: "Password must contain a number" };
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return { ok: false, reason: "Password must contain a special character" };
  return { ok: true };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(to, otp) {
  // If transporter isn't configured via env, create a test account (Ethereal)
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.warn("No SMTP env configured — using Ethereal test account. Emails will not be delivered to real inboxes.");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
  const subject = "Your verification OTP";
  const text = `Your verification code is: ${otp}. It expires in 10 minutes.`;

  const info = await transporter.sendMail({ from, to, subject, text });
  // If using Ethereal/test account, log preview URL
  try {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log("OTP email preview URL:", preview);
  } catch (e) {
    // ignore
  }

  return info;
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    demoMode: String(process.env.DEMO_MODE || "").toLowerCase()
  });
});

// --- Auth routes: signup, verify OTP ---
app.post("/auth/signup", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error("Signup attempted but MongoDB not connected. readyState=", mongoose.connection.readyState);
      return res.status(500).json({ error: "MongoDB not connected" });
    }
    const { name, email, password } = req.body || {};
    if (!email || !validator.isEmail(email)) return res.status(400).json({ error: "Valid email required" });
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) return res.status(400).json({ error: pwdCheck.reason });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // If user exists but isn't verified, update OTP (and password) and resend OTP instead of returning conflict
      if (!existing.isVerified) {
        existing.passwordHash = passwordHash;
        existing.otp = otp;
        existing.otpExpires = otpExpires;
        await existing.save();

        try {
          await sendOtpEmail(existing.email, otp);
        } catch (e) {
          console.error("Error sending OTP email (resend):", e.message || e);
          return res.status(500).json({ error: "Failed to send verification email. Check SMTP configuration." });
        }

        return res.json({ ok: true, message: "Account exists but not verified — OTP resent to email." });
      }

      return res.status(409).json({ error: "Email already registered" });
    }

    const user = new User({ name: name || "", email: email.toLowerCase(), passwordHash, otp, otpExpires, isVerified: false });
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (e) {
      console.error("Error sending OTP email:", e.message || e);
      return res.status(500).json({ error: "Failed to send verification email. Check SMTP configuration." });
    }

    return res.json({ ok: true, message: "Signup successful. Check email for OTP." });
  } catch (err) {
    console.error("Signup error:", err);
    // For development, return the error message to the client to aid debugging
    const safe = String(err?.message || err);
    return res.status(500).json({ error: safe });
  }
});

app.post("/auth/verify-otp", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error("Verify-OTP attempted but MongoDB not connected. readyState=", mongoose.connection.readyState);
      return res.status(500).json({ error: "MongoDB not connected" });
    }
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).json({ error: "email and otp required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "User already verified" });
    if (!user.otp || !user.otpExpires) return res.status(400).json({ error: "No OTP pending for this user" });
    if (new Date() > user.otpExpires) return res.status(400).json({ error: "OTP expired" });
    if (String(otp).trim() !== String(user.otp).trim()) return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ ok: true, message: "Email verified" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// --- Login route ---
app.post("/auth/login", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error("Login attempted but MongoDB not connected. readyState=", mongoose.connection.readyState);
      return res.status(500).json({ error: "MongoDB not connected" });
    }
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isVerified) return res.status(403).json({ error: "Email not verified" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Successful login — in a real app you'd issue a JWT/session
    return res.json({ ok: true, message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

function pickTextFilesFromZip(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  const allowedExt = new Set([
    ".md", ".txt",
    ".js", ".jsx", ".ts", ".tsx",
    ".py", ".java", ".go",
    ".json", ".yml", ".yaml"
  ]);

  const blockedFolders = ["node_modules/", "dist/", "build/", ".git/", ".next/", "coverage/"];

  let totalChars = 0;
  const maxChars = 12000;
  const perFileCap = 2000;

  const files = [];

  for (const e of entries) {
    if (e.isDirectory) continue;

    const name = e.entryName.replaceAll("\\", "/");
    if (blockedFolders.some((b) => name.includes(b))) continue;

    const ext = "." + name.split(".").pop().toLowerCase();
    if (!allowedExt.has(ext)) continue;

    const raw = e.getData().toString("utf8");
    const cleaned = raw.slice(0, perFileCap);

    if (cleaned.trim().length < 20) continue;

    const remaining = maxChars - totalChars;
    if (remaining <= 0) break;

    const chunk = cleaned.slice(0, remaining);
    totalChars += chunk.length;

    files.push({ path: name, content: chunk });
  }

  return files;
}

function demoAssessment(skillName, reason = "fallback") {
  return {
    source: "fallback-demo",
    reason,
    skillName,
    assessedAt: new Date().toISOString(),
    level: 62,
    summary: "Fallback assessment used because live model call failed or demo mode is enabled.",
    strengths: ["Basic API structure", "Readable code organization"],
    gaps: ["Automated tests", "Validation & security basics", "Robust error handling"],
    roadmap: [
      { title: "Add input validation", detail: "Validate request bodies; handle errors cleanly.", points: 70 },
      { title: "Add tests", detail: "Write tests for routes and edge cases.", points: 90 },
      { title: "Improve error handling", detail: "Standardize error responses and logging.", points: 60 }
    ]
  };
}

app.post("/api/assess-skill", upload.single("projectZip"), async (req, res) => {
  const { skillName, goalRole, notes } = req.body || {};

  if (!skillName) return res.status(400).json({ error: "skillName required" });
  if (!req.file) return res.status(400).json({ error: "projectZip file required" });

  const demoMode = String(process.env.DEMO_MODE || "").toLowerCase() === "true";
  if (demoMode) return res.json(demoAssessment(skillName, "DEMO_MODE=true"));

  try {
    const files = pickTextFilesFromZip(req.file.buffer);
    if (files.length === 0) return res.status(400).json({ error: "No readable source files found in zip." });

    const prompt =
`Return ONLY valid JSON with EXACT keys:
{
  "level": integer 0..100,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "roadmap": [{ "title": string, "detail": string, "points": integer 10..150 }]
}

Evaluate skill: "${skillName}"
goalRole: ${goalRole || ""}
notes: ${notes || ""}

Project files:
${files.map(f => `--- ${f.path} ---\n${f.content}`).join("\n\n")}
`;

    const resp = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = (resp.text || "").trim();
    const parsed = JSON.parse(text);

    return res.json({
      source: "gemini-live",
      skillName,
      goalRole: goalRole || null,
      assessedAt: new Date().toISOString(),
      ...parsed
    });
  } catch (err) {
    const msg = String(err?.message || "");
    console.error("Gemini error:", msg);

    // If Gemini quota/rate limits block you, you will see it here (429 / RESOURCE_EXHAUSTED). [web:163]
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.toLowerCase().includes("quota")) {
      return res.json(demoAssessment(skillName, "quota_or_rate_limit"));
    }

    return res.status(500).json({ error: msg || "Server error" });
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log("Backend running on port", port));
