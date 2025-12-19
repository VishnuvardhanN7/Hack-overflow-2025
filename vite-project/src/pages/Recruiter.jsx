import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBackground from "../components/AppBackground";
import ScoreRing from "../components/ScoreRing";
import SkillRow from "../components/SkillRow";
import JobCard from "../components/JobCard";

import { studentData } from "../data/studentData";
import { calculateScore, getVerifiedSkills } from "../utils/scoreUtils";

import "../styles/recruiter.css";

const LS_RECRUITER_JOBS = "recruiter_jobs_v1";

export default function Recruiter() {
  const navigate = useNavigate();

  const candidates = Array.isArray(studentData.candidates) ? studentData.candidates : [];
  const [selectedStudent, setSelectedStudent] = useState(candidates[0] || null);

  const [jobs, setJobs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RECRUITER_JOBS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return Array.isArray(studentData.jobs) ? studentData.jobs.slice() : [];
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const resp = await fetch("/api/jobs");
        if (!resp.ok) throw new Error("no jobs api");
        const data = await resp.json();

        if (mounted && Array.isArray(data)) {
          setJobs(data);
          try {
            localStorage.setItem(LS_RECRUITER_JOBS, JSON.stringify(data));
          } catch {}
        }
      } catch {
        // keep local jobs
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const [form, setForm] = useState({
    title: "",
    company: "",
    requiredSkills: "",
    minScore: 0,
  });

  const saveJobs = (next) => {
    setJobs(next);
    try {
      localStorage.setItem(LS_RECRUITER_JOBS, JSON.stringify(next));
    } catch {}
  };

  const normalizeScore = (raw) => {
    const n = Number(raw) || 0;
    if (n > 100) return Math.round(n / 10);
    return Math.round(n);
  };

  const computeMatchesForJob = useMemo(() => {
    return (job) => {
      const reqSkills = (job.requiredSkills || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      return candidates
        .map((c) => {
          const cVerified = getVerifiedSkills(c.skills || []);
          const rawScore = calculateScore(cVerified) || 0;
          const score = normalizeScore(rawScore);

          const cSkillNames = (c.skills || []).map((s) => String(s.name).toLowerCase());
          const matchedCount = reqSkills.filter((rs) => cSkillNames.includes(rs)).length;
          const skillRatio = reqSkills.length ? matchedCount / reqSkills.length : 0;

          const suitability = Math.round(0.7 * score + 0.3 * skillRatio * 100);
          return { candidate: c, score, matchedCount, suitability };
        })
        .sort((a, b) => b.suitability - a.suitability);
    };
  }, [candidates]);

  const handleAddJob = async (e) => {
    e.preventDefault();

    const newJob = {
      title: form.title || "Untitled",
      company: form.company || "-",
      requiredSkills: form.requiredSkills || "",
      minScore: Number(form.minScore) || 0,
      createdAt: new Date().toISOString(),
    };

    // try server first
    try {
      const resp = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (resp.ok) {
        const saved = await resp.json();
        const next = [saved, ...jobs];
        saveJobs(next);
        setForm({ title: "", company: "", requiredSkills: "", minScore: 0 });
        return;
      }
    } catch {
      // fallback to local
    }

    const next = [newJob, ...jobs];
    saveJobs(next);
    setForm({ title: "", company: "", requiredSkills: "", minScore: 0 });
  };

  return (
    <AppBackground>
      <div className="page recruiter-page">
        <div className="recruiter-top">
          <div>
            <div className="recruiter-kicker">SKILL PASSPORT 360</div>
            <h1 className="recruiter-title">Recruiter Dashboard</h1>
            <p className="recruiter-subtitle">Post jobs and find suitable students quickly.</p>
          </div>

          <button type="button" className="btn recruiter-back" onClick={() => navigate("/")}>
            Back to landing
          </button>
        </div>

        <div className="recruiter-grid">
          {/* Left */}
          <section className="glass recruiter-card">
            <h2 className="recruiter-cardTitle">Post a job</h2>

            <form onSubmit={handleAddJob} className="recruiter-form">
              <input
                className="recruiter-input"
                placeholder="Job title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="recruiter-input"
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              <input
                className="recruiter-input"
                placeholder="Required skills (comma separated)"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
              <input
                className="recruiter-input"
                type="number"
                min={0}
                max={100}
                placeholder="Min score (0-100)"
                value={form.minScore}
                onChange={(e) => setForm({ ...form, minScore: e.target.value })}
              />

              <button type="submit" className="btn recruiter-primary">
                Add job
              </button>
            </form>

            <h3 className="recruiter-sectionTitle">Open jobs</h3>
            <div className="recruiter-scroll recruiter-jobs">
              {jobs.map((job, i) => (
                <div key={`${job.title}-${i}`} className="recruiter-jobWrap">
                  <JobCard
                    title={job.title}
                    company={job.company}
                    match={0}
                    tags={[job.requiredSkills || ""]}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Middle */}
          <section className="glass recruiter-card recruiter-wide">
            <h2 className="recruiter-cardTitle">Suggested candidates</h2>

            {jobs.length === 0 ? (
              <p className="muted">Add a job to see suggestions.</p>
            ) : (
              <div className="recruiter-suggestions">
                {jobs.map((job, idx) => (
                  <div key={idx} className="recruiter-jobBlock">
                    <div className="recruiter-jobHeader">
                      <div className="recruiter-jobName">
                        {job.title} <span className="muted">— {job.company}</span>
                      </div>
                      <div className="recruiter-jobReq muted">
                        {job.requiredSkills || "No required skills set"}
                      </div>
                    </div>

                    <div className="recruiter-matchList">
                      {computeMatchesForJob(job).slice(0, 5).map((m, i) => (
                        <button
                          key={i}
                          type="button"
                          className="recruiter-matchRow"
                          onClick={() => setSelectedStudent(m.candidate)}
                        >
                          <div className="recruiter-ring">
                            <ScoreRing value={m.score} label="" />
                          </div>

                          <div className="recruiter-matchMeta">
                            <div className="recruiter-matchName">{m.candidate.name}</div>
                            <div className="recruiter-matchSub muted">
                              {m.candidate.branch} • matched {m.matchedCount} skills
                            </div>
                          </div>

                          <div className="chip chip-soft recruiter-suit">
                            Suitability: {m.suitability}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right */}
          <section className="glass recruiter-card">
            <h2 className="recruiter-cardTitle">Candidates</h2>

            <div className="recruiter-scroll recruiter-candidates">
              {candidates.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`recruiter-candidate ${
                    selectedStudent?.name === c.name ? "active" : ""
                  }`}
                  onClick={() => setSelectedStudent(c)}
                >
                  <div className="recruiter-candidateName">{c.name}</div>
                  <div className="recruiter-candidateBranch muted">{c.branch}</div>
                </button>
              ))}
            </div>

            <div className="recruiter-divider" />

            <h3 className="recruiter-sectionTitle">Selected student</h3>

            {selectedStudent ? (
              <div className="recruiter-selectedSkills">
                <div className="recruiter-selectedHead">
                  <div>
                    <div className="recruiter-selectedName">{selectedStudent.name}</div>
                    <div className="muted">{selectedStudent.branch}</div>
                  </div>
                </div>

                {getVerifiedSkills(selectedStudent.skills || []).map((s, idx) => (
                  <SkillRow key={idx} skill={s.name} level={s.level} />
                ))}
              </div>
            ) : (
              <p className="muted">No student selected.</p>
            )}
          </section>
        </div>
      </div>
    </AppBackground>
  );
}
