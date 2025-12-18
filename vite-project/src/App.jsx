import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SkillsRoadmap from "./pages/SkillsRoadmap";
import Navbar from "./components/Navbar";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<SkillsRoadmap />} />
      </Routes>
    </>
  );
}
