import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AppBackground from "../components/AppBackground";

export default function StudentLayout() {
  return (
    <AppBackground>
      <Navbar />
      <Outlet />
    </AppBackground>
  );
}
