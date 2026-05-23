'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaLinkedin, FaMedium } from 'react-icons/fa6';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { personal } from '@/lib/data';

const SECTIONS = [
  { id: 'about',      label: 'About' },
  { id: 'skills',     label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Projects' },
  { id: 'education',  label: 'Education' },
  { id: 'blog',       label: 'Blog' },
  { id: 'contact',    label: 'Contact' },
];

const SOCIALS = [
  { Icon: FaLinkedin, label: 'LinkedIn', href: personal.linkedin },
  { Icon: FaMedium,   label: 'Medium',   href: personal.medium },
  { Icon: FileText,   label: 'Resume',   href: personal.resumeUrl },
];

export default function SideStrip() {
  const [active, setActive] = useState('');
  const reduced = useReducedMotion();

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <aside
      aria-label="Site navigation"
      className="hidden lg:flex"
      style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: 'var(--strip-width)',
        zIndex: 50,
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        borderRight: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowY: 'auto',
      }}
    >
      {/* ── Logo ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Image
          src="/veera-logo.png"
          alt="Veera Palla"
          width={160}
          height={60}
          style={{ width: 'auto', height: 52, objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </div>

      {/* Identity */}
      <p style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
        {personal.name}
      </p>
      <p style={{ fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)', color: 'var(--text-secondary)', marginBottom: '0.9rem', lineHeight: 1.4 }}>
        {personal.title}
      </p>

      {/* Availability badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: 'var(--accent-lite)', border: '1px solid var(--border-accent)',
        borderRadius: 999, padding: '0.3rem 0.75rem',
        fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)', fontWeight: 600, color: 'var(--accent-text)',
        marginBottom: '1.5rem', width: 'fit-content',
      }}>
        <motion.span
          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', flexShrink: 0 }}
          animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {personal.availability}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.25rem' }} />

      {/* Section nav */}
      <nav aria-label="Section navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? 'true' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                padding: '0.3rem 0',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isActive ? 'var(--accent)' : 'transparent',
                border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--text-muted)'}`,
                flexShrink: 0, transition: 'all 0.2s ease',
              }} />
              {label}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '1.25rem 0' }} />

      {/* Social icons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
        {SOCIALS.map(({ Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--border-accent)';
              el.style.color       = 'var(--accent)';
              el.style.background  = 'var(--accent-lite)';
              el.style.transform   = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--border)';
              el.style.color       = 'var(--text-muted)';
              el.style.background  = 'var(--bg-primary)';
              el.style.transform   = 'translateY(0)';
            }}
          >
            <Icon size={16} aria-hidden="true" />
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href={`mailto:${personal.email}`}
        className="btn-primary"
        style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.6rem 1rem' }}
      >
        Let&apos;s Talk
      </a>

      {/* Theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
