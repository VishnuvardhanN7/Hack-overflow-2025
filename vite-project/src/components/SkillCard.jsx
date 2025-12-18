export default function SkillCard({ label, title, score = null, type = "good" }) {
  const hasScore = typeof score === "number" && Number.isFinite(score);
  const pct = hasScore ? Math.max(0, Math.min(100, Number(score))) : 0;

  return (
    <div className="glass skill-card">
      <div className="skill-label">{label}</div>

      <div className="skill-top">
        <div style={{ fontWeight: 650 }}>{title || "—"}</div>
        <div style={{ opacity: 0.8 }}>{hasScore ? `${Math.round(pct)}/100` : "—"}</div>
      </div>

      <div className="progress">
        <div className={`progress-fill ${type}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
