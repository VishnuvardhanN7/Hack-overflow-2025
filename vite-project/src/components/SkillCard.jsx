export default function SkillCard({ label, title, score = 0, type = "good" }) {
  const pct = Math.max(0, Math.min(100, Number(score)));

  return (
    <div className="skill-card glass">
      <div className="skill-top">
        <div className={`skill-label ${type}`}>{label}</div>
        <div className="skill-score">{pct}/100</div>
      </div>

      <div className="skill-title">{title}</div>

      <div className="progress">
        <div className={`progress-fill ${type}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
