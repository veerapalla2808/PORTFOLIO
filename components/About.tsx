// components/About.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "@/lib/gsap";

function WordReveal({
  text,
  progress,
  range,
}: {
  text: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {text}
    </motion.span>
  );
}

const STATS = [
  { value: "11+", label: "Years Experience" },
  { value: "40+", label: "Projects Delivered" },
  { value: "5", label: "Companies" },
  { value: "3", label: "Cloud Platforms" },
];

const HIGHLIGHTS = [
  {
    label: "Architectural Depth",
    value: "Kafka · RAG · K8s",
    desc: "Building resilient distributed systems that scale beyond 50k+ daily users.",
  },
  {
    label: "Product Mindset",
    value: "UX-First Engineering",
    desc: "Bridging the gap between complex backend logic and intuitive design.",
  },
  {
    label: "Senior Leadership",
    value: "11+ Years Excellence",
    desc: "Driving technical strategy and mentoring high-performance teams.",
  },
];

const BIO =
  "I am a Senior Full-Stack Engineer with 11+ years of experience building high-performance applications. My expertise spans the entire lifecycle of software development, from designing scalable microservices to crafting immersive user experiences. I specialize in React, Node.js, and Cloud architectures, with a focus on integrating generative AI and real-time event streaming into enterprise systems.";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stats slide in from right
      gsap.fromTo(
        statsRef.current!.children,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        }
      );
      // Highlights stagger up
      gsap.fromTo(
        highlightsRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: highlightsRef.current,
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = BIO.split(" ");

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About Veera Palla"
      className="container-wide"
    >
      <div className="section-label">01 // About</div>
      <h2 className="section-title">About Me</h2>

      {/* Two-column: bio left, stats right */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16 md:mb-20">
        {/* Bio word reveal */}
        <div className="lg:w-[60%]">
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-tight text-white">
            {words.map((word, i) => (
              <WordReveal
                key={i}
                text={word}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              />
            ))}
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="lg:w-[40%] grid grid-cols-2 gap-4" aria-label="Key statistics">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className="glass-card p-6 flex flex-col"
            >
              <span className="text-3xl md:text-4xl font-black text-[#00f2ff] mb-1" aria-label={stat.value}>
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/40 font-bold">
                {stat.label}
              </span>
            </article>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div ref={highlightsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {HIGHLIGHTS.map((item) => (
          <article key={item.label} className="glass-card p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4">
              {item.label}
            </div>
            <div className="text-xl font-bold text-white mb-2 tracking-tight">{item.value}</div>
            <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
