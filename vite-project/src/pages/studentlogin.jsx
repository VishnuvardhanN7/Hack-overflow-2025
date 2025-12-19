import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentAuth() {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    college: "",
    regNo: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isSignup) {
      const pw = form.password || "";
      const problems = [];
      if (pw.length < 8) problems.push("at least 8 characters");
      if (!/[a-z]/.test(pw)) problems.push("a lowercase letter");
      if (!/[A-Z]/.test(pw)) problems.push("an uppercase letter");
      if (!/[0-9]/.test(pw)) problems.push("a number");
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) problems.push("a special character");
      if (problems.length) {
        setError("Password must include: " + problems.join(", "));
        return;
      }
    }

    const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const url = isSignup ? `${base}/auth/signup` : `${base}/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Something went wrong");
        return;
      }
      if (isSignup) {
        const otp = data.testOtp;
        setForm(f => ({ ...f, otp: otp || "" }));
        setIsSignup("verify");
        if (otp) setError("(Test mode) OTP: " + otp);
        return;
      }
      if (data.token) localStorage.setItem("studentToken", data.token);
      if (data.user) localStorage.setItem("studentUser", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Server not responding");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    try {
      const res = await fetch(`${base}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to verify");
        return;
      }
      const loginRes = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) return setError(loginData.error || "Login after verify failed");
      if (loginData.token) localStorage.setItem("studentToken", loginData.token);
      if (loginData.user) localStorage.setItem("studentUser", JSON.stringify(loginData.user));
      navigate("/dashboard");
    } catch (e) {
      setError("Server not responding");
    }
  };

  return (
    <div style={styles.container}>
      {/* Live Background Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div className="auth-card" style={styles.card}>
        <h2 style={styles.title}>
          {isSignup === "verify" ? "Verify Email" : isSignup ? "Create Account" : "Student login"}
        </h2>
        <p style={styles.subtitle}>
          {isSignup === "verify" ? "Enter the code sent to your email" : "Enter your details to continue"}
        </p>

        {isSignup === "verify" ? (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              style={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="otp"
              type="text"
              placeholder="Enter OTP"
              style={styles.input}
              value={form.otp || ""}
              onChange={handleChange}
              required
            />
            <button type="submit" style={styles.button}>Verify & Access</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
              {isSignup && (
                <div className="student-grid" style={styles.grid}>
                  <input className="auth-input" name="name" placeholder="Full Name" style={styles.input} onChange={handleChange} required />
                  <input className="auth-input" name="college" placeholder="College Name" style={styles.input} onChange={handleChange} required />
                  <input className="auth-input" name="regNo" placeholder="Reg Number" style={styles.input} onChange={handleChange} required />
                  <input className="auth-input" name="phone" placeholder="Phone Number" style={styles.input} onChange={handleChange} required />
                </div>
              )}

            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="Email Address"
              style={styles.input}
              onChange={handleChange}
              required
            />

            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="Password"
              style={styles.input}
              onChange={handleChange}
              required
            />

            <button type="submit" style={styles.button}>
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        <p style={styles.switchText}>
          {isSignup ? "Already have an account?" : "New to the platform?"}
          <span 
            style={styles.link} 
            onClick={() => setIsSignup(prev => (prev === "verify" ? false : !prev))}
          >
            {isSignup ? " Sign In" : " Create Account"}
          </span>
        </p>
      </div>
      
      {/* CSS Animations + responsive fixes for inputs */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }

        /* Prevent grid children from forcing overflow */
        .student-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .auth-input { width: 100%; box-sizing: border-box; }
        .auth-card { box-sizing: border-box; }

        /* On small screens, stack inputs */
        @media (max-width: 520px) {
          .student-grid { grid-template-columns: 1fr !important; }
          .auth-card { padding: 20px !important; max-width: 92% !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  // Animated Background elements
  blob1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "linear-gradient(to right, #4f46e5, #9333ea)",
    filter: "blur(80px)",
    borderRadius: "50%",
    zIndex: 0,
    top: "-10%",
    left: "10%",
    animation: "float 15s infinite ease-in-out",
    opacity: 0.5,
  },
  blob2: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "linear-gradient(to right, #0ea5e9, #2563eb)",
    filter: "blur(80px)",
    borderRadius: "50%",
    zIndex: 0,
    bottom: "5%",
    right: "10%",
    animation: "float 20s infinite ease-in-out reverse",
    opacity: 0.4,
  },
  card: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndex: 1,
    transition: "transform 0.3s ease",
  },
  title: {
    color: "#fff",
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  input: {
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "13px",
    textAlign: "center",
  },
  switchText: {
    textAlign: "center",
    marginTop: "24px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  link: {
    color: "#818cf8",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "5px",
    textDecoration: "none",
  }
};

export default StudentAuth;