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
    const savedSkills = safeJson(localStorage.getItem(LS_SKILLS), []);
    const savedRoadmap = safeJson(localStorage.getItem(LS_ROADMAP), []);

    setSkills(Array.isArray(savedSkills) ? savedSkills : []);
    setRoadmap(Array.isArray(savedRoadmap) ? savedRoadmap : []);
  }, []);

  const verifiedSkills = useMemo(() => getVerifiedSkills(skills), [skills]);
  const score = useMemo(() => calculateScore(skills), [skills]);

  const sorted = useMemo(() => {
    return [...verifiedSkills].sort((a, b) => (Number(b.level) || 0) - (Number(a.level) || 0));
  }, [verifiedSkills]);

  const top = sorted[0] || null;
  const second = sorted[1] || null;
  const lowest = useMemo(() => {
    if (!verifiedSkills.length) return null;
    return [...verifiedSkills].sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0))[0];
  }, [verifiedSkills]);

  const nextAction = roadmap?.[0];

  const showInsights = verifiedSkills.length > 0;
  const recTitle = nextAction?.title || "Verify your first project";
  const recSubtitle =
    nextAction?.detail ||
    "Go to Roadmap, enter a skill name, upload a project ZIP, and get your verified score + learning roadmap.";
  const recPoints = Number(nextAction?.points ?? 0);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="main-grid">
          <div className="left">
            <SkillCard
              label="TOP VERIFIED SKILL"
              title={showInsights ? top?.name : "—"}
              score={showInsights ? Number(top?.level ?? 0) : null}
              type="good"
            />
            <SkillCard
              label="SECOND STRONGEST"
              title={showInsights ? second?.name : "—"}
              score={showInsights ? Number(second?.level ?? 0) : null}
              type="good"
            />
            <SkillCard
              label="LOWEST VERIFIED"
              title={showInsights ? lowest?.name : "—"}
              score={showInsights ? Number(lowest?.level ?? 0) : null}
              type="bad"
            />
          </div>

          <div className="score-container">
            <ScoreRing score={score} />
          </div>

          <div className="right">
            <RecommendationCard
              title={recTitle}
              subtitle={recSubtitle}
              points={recPoints}
              buttonText="Go to Roadmap"
              buttonHref="/roadmap"
            />
          </div>
        </div>

        <div className="matches-title">HIGH POTENTIAL MATCHES</div>

        <div className="jobs">
          {(studentData?.jobs || []).map((job) => (
            <JobCard
              key={`${job.title}-${job.company}`}
              title={job.title}
              company={job.company}
              match={job.match}
              tags={job.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
