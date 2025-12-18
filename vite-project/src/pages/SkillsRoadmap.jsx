import { useEffect, useMemo, useState } from "react";
import RoadmapStep from "../components/RoadmapStep";
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
    for (const step of s.roadmap || []) {
      all.push({ ...step, _from: s.name });
    }
  }

  // de-dupe by title (keep first occurrence)
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

      const res = await fetch(`${API_BASE}/api/assess-skill`, {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Verification failed");

      const newSkill = {
        name: cleaned,
        verified: true,
        level: Number(data.level) || 0,
        summary: data.summary || "",
        roadmap: Array.isArray(data.roadmap) ? data.roadmap : []
      };

      // Upsert (replace if same name exists)
      const next = [
        ...skills.filter((s) => String(s.name).toLowerCase() !== cleaned.toLowerCase()),
        newSkill
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
      <h1>Skills Verification & Roadmap</h1>

      <section>
        <h2>VERIFY A SKILL (PROJECT)</h2>

        <div className="form-row">
          <input
            className="input"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Skill name (e.g., JavaScript, SQL, React)"
          />

          <input
            className="input"
            type="file"
            accept=".zip"
            onChange={(e) => setProjectZip(e.target.files?.[0] || null)}
          />

          <button className="btn-primary" type="button" onClick={verifySkill} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>

        <textarea
          className="textarea"
          rows={3}
          placeholder="Notes (optional): what did you build, your role, tech stack…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {msg ? <div className="hint" style={{ marginTop: 10 }}>{msg}</div> : null}

        <div style={{ marginTop: 14 }} className="hint">
          {score == null ? (
            <>Score: — (verify at least one project)</>
          ) : (
            <>Score: <b>{score}</b> / 1000</>
          )}
        </div>
      </section>

      <section>
        <h2>VERIFIED SKILLS</h2>

        {verifiedSkills.length === 0 ? (
          <p className="empty-text">
            No verified skills yet. Verify a project above to add your first skill and unlock your score + roadmap.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {verifiedSkills.map((s) => (
              <div key={s.name} className="skill-row verified-row">
                <div className="skill-name">{s.name}</div>

                <div className="skill-badge">
                  Verified: <span className="skill-badge-score">{Number(s.level)}/100</span>
                  {s.summary ? <div className="skill-summary">{s.summary}</div> : null}
                </div>

                <div className="skill-actions">
                  <button className="remove-btn" type="button" onClick={() => removeVerifiedSkill(s.name)} title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>YOUR ROADMAP (NEXT SKILLS)</h2>

        {roadmap.length === 0 ? (
          <p className="empty-text">Verify at least one skill to generate roadmap steps.</p>
        ) : (
          roadmap.map((s, i) => (
            <RoadmapStep
              key={`${s.title}-${i}`}
              title={s.title}
              detail={s.detail}
              points={s.points}
              completed={false}
            />
          ))
        )}
      </section>
    </div>
  );
}
