import { useEffect, useMemo, useState } from "react";

import ScoreRing from "../components/ScoreRing";
import SkillCard from "../components/SkillCard";
import RecommendationCard from "../components/RecommendationCard";
import JobCard from "../components/JobCard";

import { calculateScore, getVerifiedSkills } from "../utils/scoreUtils";
import { studentData } from "../data/studentData";
import "../styles/dashboard.css";

const LS_SKILLS = "skills";
const LS_ROADMAP = "roadmap";

function safeJson(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [roadmap, setRoadmap] = useState([]);

  useEffect(() => {
    const savedSkills = safeJson(localStorage.getItem(LS_SKILLS), null);
    const savedRoadmap = safeJson(localStorage.getItem(LS_ROADMAP), []);

    if (Array.isArray(savedSkills)) {
      setSkills(savedSkills);
    } else {
      const seed = Array.isArray(studentData?.skills)
        ? studentData.skills.map((s) => ({
            name: s?.name || "Skill",
            verified: false,
            level: 0,
            summary: "",
            roadmap: [],
          }))
        : [];

      setSkills(seed);
      localStorage.setItem(LS_SKILLS, JSON.stringify(seed));
    }

    setRoadmap(Array.isArray(savedRoadmap) ? savedRoadmap : []);
  }, []);

  const verifiedSkills = useMemo(() => getVerifiedSkills(skills), [skills]);
  const score = useMemo(() => calculateScore(skills), [skills]);

  const sorted = useMemo(() => {
    return [...verifiedSkills].sort(
      (a, b) => (Number(b.level) || 0) - (Number(a.level) || 0)
    );
  }, [verifiedSkills]);

  const top = sorted[0] || null;
  const second = sorted[1] || null;
  const lowest = useMemo(() => {
    if (!verifiedSkills.length) return null;
    return [...verifiedSkills].sort(
      (a, b) => (Number(a.level) || 0) - (Number(b.level) || 0)
    )[0];
  }, [verifiedSkills]);

  const nextAction = roadmap?.[0];
  const showInsights = verifiedSkills.length > 0;

  const recTitle = nextAction?.title || "Verify your first project";
  const recSubtitle =
    nextAction?.detail ||
    "Go to Roadmap, upload a ZIP, and unlock verified scores + roadmap steps.";
  const recPoints = Number(nextAction?.points ?? 70);

  const jobs = Array.isArray(studentData?.matches)
    ? studentData.matches
    : [
        {
          title: "APM Intern",
          company: "Google",
          mode: "Hybrid",
          badge: "Missing Skill",
          tags: ["Product", "Data"],
          match: 85,
        },
        {
          title: "UX Intern",
          company: "Tesla",
          mode: "Remote",
          badge: "Eligible",
          tags: ["Figma", "Prototyping"],
          match: 93,
        },
      ];

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="main-grid">
          <div className="left-col">
            <SkillCard
              label="TOP STRENGTH"
              title={top?.name || "Verify a project"}
              score={showInsights ? top?.level ?? null : null}
              type="good"
            />
            <SkillCard
              label="VERIFIED"
              title={second?.name || "Upload ZIP to assess"}
              score={showInsights ? second?.level ?? null : null}
              type="good"
            />
            <SkillCard
              label="CRITICAL GAP"
              title={lowest?.name || "Start with one skill"}
              score={showInsights ? lowest?.level ?? null : null}
              type="bad"
            />
          </div>

          <div className="mid-col">
            <ScoreRing score={score} />
          </div>

          <div className="right-col">
            <RecommendationCard
              title={recTitle}
              subtitle={recSubtitle}
              points={recPoints}
              buttonText={showInsights ? "Go to Roadmap" : "Start Mission"}
              buttonHref="/roadmap"
            />
          </div>
        </div>

        <div className="matches">
          <div className="matches-head">
            <div className="matches-title">HIGH POTENTIAL MATCHES</div>
            <div className="matches-sub">Based on verified skills + gaps.</div>
          </div>

          <div className="jobs">
            {jobs.slice(0, 2).map((j) => (
              <JobCard
                key={`${j.title}-${j.company}`}
                title={j.title}
                company={j.company}
                mode={j.mode}
                tags={j.tags || []}
                badge={j.badge || ""}
                match={j.match || 0}
              />
            ))}
          </div>
        </div>

        {/* prevents bottom fixed navbar from covering jobs */}
        <div className="nav-safe-space" />
      </div>
    </div>
  );
}
