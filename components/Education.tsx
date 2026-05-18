// components/Education.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";
import { education, certifications } from "@/lib/data";
import { GraduationCap } from "lucide-react";

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const degreeRef = useRef<HTMLElement>(null);
  const certsRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        degreeRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: degreeRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        certsRef.current!.children,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: certsRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="education"
      aria-label="Education and certifications"
      className="container-wide"
    >
      <div className="section-label">05 // Education & Certifications</div>
      <h2 className="section-title">Knowledge Base</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Degree card */}
        <article
          ref={degreeRef}
          className="glass-card p-8 md:p-10 lg:flex-[1.6] flex flex-col justify-between min-h-[220px]"
          aria-label="Educational degree"
        >
          <div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
              style={{ background: "rgba(0,242,255,0.08)", border: "1px solid rgba(0,242,255,0.2)" }}
              aria-hidden="true"
            >
              <GraduationCap size={22} style={{ color: "#00f2ff" }} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">
              {education.degree}
            </h3>
            <p className="text-base font-semibold text-white/60 mb-4">{education.field}</p>
            <p className="text-sm text-white/40">{education.institution}</p>
            <p className="text-sm text-white/30">{education.location}</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold"
              style={{ background: "rgba(0,242,255,0.08)", color: "#00f2ff", border: "1px solid rgba(0,242,255,0.2)" }}
            >
              {education.year}
            </span>
            <span className="text-xs text-white/30 uppercase tracking-widest">Graduation Year</span>
          </div>
        </article>

        {/* Certifications */}
        <div className="lg:flex-1">
          <ul
            ref={certsRef}
            className="flex flex-col gap-4 list-none h-full"
            role="list"
            aria-label="Professional certifications"
          >
            {certifications.map((cert) => (
              <li key={cert.title}>
                <article className="glass-card p-6 flex items-center gap-5 h-full">
                  <div
                    className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ background: "rgba(0,242,255,0.06)", border: "1px solid rgba(0,242,255,0.15)" }}
                    aria-hidden="true"
                  >
                    <span className="text-lg font-black font-mono" style={{ color: "#00f2ff" }}>
                      {cert.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{cert.title}</h3>
                    <p className="text-xs text-white/40 mt-1">{cert.issuer}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
