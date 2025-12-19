import { useMemo, useState } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Alex Chen",
    role: "Software Engineering Student",
    college: "SRKR Engineering College",
    email: "alex@email.com",
    phone: "+91 9876543210",
    track: "Full Stack Engineering",
    about:
      "Passionate about building scalable web applications and clean interfaces. I enjoy solving real-world problems with readable, maintainable code.",
    skills: ["React", "Java", "SQL", "Node.js", "Git", "Docker", "AWS"],
  });

  const [draft, setDraft] = useState(profile);
  const view = isEditing ? draft : profile;

  const initials = useMemo(() => {
    const n = String(view.name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    return (String(parts[0]?.[0] || "U") + String(parts[1]?.[0] || "")).toUpperCase();
  }, [view.name]);

  const update = (key) => (e) =>
    setDraft((p) => ({
      ...p,
      [key]: e.target.value,
    }));

  function startEdit() {
    setDraft(profile);
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(profile);
    setIsEditing(false);
  }

  function saveEdit() {
    setProfile(draft);
    setIsEditing(false);
  }

  return (
    <div className="page profile-page">
      <div className="profile-wrap">
        <header className="profile-hero reveal">
          <div className="profile-hero-left">
            <div className="profile-kicker">PROFILE</div>
            <h1 className="profile-pageTitle">Student Profile</h1>
            <p className="profile-sub muted">
              Keep your details updated for a better dashboard experience.
            </p>
          </div>

          <div className="profile-hero-actions">
            {isEditing ? (
              <>
                <button className="btn profile-btn-ghost" onClick={cancelEdit} type="button">
                  Cancel
                </button>
                <button className="btn profile-btn-primary" onClick={saveEdit} type="button">
                  Save
                </button>
              </>
            ) : (
              <button className="btn profile-btn-primary" onClick={startEdit} type="button">
                Edit Profile
              </button>
            )}
          </div>
        </header>

        <section className="glass profile-card profile-header reveal">
          <div className="profile-headerLeft">
            <div className="profile-avatar" aria-hidden="true">
              {initials}
            </div>

            <div className="profile-headText">
              {isEditing ? (
                <div className="profile-editStack">
                  <input
                    className="profile-input profile-input-lg"
                    value={draft.name}
                    onChange={update("name")}
                    placeholder="Full name"
                  />
                  <input
                    className="profile-input"
                    value={draft.role}
                    onChange={update("role")}
                    placeholder="Role"
                  />
                  <input
                    className="profile-input"
                    value={draft.college}
                    onChange={update("college")}
                    placeholder="College"
                  />
                </div>
              ) : (
                <>
                  <div className="profile-name">{profile.name}</div>
                  <div className="profile-meta">{profile.role}</div>
                  <div className="profile-meta muted">{profile.college}</div>
                </>
              )}
            </div>
          </div>

          <div className="profile-badges">
            <span className="chip chip-soft">Track: {view.track}</span>
            <span className="chip chip-soft">{view.skills.length} skills</span>
          </div>
        </section>

        <div className="profile-grid">
          <section className="glass profile-card profile-about reveal">
            <div className="profile-sectionTitle">ABOUT</div>

            {isEditing ? (
              <textarea
                className="profile-textarea"
                value={draft.about}
                onChange={update("about")}
                placeholder="Write a short bio..."
                rows={6}
              />
            ) : (
              <p className="profile-text">{profile.about}</p>
            )}
          </section>

          <section className="glass profile-card profile-contact reveal">
            <div className="profile-sectionTitle">CONTACT</div>

            <div className="profile-fields">
              <div className="profile-field">
                <div className="profile-label">Email</div>
                {isEditing ? (
                  <input
                    className="profile-input"
                    value={draft.email}
                    onChange={update("email")}
                    placeholder="Email"
                  />
                ) : (
                  <div className="profile-value">{profile.email}</div>
                )}
              </div>

              <div className="profile-field">
                <div className="profile-label">Phone</div>
                {isEditing ? (
                  <input
                    className="profile-input"
                    value={draft.phone}
                    onChange={update("phone")}
                    placeholder="Phone"
                  />
                ) : (
                  <div className="profile-value">{profile.phone}</div>
                )}
              </div>

              <div className="profile-field">
                <div className="profile-label">Track</div>
                {isEditing ? (
                  <input
                    className="profile-input"
                    value={draft.track}
                    onChange={update("track")}
                    placeholder="Track"
                  />
                ) : (
                  <div className="profile-value">{profile.track}</div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="glass profile-card profile-skills reveal">
          <div className="profile-sectionTitle">SKILLS &amp; TECHNOLOGIES</div>

          <div className="profile-skillChips">
            {view.skills.map((s) => (
              <span key={s} className="chip chip-soft">
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* IMPORTANT: everything is scoped under .profile-page so it won't affect Navbar (.profile-title etc.) */}
      <style>{`
        /* Reduce the extra top spacing only for Profile (keeps Home unchanged) */
        .page.profile-page{
          padding-top: 16px;
          padding-bottom: calc(var(--bottom-nav-safe) - 10px);
        }

        .profile-page .profile-wrap{
          max-width: 1040px;
          margin: 0 auto;

          /* Helps keep the layout visually centered while still allowing scroll if needed */
          min-height: calc(100vh - var(--top-nav-h) - var(--bottom-nav-safe));
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
        }

        .profile-page .profile-hero{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap: 16px;
          margin: 0;
        }

        .profile-page .profile-hero-left{ max-width: 72ch; }

        .profile-page .profile-kicker{
          font-size: 11px;
          letter-spacing: 1.2px;
          opacity: 0.72;
        }

        /* Renamed from .profile-title to avoid any chance of collision */
        .profile-page .profile-pageTitle{
          margin: 10px 0 6px;
          font-size: 26px;
          font-weight: 950;
          letter-spacing: 0.2px;
        }

        .profile-page .profile-sub{
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
        }

        .profile-page .profile-hero-actions{
          display:flex;
          gap: 10px;
          flex: 0 0 auto;
        }

        .profile-page .profile-btn-primary{
          background: #3b82f6;
          border-color: rgba(59,130,246,0.35);
        }

        .profile-page .profile-btn-ghost{
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.14);
        }

        /* Slightly more solid glass to reduce heavy background bleed */
        .profile-page .profile-card{
          padding: 16px;
          background: var(--card-2);
        }

        .profile-page .profile-header{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 14px;
        }

        .profile-page .profile-headerLeft{
          display:flex;
          align-items:center;
          gap: 14px;
          min-width: 0;
        }

        .profile-page .profile-avatar{
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display:grid;
          place-items:center;
          font-weight: 950;
          letter-spacing: .5px;
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), transparent 55%),
            linear-gradient(135deg, rgba(34,200,255,0.55), rgba(124,58,237,0.55));
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 55px rgba(0,0,0,0.35);
          flex: 0 0 auto;
        }

        .profile-page .profile-headText{ min-width: 0; }

        .profile-page .profile-name{
          font-size: 16px;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 560px;
        }

        .profile-page .profile-meta{
          margin-top: 4px;
          font-size: 13px;
          opacity: 0.86;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 560px;
        }

        .profile-page .profile-badges{
          display:flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
          flex: 0 0 auto;
        }

        .profile-page .profile-grid{
          display:grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 14px;
        }

        .profile-page .profile-sectionTitle{
          font-size: 12px;
          letter-spacing: 1.1px;
          opacity: 0.75;
          margin-bottom: 10px;
        }

        .profile-page .profile-text{
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          opacity: 0.92;
          text-align: left;
        }

        .profile-page .profile-fields{
          display:grid;
          gap: 10px;
        }

        .profile-page .profile-field{
          padding: 12px;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .profile-page .profile-label{
          font-size: 12px;
          opacity: 0.65;
          margin-bottom: 6px;
        }

        .profile-page .profile-value{
          font-size: 13px;
          opacity: 0.92;
          word-break: break-word;
        }

        .profile-page .profile-editStack{
          display:grid;
          gap: 10px;
          width: min(520px, 100%);
        }

        .profile-page .profile-input,
        .profile-page .profile-textarea{
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          padding: 10px 12px;
          color: rgba(255,255,255,0.92);
          outline: none;
        }

        .profile-page .profile-input{ height: 42px; }
        .profile-page .profile-input-lg{ height: 44px; font-weight: 900; }
        .profile-page .profile-textarea{ padding: 12px; resize: vertical; }

        .profile-page .profile-input::placeholder,
        .profile-page .profile-textarea::placeholder{
          color: rgba(255,255,255,0.45);
        }

        .profile-page .profile-skillChips{
          display:flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        @media (max-width: 980px){
          .profile-page .profile-wrap{
            min-height: auto;
            justify-content: flex-start;
          }

          .profile-page .profile-hero{
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-page .profile-hero-actions{
            width: 100%;
          }

          .profile-page .profile-hero-actions .btn{
            width: 100%;
          }

          .profile-page .profile-header{
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-page .profile-badges{
            justify-content: flex-start;
          }

          .profile-page .profile-grid{
            grid-template-columns: 1fr;
          }

          .profile-page .profile-name,
          .profile-page .profile-meta{
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
