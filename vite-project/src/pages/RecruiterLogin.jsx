import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecruiterLogin() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    recruiterName: "",
    companyName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      // login flow: call backend and redirect on success
      (async () => {
        try {
          const res = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password })
          });
          const data = await res.json();
          if (!res.ok) return alert(data.error || "Login failed");

          // On success redirect to profile
          navigate("/profile");
        } catch (err) {
          console.error(err);
          alert("Login failed: " + (err.message || err));
        }
      })();
      return;
    }

    // Signup flow: call backend to create user and send OTP
    (async () => {
      try {
        // basic client-side password validation
        const pw = form.password || "";
        const pwValid = validatePassword(pw);
        if (!pwValid.ok) return alert(pwValid.reason);

        const res = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.recruiterName,
            email: form.email,
            password: form.password,
            mobile: form.mobile,
            companyName: form.companyName
          })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || "Signup failed");

        alert(data.message || "Signup OK — check email for OTP");
        setShowOtp(true);
      } catch (err) {
        console.error(err);
        alert("Signup failed: " + (err.message || err));
      }
    })();
  };

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "OTP verify failed");
      alert(data.message || "Email verified");
      setShowOtp(false);
      setMode("login");
    } catch (err) {
      console.error(err);
      alert("OTP verify failed: " + (err.message || err));
    }
  };

  function validatePassword(pw) {
    if (!pw || pw.length < 8) return { ok: false, reason: "Password must be at least 8 characters" };
    if (!/[a-z]/.test(pw)) return { ok: false, reason: "Password must contain a lowercase letter" };
    if (!/[A-Z]/.test(pw)) return { ok: false, reason: "Password must contain an uppercase letter" };
    if (!/[0-9]/.test(pw)) return { ok: false, reason: "Password must contain a number" };
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return { ok: false, reason: "Password must contain a special character" };
    return { ok: true };
  }

  return (
    <div style={styles.page}>
      {/* LIVE AURORA BACKGROUND */}
      <div style={styles.aurora} />

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login" ? "Recruiter Login" : "Recruiter Sign Up"}
        </h2>

        <p style={styles.subtitle}>
          {mode === "login"
            ? "Access your recruiter dashboard"
            : "Create your recruiter account"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" && (
            <>
              <input
                name="recruiterName"
                placeholder="Recruiter Name"
                value={form.recruiterName}
                onChange={handleChange}
                style={styles.input}
                required
              />

              <input
                name="companyName"
                placeholder="Company Name"
                value={form.companyName}
                onChange={handleChange}
                style={styles.input}
                required
              />

              <input
                name="mobile"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            {mode === "login" ? "Login" : "Create Account"}
          </button>

          {showOtp && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexDirection: "column" }}>
              <input
                name="otp"
                placeholder="Enter OTP from email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" style={{ ...styles.button, flex: 1 }} onClick={handleVerifyOtp}>
                  Verify OTP
                </button>
                <button
                  type="button"
                  style={{ ...styles.button, background: "#6b7280", flex: 1 }}
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>

        <p style={styles.switch}>
          {mode === "login" ? (
            <>
              New recruiter?{" "}
              <span
                style={styles.link}
                onClick={() => setMode("signup")}
              >
                Create account
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={styles.link}
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>

      {/* ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes auroraGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
  },

  aurora: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(120deg, rgba(34,197,94,0.45), rgba(99,102,241,0.45), rgba(168,85,247,0.45))",
    backgroundSize: "200% 200%",
    animation: "auroraGradient 18s ease infinite",
    filter: "blur(120px)",
    opacity: 0.9,
  },

  card: {
    width: "380px",
    padding: "32px",
    borderRadius: "16px",
    background: "rgba(11, 18, 32, 0.9)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
    zIndex: 1,
    textAlign: "center",
  },

  title: {
    color: "#ffffff",
    marginBottom: "6px",
  },

  subtitle: {
    color: "#9aa4b2",
    fontSize: "14px",
    marginBottom: "22px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #2a3441",
    background: "#111827",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },

  switch: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#9aa4b2",
  },

  link: {
    color: "#60a5fa",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "underline",
  },
};
