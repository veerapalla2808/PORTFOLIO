'use client';
// Contact form → POST /api/contact (Resend). Inline validation, honeypot,
// and clear sending / sent / error states. Theme-agnostic (styled by tokens).
import { useState } from 'react';
import { personal } from '@/lib/data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Couldn’t send your message.');
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="cform cform--done" role="status">
        <span className="cform-check" aria-hidden="true">✓</span>
        <h3>Message on its way.</h3>
        <p>Thanks — I’ll reply from {personal.email} soon.</p>
        <button className="btn btn--ghost" type="button" onClick={() => setStatus('idle')}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={onSubmit} noValidate>
      {/* honeypot — hidden from humans */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="cform-hp" aria-hidden="true" />

      <div className="cform-row">
        <label className="cform-field">
          <span>Your name</span>
          <input name="name" type="text" required maxLength={120} placeholder="Jane Doe" autoComplete="name" />
        </label>
        <label className="cform-field">
          <span>Your email</span>
          <input name="email" type="email" required maxLength={200} placeholder="jane@company.com" autoComplete="email" />
        </label>
      </div>
      <label className="cform-field">
        <span>Message</span>
        <textarea name="message" required maxLength={4000} rows={4} placeholder="What are you building? What role? Say hello…" />
      </label>

      <div className="cform-foot">
        <button className="btn btn--solid cform-send" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {status === 'error' && <p className="cform-error" role="alert">{error}</p>}
        <span className="cform-alt">or email <a href={`mailto:${personal.email}`}>{personal.email}</a></span>
      </div>
    </form>
  );
}
