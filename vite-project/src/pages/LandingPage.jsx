import { useNavigate } from "react-router-dom";
import AppBackground from "../components/AppBackground";
import "../styles/landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <AppBackground>
      <div className="landing">
        <div className="landing__content">
          <h1 className="landing__title">Skill Passport 360</h1>
          <p className="landing__subtitle">Choose a dashboard to continue</p>

          <div className="landing__grid">
            <button
              className="landing__card"
              onClick={() => navigate("/student")}
              type="button"
            >
              <div className="landing__cardTitle">Student</div>
              <div className="landing__cardText">
                View your score, roadmap, and skill insights
              </div>
            </button>

            <button
              className="landing__card"
              onClick={() => navigate("/recruiter")}
              type="button"
            >
              <div className="landing__cardTitle">Recruiter</div>
              <div className="landing__cardText">
                (Coming soon) Search and evaluate candidates
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppBackground>
  );
}
