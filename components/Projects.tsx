// components/Projects.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/lib/data";
import TiltCard from "./ui/TiltCard";
import { ExternalLink } from "lucide-react";

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-label="Featured projects"
      className="container-wide"
    >
      <div className="section-label">04 // Projects</div>
      <h2 className="section-title">Featured Work</h2>

      <div className="flex flex-col gap-6 md:gap-8">
        {projects.map((project, i) => (
          <TiltCard key={project.name} className="project-card">
            <article
              className="glass-card p-6 md:p-10 relative overflow-hidden"
            >
              {/* Background project number */}
              <span
                className="absolute -right-4 -top-4 text-[8rem] md:text-[12rem] font-black leading-none select-none pointer-events-none"
                style={{ color: "rgba(0,242,255,0.04)" }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {project.name}
                </h3>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.name} on GitHub (opens in new tab)`}
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#00f2ff] hover:border-[#00f2ff]/40 transition-all min-w-[44px] min-h-[44px]"
                  >
                    <ExternalLink size={16} className="group-hover:rotate-45 transition-transform" />
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-white/50 leading-relaxed mb-6 relative z-10 max-w-3xl">
                {project.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-6 relative z-10 list-none" role="list">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-white/40 leading-relaxed">
                    <span className="text-[#00f2ff] mt-1 flex-shrink-0" aria-hidden="true">›</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Tech */}
              <div className="flex flex-wrap gap-2 relative z-10" aria-label="Technologies used">
                {project.tech.map((t) => (
                  <span key={t} className="skill-pill">{t}</span>
                ))}
              </div>
            </article>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
