export default function JobCard({
  title,
  company,
  mode,
  tags = [],
  match = 0,
  badge = "",
}) {
  const pct = Math.max(0, Math.min(100, Number(match) || 0));

  return (
    <div className="job glass reveal">
      <div className="job-left">
        <h4>{title}</h4>
        <div className="job-company">
          {company}{mode ? ` • ${mode}` : ""}
        </div>

        <div className="tags">
          {badge ? <span className={`tag ${badge === "Missing Skill" ? "warn" : ""}`}>{badge}</span> : null}
          {tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </div>

      <div className="match-ring" aria-label={`Match ${pct}%`}>
        {pct}%
      </div>
    </div>
  );
}
