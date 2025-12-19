import { NavLink } from "react-router-dom";
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
            d="M12 3l2.2 6.7H21l-5.4 3.9 2.1 6.5L12 16.7 6.3 20.1l2.1-6.5L3 9.7h6.8L12 3z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "roadmap":
      return (
        <svg {...common}>
          <path
            d="M5 5h6v6H5V5zM13 13h6v6h-6v-6z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M11 8h2a4 4 0 014 4v1"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "projects":
      return (
        <svg {...common}>
          <path d="M4 7h16v12H4V7z" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M9 7l1.5-2h3L15 7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "interns":
      return (
        <svg {...common}>
          <path d="M4 9h16v10H4V9z" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M8 9V7a4 4 0 018 0v2"
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
            d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5"
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

  const name = user?.name || "Alex Chen";
  const title = user?.title || "Software Engineering";

  const items = useMemo(
    () => [
      { to: "/", end: true, label: "Score", icon: "score" },
      { to: "/roadmap", label: "Roadmap", icon: "roadmap" },
      { to: "/projects", label: "Projects", icon: "projects" },
      { to: "/interns", label: "Interns", icon: "interns" },
      { to: "/profile", label: "Profile", icon: "profile" },
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
      // TUNED: less aggressive, more “professional”
      const maxDist = 110;  // smaller = tighter influence
      const maxScale = 1.19; // smaller = less zoom

      itemRefs.current.forEach((el) => {
        if (!el) return;

        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const dist = Math.abs(x - cx);

        const t = Math.max(0, 1 - dist / maxDist);
        const scale = 1 + (maxScale - 1) * t;
        const lift = 4.5 * t; // smaller lift

        el.style.setProperty("--dock-scale", scale.toFixed(3));
        el.style.setProperty("--dock-lift", `${lift.toFixed(2)}px`);
      });
    });
  };

  const navClass = ({ isActive }) => `dock-item ${isActive ? "active" : ""}`;

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
          <div className="profile">
            <div className="profile-text">
              <div className="profile-name">{name}</div>
              <div className="profile-title">{title}</div>
            </div>
            <div className="avatar" />
          </div>
        </div>
      </header>

      <nav
        ref={dockRef}
        className="bottom-nav dock"
        aria-label="Bottom navigation"
        onMouseMove={onDockMove}
        onMouseLeave={resetDock}
      >
        {items.map((it, idx) => (
          <NavLink
            key={it.label}
            to={it.to}
            end={it.end}
            className={navClass}
            aria-label={it.label}
            data-tip={it.label}
            ref={(el) => (itemRefs.current[idx] = el)}
          >
            <span className="dock-icon">
              <Icon name={it.icon} />
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
