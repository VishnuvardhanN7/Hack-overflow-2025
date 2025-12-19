import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import AdmZip from "adm-zip";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    demoMode: String(process.env.DEMO_MODE || "").toLowerCase()
  });
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