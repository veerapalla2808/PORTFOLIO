// app/api/contact/route.ts — contact form handler (Resend).
// Validates input, rejects bots via a honeypot, and emails the message to
// CONTACT_TO_EMAIL with the visitor set as reply-to.
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.trim().slice(0, max) : '');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // honeypot — real users never fill this hidden field
  if (clean(body.company, 200)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 4000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Please fill in your name, email and a message.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email address doesn’t look right.' }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'The form isn’t configured yet. Please email me directly for now.' },
      { status: 503 },
    );
  }

  const to = process.env.CONTACT_TO_EMAIL || 'veerapalla8@gmail.com';
  const resend = new Resend(key);

  try {
    const { error } = await resend.emails.send({
      // onboarding@resend.dev works for testing; swap for a verified domain in prod
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
          <p style="white-space:pre-wrap;margin:0 0 16px">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
          <p style="margin:0;color:#555;font-size:14px">
            From <strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;<br/>
            Sent from your portfolio contact form.
          </p>
        </div>`,
    });

    if (error) {
      return NextResponse.json({ error: 'Couldn’t send right now. Please try again or email me directly.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Something went wrong sending your message.' }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}
