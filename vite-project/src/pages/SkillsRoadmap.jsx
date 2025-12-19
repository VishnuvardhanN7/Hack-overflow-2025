import { useEffect, useMemo, useRef, useState } from "react";
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
    for (const step of s.roadmap || []) {
      all.push({ ...step, _from: s.name });
    }
  }

  // De-dupe by title (keep first occurrence)
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

  const fileRef = useRef(null);

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
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Verification failed");

      const newSkill = {
        name: cleaned,
        verified: true,
        level: Number(data.level) || 0,
        summary: data.summary || "",
        roadmap: Array.isArray(data.roadmap) ? data.roadmap : [],
      };

      // upsert (replace if same name exists)
      const next = [
        ...skills.filter(
          (s) => String(s.name).toLowerCase() !== cleaned.toLowerCase()
        ),
        newSkill,
      ].sort((a, b) => a.name.localeCompare(b.name));

      setSkills(next);
      persist(next);

      setMsg(`Verified ${cleaned}: ${newSkill.level}/100`);

      setSkillName("");
      setProjectZip(null);
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  const scoreNum = Number.isFinite(score) ? score : 0;

  return (
    <div className="page skills-sync">
      <header className="skills-hero reveal">
        <div>
          <div className="skills-kicker">SKILLS ROADMAP</div>
          <h1 className="skills-title">Verify Skills</h1>
          <p className="skills-sub muted">
            Upload a project ZIP to verify a skill. Verified skills power your
            readiness score ({scoreNum}/1000).
          </p>
        </div>

        <div className="skills-hero-right">
          <div className="glass skills-score">
            <div className="skills-score-label">Readiness</div>
            <div className="skills-score-value">{scoreNum}</div>
            <div className="skills-score-sub">/ 1000</div>
          </div>
        </div>
      </header>

      <section className="glass skills-card reveal">
        <div className="skills-card-head">
          <div>
            <div className="skills-card-kicker">VERIFY A SKILL</div>
            <div className="skills-card-sub">
              Add a real project ZIP for stronger verification results.
            </div>
          </div>
          <span className="chip chip-soft">{verifiedSkills.length} verified</span>
        </div>

        {msg ? <div className="skills-msg">{msg}</div> : null}

        <div className="skills-form">
          <input
            className="input"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Skill name (e.g., React)"
          />

          <label className="file-btn" title="Choose a .zip file">
            Choose ZIP
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              onChange={(e) => setProjectZip(e.target.files?.[0] || null)}
              hidden
            />
          </label>

          <div className="file-name" title={projectZip?.name || ""}>
            {projectZip?.name || "No file chosen"}
          </div>

          <button
            className="btn-primary"
            onClick={verifySkill}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>

        <textarea
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for evaluator (optional) — what should be checked?"
          rows={3}
        />

        <div className="hint muted">
          Tip: Use real projects—AI scoring becomes stronger with meaningful
          codebases.
        </div>
      </section>

      <section className="glass skills-card reveal">
        <div className="skills-card-head">
          <div>
            <div className="skills-card-kicker">VERIFIED SKILLS</div>
            <div className="skills-card-sub">
              Your verified skills, scores, and summaries.
            </div>
          </div>
        </div>

        {verifiedSkills.length === 0 ? (
          <p className="empty-text muted">
            No verified skills yet. Verify a project above to unlock score +
            roadmap.
          </p>
        ) : (
          <div className="verified-list">
            {verifiedSkills.map((s) => (
              <div key={s.name} className="verified-row">
                <SkillRow skill={s} onRemove={() => removeVerifiedSkill(s.name)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass skills-card reveal">
        <div className="skills-card-head">
          <div>
            <div className="skills-card-kicker">ROADMAP</div>
            <div className="skills-card-sub">
              Next actions generated from your verified skills.
            </div>
          </div>
        </div>

        {verifiedSkills.length === 0 ? (
          <p className="empty-text muted">
            Verify at least one skill to generate roadmap steps.
          </p>
        ) : roadmap.length === 0 ? (
          <p className="empty-text muted">
            No roadmap steps yet. Verify another skill or upload a richer
            project.
          </p>
        ) : (
          <div className="roadmap-list">
            {roadmap.map((step, i) => (
              <RoadmapStep key={`${step.title || "step"}-${i}`} step={step} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
