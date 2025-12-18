export default function SkillRow({ skill, onChange, onRemove }) {
  const level = Math.max(0, Math.min(100, Number(skill?.level ?? 0)));

  return (
    <div className="skill-row">
      <div className="skill-name">{skill?.name}</div>

      <input
        type="range"
        min="0"
        max="100"
        value={level}
        onChange={(e) => onChange?.(Number(e.target.value))}
      />

      <div className="skill-actions">
        <div className="skill-score">{level}</div>
        <button className="remove-btn" onClick={onRemove} title="Remove">
          ✕
        </button>
      </div>
    </div>
  );
}
