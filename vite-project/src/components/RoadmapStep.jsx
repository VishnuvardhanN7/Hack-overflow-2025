export default function RoadmapStep({ title, detail, points = 50, completed = false }) {
  return (
    <div className={`roadmap-step ${completed ? "done" : ""}`}>
      <div className="roadmap-left">
        <div className="roadmap-title">{title}</div>
        {detail ? <div className="roadmap-detail">{detail}</div> : null}
        <div className="roadmap-points">+{points} pts</div>
      </div>
      <div className="roadmap-status">{completed ? "Completed" : "Pending"}</div>
    </div>
  );
}
