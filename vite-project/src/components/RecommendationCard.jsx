import { Link } from "react-router-dom";

export default function RecommendationCard({
  title,
  subtitle,
  points = 0,
  buttonText = "Go to Roadmap",
  buttonHref = "/roadmap",
}) {
  return (
    <div className="recommend glass reveal">
      <div className="rec-header">
        <span className="rec-icon">⚡</span>
        <span>RECOMMENDED ACTION</span>
        <span className="pill">+{Number(points) || 0} Pts</span>
      </div>

      <h3>{title}</h3>
      <p>{subtitle}</p>

      <Link className="primary-btn" to={buttonHref}>
        {buttonText} <span className="arrow">→</span>
      </Link>
    </div>
  );
}
