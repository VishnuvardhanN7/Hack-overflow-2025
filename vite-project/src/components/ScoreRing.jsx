export default function ScoreRing({ score = 0 }) {
  const size = 270;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const pct = Math.max(0, Math.min(1, Number(score) / 1000));
  const dash = c * (1 - pct);

  return (
    <div className="glass score-ring">
      <svg width={size} height={size} className="ring-svg" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="score-text">
        <div className="star-badge" aria-hidden="true">★</div>
        <h1>{Math.round(score)}</h1>
        <span>/ 1000 POINTS</span>
        <p>Market Ready</p>
      </div>
    </div>
  );
}
