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
            level: Number(s?.level ?? 0),
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

  const totalScore = Number.isFinite(score) ? score : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <section className="main-grid">
          <div className="left-col">
            {showInsights ? (
              <>
                <SkillCard
                  label="TOP STRENGTH"
                  title={top?.name || "—"}
                  score={top ? Number(top.level) : null}
                  type="good"
                />
                <SkillCard
                  label="VERIFIED"
                  title={(second?.name || top?.name) || "—"}
                  score={
                    second
                      ? Number(second.level)
                      : top
                      ? Number(top.level)
                      : null
                  }
                  type="good"
                />
                <SkillCard
                  label="CRITICAL GAP"
                  title={lowest?.name || "—"}
                  score={lowest ? Number(lowest.level) : null}
                  type="bad"
                />
              </>
            ) : (
              <>
                <SkillCard
                  label="TOP STRENGTH"
                  title="Verify a skill"
                  score={60}
                  type="good"
                />
                <SkillCard
                  label="VERIFIED"
                  title="Upload a project ZIP"
                  score={40}
                  type="good"
                />
                <SkillCard
                  label="CRITICAL GAP"
                  title="Complete roadmap step"
                  score={20}
                  type="bad"
                />
              </>
            )}
          </div>

          <div className="mid-col">
            <div className="score-container">
              <ScoreRing score={totalScore} />
            </div>
          </div>

          <div className="right-col">
            <RecommendationCard
              title={recTitle}
              subtitle={recSubtitle}
              points={recPoints}
              buttonText="Go to Roadmap"
              buttonHref="/roadmap"
            />
          </div>
        </section>

        <section className="matches">
          <div className="matches-head">
            <div className="matches-title">HIGH POTENTIAL MATCHES</div>
            <div className="matches-sub">Based on verified skills + gaps.</div>
          </div>

          <div className="jobs">
            {jobs.map((j, idx) => (
              <JobCard
                key={`${j.title}-${idx}`}
                title={j.title}
                company={j.company}
                mode={j.mode}
                badge={j.badge}
                tags={j.tags}
                match={j.match}
              />
            ))}
          </div>
        </section>

        <div className="nav-safe-space" aria-hidden="true" />
      </div>
    </div>
  );
}
