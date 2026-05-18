'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUpRight, FileText } from 'lucide-react';
import { FaLinkedin, FaMedium } from 'react-icons/fa6';
import { personal } from '@/lib/data';

const NAV_LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Education',  href: '#education' },
  { label: 'Contact',    href: '#contact' },
];

const CONTACT_ITEMS = [
  { Icon: Mail,    label: personal.email,           href: `mailto:${personal.email}` },
  { Icon: Phone,   label: personal.phone,           href: `tel:${personal.phone.replace(/\D/g, '')}` },
  { Icon: MapPin,  label: personal.location,        href: undefined },
];

const SOCIAL_ITEMS = [
  { Icon: FaLinkedin, label: 'LinkedIn', href: personal.linkedin },
  { Icon: FaMedium,   label: 'Medium',   href: personal.medium },
  { Icon: FileText,   label: 'Resume',   href: personal.resumeUrl },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as const } },
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer aria-label="Site footer" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Gradient top rule ── */}
      <div
        aria-hidden="true"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent-2) 70%, transparent 100%)',
        }}
      />

      {/* ── Background layer ── */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)',
          position: 'relative',
        }}
      >
        {/* Decorative glow — top-right */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Decorative glow — bottom-left */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '-80px',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-2) 8%, transparent) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>

          {/* ── CTA band ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            style={{
              padding: '5rem 0 4rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <motion.p variants={fadeUp} className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>
              // OPEN TO NEW OPPORTUNITIES
            </motion.p>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: 'var(--text-primary)',
                marginBottom: '1.75rem',
                maxWidth: 620,
              }}
            >
              Let&apos;s build something{' '}
              <span className="text-grad">remarkable.</span>
            </motion.h2>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={`mailto:${personal.email}`}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Get in touch <ArrowUpRight size={15} />
              </a>
              <a
                href={personal.resumeUrl}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                View Resume
              </a>
            </motion.div>
          </motion.div>

          {/* ── Three-column grid ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1.2fr',
              gap: '3rem',
              padding: '3.5rem 0',
              borderBottom: '1px solid var(--border)',
            }}
            className="grid-cols-1 md:grid-cols-3"
          >

            {/* Col 1 — Brand */}
            <motion.div variants={fadeUp}>
              <a
                href="#hero"
                aria-label="Back to top"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--accent)',
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  marginBottom: '0.85rem',
                  lineHeight: 1,
                }}
              >
                VP
              </a>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {personal.name}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {personal.title}
              </p>

              {/* Availability pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'var(--accent-lite)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 999,
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--accent-text)',
                  marginBottom: '1.5rem',
                }}
              >
                <motion.span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                Available for opportunities
              </div>

              {/* Social icons */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {SOCIAL_ITEMS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = 'var(--border-accent)';
                      el.style.color = 'var(--accent)';
                      el.style.background = 'var(--accent-lite)';
                      el.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = 'var(--border)';
                      el.style.color = 'var(--text-muted)';
                      el.style.background = 'var(--bg-primary)';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <s.Icon size={17} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Col 2 — Navigation */}
            <motion.div variants={fadeUp}>
              <p
                className="section-eyebrow"
                style={{ marginBottom: '1.25rem' }}
              >
                NAVIGATION
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {NAV_LINKS.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Col 3 — Contact info */}
            <motion.div variants={fadeUp}>
              <p
                className="section-eyebrow"
                style={{ marginBottom: '1.25rem' }}
              >
                CONTACT
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {CONTACT_ITEMS.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: 'var(--accent-lite)',
                        border: '1px solid var(--border-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    >
                      <item.Icon size={13} aria-hidden="true" />
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          lineHeight: 1.5,
                          paddingTop: '0.2rem',
                          transition: 'color 0.2s ease',
                          wordBreak: 'break-all',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          paddingTop: '0.2rem',
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Bottom bar ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '1.5rem 0',
            }}
          >
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              © {year} {personal.name}. All rights reserved.
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Next.js · React · TypeScript · Tailwind
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
