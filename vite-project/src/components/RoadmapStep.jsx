export default function RoadmapStep({ step }) {
  const title = step?.title || "Roadmap item";
  const detail = step?.detail || "";
  const points = Number(step?.points || 0);
  const status = step?.status || "Pending";
  const from = step?._from ? ` • ${step._from}` : "";

  return (
    <div className="roadmap-step reveal">
      <div className="roadmap-left">
        <div className="roadmap-title">{title}</div>
        <div className="roadmap-detail">{detail}</div>
        <div className="roadmap-points">
          {points ? `+${points} pts` : "+ pts"} <span className="muted">{from}</span>
        </div>
      </div>
      <div className="roadmap-status">{status}</div>
    </div>
  );
}
