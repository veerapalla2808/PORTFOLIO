// components/Skills.tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillCategories } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import {
  Monitor, Server, Sparkles, Cloud, Database, TestTube2, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Monitor: <Monitor size={18} aria-hidden="true" />,
  Server: <Server size={18} aria-hidden="true" />,
  Sparkles: <Sparkles size={18} aria-hidden="true" />,
  Cloud: <Cloud size={18} aria-hidden="true" />,
  Database: <Database size={18} aria-hidden="true" />,
  TestTube2: <TestTube2 size={18} aria-hidden="true" />,
  Zap: <Zap size={18} aria-hidden="true" />,
};

// AI & GenAI is the featured card (spans 2 cols on desktop)
const FEATURED_LABEL = "AI & GenAI";

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills and tech stack"
      className="container-wide"
    >
      <div className="section-label">02 // Skills & Tech Stack</div>
      <h2 className="section-title">
        What I{" "}
        <span
          style={{
            borderBottom: "2px solid #00f2ff",
            paddingBottom: "2px",
          }}
        >
          Build
        </span>{" "}
        With
      </h2>

      {/* Mobile: accordion */}
      <div className="md:hidden flex flex-col gap-3" role="list" aria-label="Skill categories">
        {skillCategories.map((cat) => {
          const isOpen = openCategory === cat.label;
          return (
            <div key={cat.label} className="glass-card overflow-hidden" role="listitem">
              <button
                onClick={() => setOpenCategory(isOpen ? null : cat.label)}
                className="w-full flex items-center justify-between p-5 text-left min-h-[44px]"
                aria-expanded={isOpen}
                aria-controls={`skills-${cat.label}`}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: "#00f2ff" }}>{ICON_MAP[cat.icon]}</span>
                  <span className="font-bold text-white text-sm">{cat.label}</span>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className="text-white/40 text-xs"
                  aria-hidden="true"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={`skills-${cat.label}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Tablet+ : bento grid */}
      <div
        ref={gridRef}
        className="hidden md:grid gap-4"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
        role="list"
        aria-label="Skill categories"
      >
        {skillCategories.map((cat) => (
          <article
            key={cat.label}
            className="glass-card p-6 lg:p-8"
            style={{
              gridColumn: cat.label === FEATURED_LABEL ? "span 2" : "span 1",
            }}
            role="listitem"
          >
            <div
              className="flex items-center gap-3 mb-5"
              style={{ color: "#00f2ff" }}
            >
              {ICON_MAP[cat.icon]}
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                {cat.label}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) => (
                <span key={skill} className="skill-pill">{skill}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
