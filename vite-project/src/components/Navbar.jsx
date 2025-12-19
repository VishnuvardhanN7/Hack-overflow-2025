import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useMemo, useRef } from "react";
import { UserContext } from "../context/usercontext";

const Icon = ({ name }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "score":
      return (
        <svg {...common}>
          <path
            d="M12 20.5c4.694 0 8.5-3.806 8.5-8.5S16.694 3.5 12 3.5 3.5 7.306 3.5 12s3.806 8.5 8.5 8.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.9"
          />
          <path
            d="M12 12V7.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 12l3.2 1.9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "roadmap":
      return (
        <svg {...common}>
          <path
            d="M6 4.5v15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M6 6.5h8.5l-1.4 2.1 1.4 2.1H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M6 13.5h10.5l-1.4 2.1 1.4 2.1H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      );

    case "projects":
      return (
        <svg {...common}>
          <path
            d="M8.2 6.8h7.6c1.2 0 2.2 1 2.2 2.2v8c0 1.2-1 2.2-2.2 2.2H8.2C7 19.2 6 18.2 6 17v-8c0-1.2 1-2.2 2.2-2.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M9 6.8V5.9c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v.9"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.9"
          />
        </svg>
      );

    case "interns":
      return (
        <svg {...common}>
          <path
            d="M12 12.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5.5 19.2c1.5-3.4 4-4.8 6.5-4.8s5 1.4 6.5 4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <path
            d="M12 12.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M6.4 20c1.2-2.9 3.3-4.2 5.6-4.2s4.4 1.3 5.6 4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      );

    case "back":
      return (
        <svg {...common}>
          <path
            d="M10 7l-4 5 4 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 12h12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      );

    default:
      return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const name = user?.name || "Alex Chen";
  const title = user?.title || "Software Engineering";

  const items = useMemo(
    () => [
      { to: "/student", end: true, label: "Score", icon: "score" },
      { to: "/student/roadmap", label: "Roadmap", icon: "roadmap" },
      { to: "/student/projects", label: "Projects", icon: "projects" },
      { to: "/student/interns", label: "Interns", icon: "interns" },
      { to: "/student/profile", label: "Profile", icon: "profile" },
    ],
    []
  );

  const dockRef = useRef(null);
  const itemRefs = useRef([]);
  const rafRef = useRef(null);

  const resetDock = () => {
    itemRefs.current.forEach((el) => {
      if (!el) return;
      el.style.setProperty("--dock-scale", "1");
      el.style.setProperty("--dock-lift", "0px");
    });
  };

  const onDockMove = (e) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const maxDist = 110;
      const maxScale = 1.19;

      itemRefs.current.forEach((el) => {
        if (!el) return;

        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const dist = Math.abs(x - cx);

        const t = Math.max(0, 1 - dist / maxDist);
        const scale = 1 + (maxScale - 1) * t;
        const lift = 4.5 * t;

        el.style.setProperty("--dock-scale", scale.toFixed(3));
        el.style.setProperty("--dock-lift", `${lift.toFixed(2)}px`);
      });
    });
  };

  const navClass = ({ isActive }) => `dock-item ${isActive ? "active" : ""}`;

  return (
    <>
      {/* top header */}
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
          <div className="profile">
            <div className="profile-text">
              <div className="profile-name">{name}</div>
              <div className="profile-title">{title}</div>
            </div>
            <div className="avatar" />
          </div>
        </div>
      </header>

      {/* bottom dock */}
      <nav
        ref={dockRef}
        className="bottom-nav dock"
        onMouseMove={onDockMove}
        onMouseLeave={resetDock}
      >
        {items.map((it, idx) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={navClass}
            ref={(el) => (itemRefs.current[idx] = el)}
            data-tip={it.label}
          >
            <span className="dock-icon">
              <Icon name={it.icon} />
            </span>
          </NavLink>
        ))}

        {/* Back button at the end (bottom of navbar) */}
        <button
          type="button"
          className="dock-item"
          onClick={() => navigate("/")}
          ref={(el) => (itemRefs.current[items.length] = el)}
          data-tip="Back"
          aria-label="Back to landing"
          title="Back"
        >
          <span className="dock-icon">
            <Icon name="back" />
          </span>
        </button>
      </nav>
    </>
  );
}
