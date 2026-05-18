// components/three/HeroCanvas.tsx
"use client";

import dynamic from "next/dynamic";

// ssr: false prevents Three.js from running on the server (requires window/WebGL)
const FloatingGeometry = dynamic(() => import("./FloatingGeometry"), {
  ssr: false,
  loading: () => null,
});

export { FloatingGeometry as HeroGeometry };
export default FloatingGeometry;
