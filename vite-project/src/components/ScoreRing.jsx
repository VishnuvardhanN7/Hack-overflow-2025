export default function ScoreRing({ score = null }) {
  const size = 320;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const hasScore = typeof score === "number" && Number.isFinite(score);
  const pct = hasScore ? Math.max(0, Math.min(1, score / 1000)) : 0;

  const dashOffset = c * (1 - pct);

  return (
    <div className="score-container">
      <div className="score-ring glass reveal">
        <div className="ring-glow" aria-hidden="true" />
        <svg className="ring-svg" width={size} height={size} role="img" aria-label="Readiness score">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="55%" stopColor="#22c8ff" />
              <stop offset="100%" stopColor="#22ffb0" />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(255,255,255,0.10)"
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
            style={{ "--c": c, "--off": dashOffset }}
          />
        </svg>

        <div className="score-text">
          <div className="star-badge" aria-hidden="true">★</div>

          {hasScore ? (
            <>
              <h1>{score}</h1>
              <span>/ 1000 POINTS</span>
              <p>Market Ready</p>
            </>
          ) : (
            <>
              <h1>—</h1>
              <span>VERIFY A PROJECT</span>
              <p>Unlock Score</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
