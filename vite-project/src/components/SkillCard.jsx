export default function SkillCard({ label, title, score = null, type = "good" }) {
  const hasScore = typeof score === "number" && Number.isFinite(score);
  const pct = hasScore ? Math.max(0, Math.min(100, Number(score))) : 0;

  const kind = type === "bad" ? "bad" : "good";

  return (
    <div className="skill-card glass reveal">
      <div className="skill-top">
        <div className={`skill-label ${kind}`}>{label}</div>
        <div className="skill-score">{hasScore ? `${Math.round(pct)}/100` : "—/100"}</div>
      </div>

      <div className="skill-title">{title}</div>

      <div className="progress" aria-hidden="true">
        <div className={`progress-fill ${kind}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
