export default function JobCard({ title, company, match = 0, tags = [] }) {
  return (
    <div className="job glass">
      <div>
        <h4>{title}</h4>
        <p className="job-company">{company}</p>
        <div className="tags">
          {tags.map((tag) => (
            <span key={tag} className={`tag ${String(tag).toLowerCase().includes("missing") ? "warn" : ""}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="match">
        <div className="match-ring">{Math.round(match)}%</div>
      </div>
    </div>
  );
}
