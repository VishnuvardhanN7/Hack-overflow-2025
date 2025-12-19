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
      <div className="rec-shimmer" aria-hidden="true" />

      <div className="rec-header">
        <span className="rec-icon" aria-hidden="true">⚡</span>
        <span>RECOMMENDED ACTION</span>
        {!!points && <span className="pill">+{points} Pts</span>}
      </div>

      <h3>{title}</h3>
      <p>{subtitle}</p>

      <Link to={buttonHref} className="primary-btn">
        {buttonText} <span className="arrow">→</span>
      </Link>
    </div>
  );
}
