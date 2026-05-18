'use client';
// components/Footer.tsx
import { personal } from "@/lib/data";
import { Mail, BookOpen, Phone } from "lucide-react";
import { FaLinkedin as Linkedin } from "react-icons/fa6";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { icon: <Mail size={18} aria-hidden="true" />, label: "Email", href: `mailto:${personal.email}` },
  { icon: <Linkedin size={18} aria-hidden="true" />, label: "LinkedIn", href: personal.linkedin },
  { icon: <BookOpen size={18} aria-hidden="true" />, label: "Medium", href: personal.medium },
  { icon: <Phone size={18} aria-hidden="true" />, label: "Phone", href: `tel:${personal.phone.replace(/\D/g, "")}` },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="container-wide py-12 md:py-16">
        {/* Three-column desktop / single-column mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
          {/* Logo + tagline */}
          <div>
            <a
              href="#hero"
              className="inline-block text-3xl font-black font-mono mb-3"
              style={{ color: "var(--accent)" }}
              aria-label="Veera Palla — back to top"
            >
              VP
            </a>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{personal.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{personal.title}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3 list-none" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--text-muted)" }}>Connect</p>
            <div className="flex gap-3 flex-wrap">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-11 h-11 flex items-center justify-center rounded-full border transition-all min-w-[44px] min-h-[44px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{ background: "var(--border-accent)" }}
          aria-hidden="true"
        />

        {/* Copyright */}
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          © {year} {personal.name} · Built with Next.js &amp; React
        </p>
      </div>
    </footer>
  );
}
