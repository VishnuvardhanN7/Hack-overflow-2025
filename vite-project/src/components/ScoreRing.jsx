export default function ScoreRing({ score = null }) {
  const size = 320;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const hasScore = typeof score === "number" && Number.isFinite(score);
  const safeScore = hasScore ? Math.max(0, Math.min(1000, score)) : 0;

  const pct = safeScore / 1000; // 0..1
  const dashOffset = c * (1 - pct);

  return (
    <div className="score-ring glass reveal" role="img" aria-label={`Score ${safeScore} out of 1000`}>
      <div className="ring-glow" />

      <svg className="ring-svg" width={size} height={size}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22ffb0" />
            <stop offset="55%" stopColor="#22c8ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={stroke}
          fill="transparent"
        />

        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="score-text">
        <div className="star-badge">★</div>
        <h1>{safeScore}</h1>
        <div className="sub">/ 1000 POINTS</div>
        <p>{hasScore ? "Market Ready" : "Unlock Score"}</p>
      </div>
    </div>
  );
}
