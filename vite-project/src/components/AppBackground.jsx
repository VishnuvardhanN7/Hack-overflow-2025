import { useEffect } from "react";
import Silk from "./Silk";

export default function AppBackground() {
  useEffect(() => {
    document.body.classList.add("rb-bg");
    return () => document.body.classList.remove("rb-bg");
  }, []);

  return (
    <div className="rb-bg-layer" aria-hidden="true">
      <Silk color="#5B21B6" speed={4.2} scale={1.4} noiseIntensity={1.1} rotation={0} />
      <div className="rb-bg-overlay" />
    </div>
  );
}
