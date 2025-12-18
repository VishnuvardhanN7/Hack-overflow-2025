export default function ScoreRing({ score = null }) {
  const size = 270;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const hasScore = typeof score === "number" && Number.isFinite(score);
  const pct = hasScore ? Math.max(0, Math.min(1, score / 1000)) : 0;
  const dash = c * (1 - pct);

  return (
    <div className="glass score-container">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22ffb0" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="score-text">
        {hasScore ? (
          <>
            <h1>{score}</h1>
            <span>Readiness score</span>
            <p>Market Ready</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 34 }}>—</h1>
            <span>Not assessed</span>
            <p>Verify a project</p>
          </>
        )}
      </div>
    </div>
  );
}
