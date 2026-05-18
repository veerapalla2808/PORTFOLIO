// components/Contact.tsx
'use client';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import emailjs from '@emailjs/browser';
import { personal } from '@/lib/data';

import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Link2, FileText, PhoneCall } from 'lucide-react';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

interface FloatFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  required?: boolean;
}

function FloatField({ id, label, type = 'text', value, onChange, error, multiline, required }: FloatFieldProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  const sharedStyle: React.CSSProperties = {
    width: '100%',
    padding: '1.5rem 0.9rem 0.5rem',
    background: 'var(--bg-card)',
    border: `1px solid ${error ? '#ef4444' : focused ? 'var(--border-accent)' : 'var(--border)'}`,
    borderRadius: 8,
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: multiline ? 'vertical' : undefined,
    minHeight: multiline ? 120 : undefined,
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          left: '0.9rem',
          top: lifted ? '0.4rem' : '0.9rem',
          fontSize: lifted ? '0.65rem' : '0.9rem',
          color: error ? '#ef4444' : focused ? 'var(--accent)' : 'var(--text-muted)',
          fontWeight: lifted ? 600 : 400,
          letterSpacing: lifted ? '0.05em' : 0,
          textTransform: lifted ? 'uppercase' : 'none',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {label}{required && ' *'}
      </label>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={required}
          style={sharedStyle}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={required}
          style={sharedStyle}
        />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [status,  setStatus]  = useState<FormStatus>('idle');

  const CONTACT_LINKS = [
    { Icon: Mail,      label: 'Email',    value: personal.email,    href: `mailto:${personal.email}` },
    { Icon: Link2,     label: 'LinkedIn', value: 'veera-palla',     href: personal.linkedin },
    ...(personal.medium ? [{ Icon: FileText, label: 'Medium', value: '@veera.palla919', href: personal.medium }] : []),
    ...(personal.phone  ? [{ Icon: PhoneCall, label: 'Phone', value: personal.phone, href: `tel:${personal.phone}` }] : []),
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: name, from_email: email, message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section-bg-primary">
      <div className="container-wide">
        <SectionTransition
          number="006"
          eyebrow="CONTACT"
          title={<>Let&apos;s <span className="text-grad">work together.</span></>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}
               className="grid-cols-1 md:grid-cols-2">

            {/* Contact links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {CONTACT_LINKS.map(link => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  variants={fadeUpVariant}
                  className="card-base"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    textDecoration: 'none',
                  }}
                  whileHover={{ y: -2, borderColor: 'var(--border-accent)', boxShadow: 'var(--shadow-hover)' }}
                >
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: 10,
                    background: 'var(--accent-lite)',
                    border: '1px solid var(--border-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}>
                    <link.Icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{link.label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{link.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Form */}
            <motion.form
              variants={fadeUpVariant}
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              <FloatField id="cf-name"    label="Your Name"     value={name}    onChange={setName}    error={errors.name}    required />
              <FloatField id="cf-email"   label="Email Address" type="email" value={email}   onChange={setEmail}   error={errors.email}   required />
              <FloatField id="cf-message" label="Message"       value={message} onChange={setMessage} error={errors.message} required multiline />

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {status === 'sending' ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                    Sending...
                  </>
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    role="status" aria-live="polite"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}
                  >
                    <CheckCircle size={16} /> Message sent! I&apos;ll be in touch soon.
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    role="alert"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}
                  >
                    <AlertCircle size={16} /> Something went wrong. Please try again.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
