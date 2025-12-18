import { useEffect, useMemo, useRef, useState } from "react";
import { skillLibrary } from "../data/skillLibrary";
import { roleNames, roleProfiles } from "../data/roleProfiles";
import SkillRow from "../components/SkillRow";
import RoadmapStep from "../components/RoadmapStep";
import { calculateScore, generateRoadmap } from "../utils/scoreUtils";
import "../styles/skills.css";

const LS_SKILLS = "skills";
const LS_ROLE = "goalRole";

function safeJson(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function flattenLibrary(lib) {
  const out = [];
  Object.values(lib || {}).forEach((arr) => (arr || []).forEach((s) => out.push(s)));
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

export default function SkillsRoadmap() {
  const [goalRole, setGoalRole] = useState(roleNames[0] || "Backend Developer");
  const [skills, setSkills] = useState([]);

  const [query, setQuery] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [open, setOpen] = useState(false);

  const wrapRef = useRef(null);

  const allSkills = useMemo(() => flattenLibrary(skillLibrary), []);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSkills
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, allSkills]);

  useEffect(() => {
    const savedRole = localStorage.getItem(LS_ROLE);
    if (savedRole && roleProfiles[savedRole]) setGoalRole(savedRole);

    const savedSkills = safeJson(localStorage.getItem(LS_SKILLS), []);
    setSkills(Array.isArray(savedSkills) ? savedSkills : []);
  }, []);

  useEffect(() => {
    function onDocDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  function persist(nextSkills, nextRole = goalRole) {
    localStorage.setItem(LS_SKILLS, JSON.stringify(nextSkills));
    localStorage.setItem(LS_ROLE, nextRole);
  }

  function addSkill(name, level = 50) {
    const cleaned = String(name || "").trim();
    if (!cleaned) return;

    if (skills.some((s) => String(s.name).toLowerCase() === cleaned.toLowerCase())) return;

    const next = [...skills, { name: cleaned, level }];
    setSkills(next);
    persist(next);
  }

  function removeSkill(name) {
    const cleaned = String(name || "").toLowerCase().trim();
    const next = skills.filter((s) => String(s.name).toLowerCase() !== cleaned);
    setSkills(next);
    persist(next);
  }

  function updateSkill(name, level) {
    const next = skills.map((s) => (s.name === name ? { ...s, level } : s));
    setSkills(next);
    persist(next);
  }

  function addFromPaste() {
    const raw = String(pasteInput || "").trim();
    if (!raw) return;

    const parts = raw
      .split(/[\n,]+/g)
      .map((s) => String(s).trim())
      .filter(Boolean);

    [...new Set(parts)].forEach((p) => addSkill(p, 50));
    setPasteInput("");
  }

  const roleProfile = roleProfiles[goalRole];
  const score = useMemo(() => calculateScore(skills, roleProfile), [skills, roleProfile]);
  const roadmap = useMemo(() => generateRoadmap(skills, roleProfile), [skills, roleProfile]);

  return (
    <div className="skills-page">
      <h1>Skills & Roadmap</h1>

      <section>
        <h2>SET YOUR GOAL</h2>
        <div className="form-row">
          <select
            className="input"
            value={goalRole}
            onChange={(e) => {
              const nextRole = e.target.value;
              setGoalRole(nextRole);
              persist(skills, nextRole);
            }}
          >
            {roleNames.map((r) => (
              <option key={r} value={r} style={{ color: "#0b1220" }}>
                {r}
              </option>
            ))}
          </select>

          <div className="hint">
            Readiness score: <b>{score}</b> / 1000
          </div>
        </div>
      </section>

      <section>
        <h2>ADD SKILLS (SEARCH OR PASTE)</h2>

        <div className="autocomplete" ref={wrapRef}>
          <div className="form-row">
            <input
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Type a skill (e.g., SQL, React, Git)..."
            />

            <button
              className="btn-primary"
              onClick={() => {
                addSkill(query, 50);
                setQuery("");
                setOpen(false);
              }}
            >
              Add
            </button>
          </div>

          {open && suggestions.length > 0 && (
            <div className="dropdown">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="dropdown-item"
                  onClick={() => {
                    addSkill(s, 50);
                    setQuery("");
                    setOpen(false);
                  }}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          className="textarea"
          rows={3}
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder="Paste skills separated by commas or new lines"
        />

        <div className="form-row">
          <button className="btn-soft" onClick={addFromPaste}>
            Add from text
          </button>
          <button
            className="btn-soft"
            onClick={() => {
              setSkills([]);
              persist([]);
            }}
          >
            Clear all
          </button>
        </div>
      </section>

      <section>
        <h2>RATE YOUR SKILLS</h2>
        {skills.length === 0 ? (
          <p className="empty-text">Add skills above to generate your score and roadmap.</p>
        ) : (
          skills
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((skill) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                onChange={(lvl) => updateSkill(skill.name, lvl)}
                onRemove={() => removeSkill(skill.name)}
              />
            ))
        )}
      </section>

      <section>
        <h2>YOUR ROADMAP (NEXT ACTIONS)</h2>
        {roadmap.length === 0 ? (
          <p className="empty-text">No gaps detected for this goal role.</p>
        ) : (
          roadmap.map((s) => (
            <RoadmapStep key={s.key} title={s.title} detail={s.detail} points={s.points} completed={false} />
          ))
        )}
      </section>
    </div>
  );
}
