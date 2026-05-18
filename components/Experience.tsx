// components/Experience.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { experiences } from "@/lib/data";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Draw the timeline line on scroll
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );

      // Cards fade in as they enter viewport
      gsap.utils.toArray<HTMLElement>(".exp-card").forEach((card) => {
        gsap.fromTo(
          card,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
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
      id="experience"
      aria-label="Work experience"
      className="container-wide"
    >
      <div className="section-label">03 // Experience</div>
      <h2 className="section-title">Where I&apos;ve Built</h2>

      <div className="relative flex gap-6 md:gap-12">
        {/* Timeline line */}
        <div className="relative flex-shrink-0 flex justify-center" style={{ width: "2px" }}>
          <div
            ref={lineRef}
            className="absolute top-0 bottom-0 w-px origin-top"
            style={{ background: "linear-gradient(to bottom, #00f2ff, rgba(0,242,255,0.1))" }}
            aria-hidden="true"
          />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-10 flex-1 pb-4">
          {experiences.map((exp, i) => (
            <article
              key={exp.company}
              className="exp-card glass-card p-6 md:p-8 relative"
              style={{ borderLeft: "2px solid rgba(0,242,255,0.15)" }}
            >
              {/* Timeline node */}
              <div
                className="absolute -left-[calc(1.5rem+2px)] md:-left-[calc(3rem+2px)] top-8 w-3 h-3 rounded-full border-2 border-[#00f2ff] bg-[#030303]"
                aria-hidden="true"
              />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white hover:text-[#00f2ff] transition-colors">
                    {exp.company}
                  </h3>
                  <p className="text-sm font-semibold text-white/60">{exp.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <time
                    dateTime={exp.period.replace(" – ", "/")}
                    className="text-xs font-mono text-[#00f2ff] block"
                  >
                    {exp.period}
                  </time>
                  <span className="text-xs text-white/40">{exp.location}</span>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-2 mb-6 list-none" role="list">
                {exp.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-white/50 leading-relaxed">
                    <span className="text-[#00f2ff] mt-1 flex-shrink-0" aria-hidden="true">›</span>
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-2" aria-label="Technologies used">
                {exp.tech.map((t) => (
                  <span key={t} className="skill-pill">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
