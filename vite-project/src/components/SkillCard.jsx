export default function SkillCard({ label, title, score = null, type = "good" }) {
  const hasScore = typeof score === "number" && Number.isFinite(score);
  const pct = hasScore ? Math.max(0, Math.min(100, Number(score))) : 0;

  return (
    <div className={`skill-card glass reveal ${type}`}>
      <div className="skill-top">
        <div className={`skill-label ${type}`}>{label}</div>
        <div className="skill-score">{hasScore ? `${pct}/100` : "Not verified"}</div>
      </div>

      <div className="skill-title">{title}</div>

      <div className="progress" aria-label={`${title} progress`}>
        <div className={`progress-fill ${type}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
