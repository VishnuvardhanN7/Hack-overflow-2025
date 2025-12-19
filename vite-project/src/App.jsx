import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import AppBackground from "./components/AppBackground";

import Dashboard from "./pages/Dashboard";
import SkillsRoadmap from "./pages/SkillsRoadmap";
import Profile from "./pages/Profile";

import "./styles/global.css";

export default function App() {
  return (
    <>
      <AppBackground />

      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<SkillsRoadmap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
