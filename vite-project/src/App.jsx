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

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roadmap" element={<SkillsRoadmap />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
