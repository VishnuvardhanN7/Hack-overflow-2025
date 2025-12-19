import { useEffect } from "react";
import Silk from "./Silk";

export default function AppBackground({ children }) {
  useEffect(() => {
    document.body.classList.add("rb-bg");
    return () => document.body.classList.remove("rb-bg");
  }, []);

  return (
    <>
      {/* Background canvas layer */}
      <div className="rb-bg-layer">
        <Silk speed={5} scale={1} color="#5b2cff" noiseIntensity={1.5} rotation={0} />
        <div className="rb-bg-overlay" />
      </div>

      {/* App content ABOVE the background */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
