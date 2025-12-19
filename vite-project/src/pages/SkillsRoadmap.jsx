import { useEffect, useMemo, useState } from "react";
import RoadmapStep from "../components/RoadmapStep";
import SkillRow from "../components/SkillRow";

import { calculateScore, getVerifiedSkills } from "../utils/scoreUtils";
import "../styles/skills.css";

const LS_SKILLS = "skills";
const LS_ROADMAP = "roadmap";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function safeJson(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function buildGlobalRoadmapFromSkills(skills) {
  const verified = getVerifiedSkills(skills);
  const all = [];
  for (const s of verified) {
    for (const step of s.roadmap || []) all.push({ ...step, _from: s.name });
  }
  const out = [];
  const seen = new Set();
  for (const step of all) {
    if (!step?.title) continue;
    if (seen.has(step.title)) continue;
    seen.add(step.title);
    out.push(step);
  }
  return out;
}

export default function SkillsRoadmap() {
  const [skills, setSkills] = useState([]);
  const [msg, setMsg] = useState("");

  // verify form
  const [skillName, setSkillName] = useState("");
  const [projectZip, setProjectZip] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSkills = safeJson(localStorage.getItem(LS_SKILLS), []);
    setSkills(Array.isArray(savedSkills) ? savedSkills : []);
  }, []);

  const verifiedSkills = useMemo(() => getVerifiedSkills(skills), [skills]);
  const roadmap = useMemo(() => buildGlobalRoadmapFromSkills(skills), [skills]);
  const score = useMemo(() => calculateScore(skills), [skills]);

  function persist(nextSkills) {
    const nextRoadmap = buildGlobalRoadmapFromSkills(nextSkills);
    localStorage.setItem(LS_SKILLS, JSON.stringify(nextSkills));
    localStorage.setItem(LS_ROADMAP, JSON.stringify(nextRoadmap));
  }

  function removeVerifiedSkill(name) {
    const cleaned = String(name || "").toLowerCase().trim();
    const next = skills.filter((s) => String(s.name).toLowerCase() !== cleaned);
    setSkills(next);
    persist(next);
  }

  async function verifySkill() {
    setMsg("");
    const cleaned = String(skillName || "").trim();
    if (!cleaned) return setMsg("Enter a skill name (e.g., JavaScript).");
    if (!projectZip) return setMsg("Upload a project .zip file.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("skillName", cleaned);
      fd.append("notes", notes);
      fd.append("projectZip", projectZip);

      const res = await fetch(`${API_BASE}/api/assess-skill`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Verification failed");

      const newSkill = {
        name: cleaned,
        verified: true,
        level: Number(data.level) || 0,
        summary: data.summary || "",
        roadmap: Array.isArray(data.roadmap) ? data.roadmap : [],
      };

      const next = [
        ...skills.filter((s) => String(s.name).toLowerCase() !== cleaned.toLowerCase()),
        newSkill,
      ].sort((a, b) => a.name.localeCompare(b.name));

      setSkills(next);
      persist(next);

      setMsg(`Verified ${cleaned}: ${newSkill.level}/100`);
      setSkillName("");
      setProjectZip(null);
      setNotes("");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="skills-page">
      <div className="skills-hero reveal">
        <div>
          <h1>Verify Skills</h1>
          <p className="muted">
            Upload a project ZIP to verify a skill. Verified skills power your readiness score
            {typeof score === "number" ? ` (${score}/1000)` : ""}.
          </p>
        </div>
        <div className="kpi glass">
          <div className="kpi-title">Readiness</div>
          <div className="kpi-value">{typeof score === "number" ? score : "—"}</div>
          <div className="kpi-sub">/ 1000</div>
        </div>
      </div>

      <section className="glass reveal">
        <h2>VERIFY A SKILL</h2>

        <div className="form-row">
          <input
            className="input"
            placeholder="Skill name (e.g., React)"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />

          <label className="file-pill">
            <input
              className="file-input"
              type="file"
              accept=".zip"
              onChange={(e) => setProjectZip(e.target.files?.[0] || null)}
            />
            <span>{projectZip?.name ? projectZip.name : "Upload ZIP"}</span>
          </label>

          <button className="btn-primary" onClick={verifySkill} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>

        <textarea
          className="textarea"
          placeholder="Notes for evaluator (optional) — what should be checked?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {msg ? <div className="toast">{msg}</div> : null}
        <div className="hint">Tip: Use real projects—AI scoring becomes stronger with meaningful codebases.</div>
      </section>

      <section className="glass reveal">
        <h2>VERIFIED SKILLS</h2>

        {verifiedSkills.length === 0 ? (
          <p className="empty-text">No verified skills yet. Verify a project above to unlock score + roadmap.</p>
        ) : (
          <div className="stack">
            {verifiedSkills.map((s) => (
              <SkillRow
                key={s.name}
                skill={s}
                onChange={() => {}}
                onRemove={() => removeVerifiedSkill(s.name)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="glass reveal">
        <h2>ROADMAP</h2>

        {roadmap.length === 0 ? (
          <p className="empty-text">Verify at least one skill to generate roadmap steps.</p>
        ) : (
          <div className="stack">
            {roadmap.map((step, i) => (
              <RoadmapStep key={`${step.title}-${i}`} step={step} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
