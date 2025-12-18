import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SkillsRoadmap from "./pages/SkillsRoadmap";
import Profile from "./pages/Profile";

import "./styles/global.css";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<SkillsRoadmap />} />

        {/* Use lowercase path to avoid case-mismatch issues */}
        <Route path="/profile" element={<Profile />} />

        {/* Optional: redirect any unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
