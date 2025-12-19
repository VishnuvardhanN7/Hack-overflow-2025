import { useContext, useMemo, useState } from "react";
import { UserContext } from "../context/usercontext";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);

  const initials = useMemo(() => {
    const n = String(user?.name || "Student").trim();
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "S";
  }, [user?.name]);

  const onChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <div className="profile-page">
        <div className="profile-hero glass reveal">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-hero-main">
            <div className="profile-name-lg">{user?.name || "Student"}</div>
            <div className="profile-meta">
              <span className="chip">{user?.role || "—"}</span>
              <span className="chip chip-soft">{user?.college || "College"}</span>
            </div>
            <p className="profile-bio">{user?.bio || "Add a short bio to personalize your Skill Passport."}</p>
          </div>

          <button className="btn" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>

        <div className="profile-grid">
          <section className="glass reveal">
            <div className="section-title">PROFILE</div>

            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input className="input" name="name" value={user?.name || ""} onChange={onChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>Role</span>
                <input className="input" name="role" value={user?.role || ""} onChange={onChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>College</span>
                <input className="input" name="college" value={user?.college || ""} onChange={onChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>Email</span>
                <input className="input" name="email" value={user?.email || ""} onChange={onChange} disabled={!isEditing} />
              </label>
            </div>
          </section>

          <section className="glass reveal">
            <div className="section-title">ABOUT</div>

            <label className="field">
              <span>Skills</span>
              <input className="input" name="skills" value={user?.skills || ""} onChange={onChange} disabled={!isEditing} />
            </label>

            <label className="field" style={{ marginTop: 12 }}>
              <span>Bio</span>
              <textarea className="textarea" name="bio" value={user?.bio || ""} onChange={onChange} disabled={!isEditing} />
            </label>

            <div className="profile-note muted">
              Tip: keep it short—your dashboard score should prove capability; the profile just adds context.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
