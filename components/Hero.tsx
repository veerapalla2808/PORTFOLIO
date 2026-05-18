// components/Hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Typewriter from "typewriter-effect";
import dynamic from "next/dynamic";
import { personal, roles } from "@/lib/data";
import MagneticButton from "./ui/MagneticButton";

const CodeRain = dynamic(() => import("./three/CodeRain"), { ssr: false, loading: () => null });
const HeroGeometry = dynamic(() => import("./three/HeroCanvas"), { ssr: false, loading: () => null });

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const onMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-label="Hero — introduction"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layer 1 — Matrix Rain */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <CodeRain />
      </div>

      {/* Layer 2 — 3D Geometry */}
      <div className="absolute inset-0 z-[1]" aria-hidden="true" style={{ pointerEvents: "none" }}>
        <HeroGeometry mouseX={mouse.x} mouseY={mouse.y} reducedMotion={reducedMotion} />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(3,3,3,0.6) 70%, rgba(3,3,3,0.95) 100%)",
        }}
      />

      {/* Layer 3 — Typography */}
      <motion.div
        style={reducedMotion ? {} : { y, opacity, scale }}
        className="container-wide relative z-10 flex flex-col items-center text-center pt-20 md:pt-0"
      >
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0 }}
          className="mb-6 md:mb-8 px-4 py-1.5 rounded-full flex items-center gap-2"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            style={{ boxShadow: "0 0 8px rgba(34,197,94,0.7)" }}
            aria-hidden="true"
          />
          <span className="text-[10px] md:text-xs font-mono tracking-widest text-white/60 uppercase">
            Available for Senior opportunities
          </span>
        </motion.div>

        {/* Name — single h1 with two spans for WCAG compliance */}
        <div className="mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.2 }}
            className="font-black leading-[0.88] tracking-tighter"
            style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
          >
            <span className="block text-white">VEERA</span>
            <span
              className="block"
              style={{
                color: "#00f2ff",
                textShadow: "0 0 40px rgba(0,242,255,0.4)",
              }}
            >
              PALLA.
            </span>
          </motion.h1>
        </div>

        {/* Typewriter role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6 h-8 font-mono text-base md:text-lg tracking-wide"
          style={{ color: "#00f2ff" }}
          aria-label={`Role: ${roles[0]}`}
        >
          {reducedMotion ? (
            <span>{roles[0]}</span>
          ) : (
            <Typewriter
              options={{
                strings: roles,
                autoStart: true,
                loop: true,
                delay: 75,
                deleteSpeed: 40,
              }}
            />
          )}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="max-w-xs md:max-w-md text-sm md:text-base text-white/50 leading-relaxed mb-10 md:mb-12 px-4"
        >
          {personal.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <MagneticButton
            href="#projects"
            aria-label="View my work"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-black bg-[#00f2ff] min-h-[44px] flex items-center hover:opacity-90 transition-opacity"
          >
            View My Work ↓
          </MagneticButton>
          <MagneticButton
            href={personal.resumeUrl}
            download
            aria-label="Download resume"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-[#00f2ff] min-h-[44px] flex items-center"
            style={{ border: "1px solid rgba(0,242,255,0.4)" } as React.CSSProperties}
          >
            Download Resume
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[#00f2ff]/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
