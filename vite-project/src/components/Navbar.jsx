import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <div className="logo-icon" />
          <div>
            <div className="logo-title">SKILL PASSPORT 360</div>
            <div className="logo-sub">STUDENT DASHBOARD</div>
          </div>
        </div>

        <div className="top-right">
          <div className="divider" />
          <div className="profile">
            <div className="profile-text">
              <div className="profile-name">Alex Chen</div>
              <div className="profile-title">Software Engineering</div>
            </div>
            <div className="avatar" />
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
          <span className="nav-label">Score</span>
        </Link>
        <Link to="/roadmap" className={`nav-item ${location.pathname === "/roadmap" ? "active" : ""}`}>
          <span className="nav-label">Roadmap</span>
        </Link>
        <button className="nav-item" disabled><span className="nav-label">Projects</span></button>
        <button className="nav-item" disabled><span className="nav-label">Interns</span></button>
        <button className="nav-item" disabled><span className="nav-label">Profile</span></button>
      </div>
    </>
  );
}
