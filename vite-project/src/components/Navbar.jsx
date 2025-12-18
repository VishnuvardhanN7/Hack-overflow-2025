import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/usercontext";

export default function Navbar() {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const isActive = (path) => location.pathname === path;

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
              <div className="profile-name">{user?.name || "Student"}</div>
              <div className="profile-title">{user?.role || "—"}</div>
            </div>

            {/* Make avatar clickable to go to Profile */}
            <Link to="/profile" className="avatar" aria-label="Open profile" />
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
          <span className="nav-label">Score</span>
        </Link>

        <Link to="/roadmap" className={`nav-item ${isActive("/roadmap") ? "active" : ""}`}>
          <span className="nav-label">Roadmap</span>
        </Link>

        <button className="nav-item" disabled>
          <span className="nav-label">Projects</span>
        </button>

        <button className="nav-item" disabled>
          <span className="nav-label">Interns</span>
        </button>

        <Link to="/profile" className={`nav-item ${isActive("/profile") ? "active" : ""}`}>
          <span className="nav-label">Profile</span>
        </Link>
      </div>
    </>
  );
}
