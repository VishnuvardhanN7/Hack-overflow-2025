import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Recruiter from "./pages/Recruiter";              // ✅ NEW
import StudentLayout from "./pages/StudentLayout";

import Dashboard from "./pages/Dashboard";
import SkillsRoadmap from "./pages/SkillsRoadmap";
import Profile from "./pages/Profile";

import "./styles/global.css";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Student dashboard area */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<SkillsRoadmap />} />
        <Route path="profile" element={<Profile />} />

        {/* Optional placeholders so Navbar links don't 404 */}
        <Route path="projects" element={<div className="page">Projects (coming soon)</div>} />
        <Route path="interns" element={<div className="page">Interns (coming soon)</div>} />
      </Route>

      {/* ✅ Recruiter dashboard page */}
      <Route path="/recruiter" element={<Recruiter />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
