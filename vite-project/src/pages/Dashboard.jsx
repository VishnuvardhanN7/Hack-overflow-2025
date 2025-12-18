import { useEffect, useMemo, useState } from "react";
import ScoreRing from "../components/ScoreRing";
import SkillCard from "../components/SkillCard";
import RecommendationCard from "../components/RecommendationCard";
import JobCard from "../components/JobCard";
import { calculateScore, generateRoadmap } from "../utils/scoreUtils";
import { roleProfiles } from "../data/roleProfiles";
import { studentData } from "../data/studentData";
import "../styles/dashboard.css";

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

export default function Dashboard() {
  const [goalRole, setGoalRole] = useState("Backend Developer");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const savedRole = localStorage.getItem(LS_ROLE);
    if (savedRole && roleProfiles[savedRole]) setGoalRole(savedRole);

    const savedSkills = safeJson(localStorage.getItem(LS_SKILLS), null);
    if (Array.isArray(savedSkills)) setSkills(savedSkills);
    else {
      setSkills(studentData.skills || []);
      localStorage.setItem(LS_SKILLS, JSON.stringify(studentData.skills || []));
      if (!savedRole) localStorage.setItem(LS_ROLE, "Backend Developer");
    }
  }, []);

  const roleProfile = roleProfiles[goalRole];
  const score = useMemo(() => calculateScore(skills, roleProfile), [skills, roleProfile]);
  const roadmap = useMemo(() => generateRoadmap(skills, roleProfile), [skills, roleProfile]);
  const nextAction = roadmap[0];

  const sorted = useMemo(
    () => [...skills].sort((a, b) => (Number(b.level) || 0) - (Number(a.level) || 0)),
    [skills]
  );

  const top = sorted[0];
  const verified = sorted[1];
  const gap = [...skills].sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0))[0];

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="main-grid">
          <div className="left">
            <SkillCard label="TOP STRENGTH" title={top?.name || "—"} score={Number(top?.level ?? 0)} type="good" />
            <SkillCard label="VERIFIED" title={verified?.name || "—"} score={Number(verified?.level ?? 0)} type="good" />
            <SkillCard label="CRITICAL GAP" title={gap?.name || "—"} score={Number(gap?.level ?? 0)} type="bad" />
          </div>

          <div className="score-container">
            <ScoreRing score={score} />
          </div>

          <div className="right">
            <RecommendationCard
              title={nextAction?.title || "Add your skills to get a roadmap"}
              subtitle={nextAction?.detail || `Go to Roadmap and set your goal role (current: ${goalRole}).`}
              points={nextAction?.points || 0}
              buttonText="Go to Roadmap"
              buttonHref="/roadmap"
            />
          </div>
        </div>

        <div className="matches-title">HIGH POTENTIAL MATCHES</div>
        <div className="jobs">
          {(studentData.jobs || []).map((job) => (
            <JobCard key={`${job.title}-${job.company}`} title={job.title} company={job.company} match={job.match} tags={job.tags} />
          ))}
        </div>
      </div>
    </div>
  );
}
