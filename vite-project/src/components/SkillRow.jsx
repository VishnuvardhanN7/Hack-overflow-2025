export default function SkillRow({ skill, onChange, onRemove }) {
  const level = Math.max(0, Math.min(100, Number(skill?.level ?? 0)));

  return (
    <div className="verified-row reveal">
      <div className="skill-row">
        <div>
          <div className="skill-name">{skill?.name || "Skill"}</div>
          <div className="skill-badge">
            <span className="skill-badge-score">{level}/100</span>{" "}
            <span className="muted">Verified</span>
          </div>
          {skill?.summary ? <div className="skill-summary">{skill.summary}</div> : null}
        </div>

        <div>
          <input
            className="range"
            type="range"
            min="0"
            max="100"
            value={level}
            onChange={(e) => onChange?.(Number(e.target.value))}
            aria-label="Skill level"
          />
        </div>

        <div className="skill-actions">
          <button className="remove-btn" onClick={() => onRemove?.()}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
