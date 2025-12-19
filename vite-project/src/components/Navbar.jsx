import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/usercontext";

const Icon = ({ name }) => {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "score":
      return (
        <svg {...common}>
          <path
            d="M12 3l2.4 5.6 6.1.5-4.6 3.9 1.4 5.9-5.3-3.1-5.3 3.1 1.4-5.9-4.6-3.9 6.1-.5L12 3z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "roadmap":
      return (
        <svg {...common}>
          <path
            d="M6 6h12M6 12h8M6 18h12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M18 10l2 2-2 2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "projects":
      return (
        <svg {...common}>
          <path
            d="M4 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "interns":
      return (
        <svg {...common}>
          <path
            d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M4 21a8 8 0 0116 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M4 21a8 8 0 0116 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

export default function Navbar() {
  const { user } = useContext(UserContext);

  const navClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <div className="logo-icon" />
          <div>
            <div className="logo-title">SKILL PASSPORT 360</div>
            <div className="logo-sub">STUDENT DASHBOARD</div>
          </div>
        </div>

        <div className="top-right">
          <div className="divider" />
          <NavLink to="/profile" className="profile" aria-label="Open profile">
            <div className="profile-text">
              <div className="profile-name">{user?.name || "Student"}</div>
              <div className="profile-title">{user?.role || "—"}</div>
            </div>
            <div className="avatar" />
          </NavLink>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/" className={navClass}>
          <span className="nav-ico"><Icon name="score" /></span>
          <span className="nav-label">Score</span>
        </NavLink>

        <NavLink to="/roadmap" className={navClass}>
          <span className="nav-ico"><Icon name="roadmap" /></span>
          <span className="nav-label">Roadmap</span>
        </NavLink>

        <button className="nav-item" disabled>
          <span className="nav-ico"><Icon name="projects" /></span>
          <span className="nav-label">Projects</span>
        </button>

        <button className="nav-item" disabled>
          <span className="nav-ico"><Icon name="interns" /></span>
          <span className="nav-label">Interns</span>
        </button>

        <NavLink to="/profile" className={navClass}>
          <span className="nav-ico"><Icon name="profile" /></span>
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
