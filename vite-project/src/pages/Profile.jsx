import { useContext, useState } from "react";
import { UserContext } from "../context/usercontext";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "30px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background: "#e0e0e0",
          }}
        />

        <div style={{ flex: 1 }}>
          {isEditing ? (
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              style={{ fontSize: "22px", fontWeight: "bold", width: "100%" }}
            />
          ) : (
            <h2>{user.name}</h2>
          )}

          {isEditing ? (
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              style={{ width: "100%", marginTop: "5px" }}
            />
          ) : (
            <p style={{ color: "#555" }}>{user.role}</p>
          )}

          <p style={{ color: "#777" }}>{user.college}</p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: "#2c3e50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {isEditing ? "Save" : "Edit Profile"}
        </button>
      </div>

      {/* About */}
      <section style={{ marginTop: "30px" }}>
        <h3>About Me</h3>
        {isEditing ? (
          <textarea
            name="bio"
            value={user.bio}
            onChange={handleChange}
            rows="4"
            style={{ width: "100%" }}
          />
        ) : (
          <p>{user.bio}</p>
        )}
      </section>

      {/* Skills */}
      <section style={{ marginTop: "30px" }}>
        <h3>Skills</h3>
        {isEditing ? (
          <input
            name="skills"
            value={user.skills}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        ) : (
          <p>{user.skills}</p>
        )}
      </section>

      {/* Contact & Links */}
      <section
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div>
          <h3>Contact</h3>
          {isEditing ? (
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          ) : (
            <p>Email: {user.email}</p>
          )}
        </div>

        <div>
          <h3>GitHub</h3>
          {isEditing ? (
            <input
              name="github"
              value={user.github}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          ) : (
            <a href={user.github} target="_blank" rel="noreferrer">
              {user.github}
            </a>
          )}
        </div>
      </section>

      {/* Academic & Interests */}
      <section
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div>
          <h3>Education</h3>
          <p>{user.college}</p>
          <p>B.Tech (Expected 2028)</p>
        </div>

        <div>
          <h3>Interests</h3>
          <ul>
            <li>Web Development</li>
            <li>Hackathons</li>
            <li>Software Engineering</li>
            <li>Learning New Technologies</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Profile;
