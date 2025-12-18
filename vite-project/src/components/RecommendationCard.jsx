import { Link } from "react-router-dom";

export default function RecommendationCard({ title, subtitle, points = 0, buttonText = "Go", buttonHref = "/roadmap" }) {
  return (
    <div className="recommend glass">
      <div className="rec-header">
        RECOMMENDED ACTION <span className="pill">+{points} Pts</span>
      </div>

      <h3>{title}</h3>
      <p>{subtitle}</p>

      <Link to={buttonHref} className="primary-btn">
        {buttonText} <span className="arrow">→</span>
      </Link>
    </div>
  );
}
