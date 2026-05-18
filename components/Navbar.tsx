// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personal } from "@/lib/data";
import MagneticButton from "./ui/MagneticButton";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const SECTIONS = ["hero", "about", "skills", "experience", "projects", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <AnimatePresence>
        {scrolled && (
          <motion.nav
            role="navigation"
            aria-label="Main navigation"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(3, 3, 3, 0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 242, 255, 0.08)",
              }}
            >
              {/* Logo */}
              <a
                href="#hero"
                className="text-[#00f2ff] font-black font-mono text-sm mr-2 md:mr-4 min-w-[44px] min-h-[44px] flex items-center"
                aria-label="Veera Palla — back to top"
              >
                VP
              </a>

              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const sectionId = link.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <div key={link.href} className="relative">
                      <a
                        href={link.href}
                        className="relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors min-h-[44px] flex items-center"
                        style={{ color: isActive ? "#00f2ff" : "#a1a1aa" }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00f2ff]"
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          />
                        )}
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Resume button */}
              <div className="hidden md:block ml-2">
                <MagneticButton
                  href={personal.resumeUrl}
                  download
                  aria-label="Download resume"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-[#00f2ff] min-h-[44px] flex items-center"
                  style={{
                    border: "1px solid rgba(0, 242, 255, 0.4)",
                  } as React.CSSProperties}
                >
                  Resume ↓
                </MagneticButton>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
            style={{ background: "rgba(3,3,3,0.97)", backdropFilter: "blur(20px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav>
              <ul className="flex flex-col items-center gap-8 list-none" role="list">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-3xl font-black tracking-tight text-white hover:text-[#00f2ff] transition-colors min-h-[44px] flex items-center"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.07 }}
                >
                  <a
                    href={personal.resumeUrl}
                    download
                    className="mt-4 px-8 py-3 rounded-full border border-[#00f2ff] text-[#00f2ff] font-bold text-lg min-h-[44px] flex items-center"
                  >
                    Resume ↓
                  </a>
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
