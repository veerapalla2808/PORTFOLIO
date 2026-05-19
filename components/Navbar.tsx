// components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ScrollProgressBar from './ui/ScrollProgressBar';
import MagneticButton from './ui/MagneticButton';
import { personal } from '@/lib/data';

const NAV_LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Education',  href: '#education' },
  { label: 'Blog',       href: '#blog' },
  { label: 'Contact',    href: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]    = useState(false);
  const [scrolled, setScrolled]    = useState(false);
  const [activeSection, setActive] = useState('');

  // Shrink nav background after scrolling 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight active section via IntersectionObserver
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1));
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close mobile menu when resizing to desktop (lg breakpoint)
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <ScrollProgressBar />

      <header
        className="lg:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 'var(--header-height)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          background: scrolled
            ? 'color-mix(in srgb, var(--bg-primary) 92%, transparent)'
            : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div
          className="container-wide"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Logo */}
          <a
            href="#hero"
            aria-label="Back to top"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              fontWeight: 900,
              color: 'var(--accent)',
              letterSpacing: '0.1em',
              textDecoration: 'none',
            }}
          >
            VP
          </a>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            style={{
              gap: '0.25rem',
              alignItems: 'center',
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  position: 'relative',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: activeSection === link.href.slice(1) ? 700 : 500,
                  color: activeSection === link.href.slice(1)
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderRadius: 6,
                  transition: 'color 0.2s ease',
                }}
              >
                {link.label}
                {activeSection === link.href.slice(1) && (
                  <motion.span
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      translateX: '-50%',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ThemeToggle />

            <div className="hidden md:flex">
              <MagneticButton href={personal.resumeUrl} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                <Download size={14} />
                Resume
              </MagneticButton>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
              className="flex md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: activeSection === link.href.slice(1)
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
                  textDecoration: 'none',
                  letterSpacing: '-0.03em',
                }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href={personal.resumeUrl}
              download
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.06 }}
              className="btn-primary"
            >
              <Download size={16} /> Resume
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
