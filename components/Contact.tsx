// components/Contact.tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import emailjs from "@emailjs/browser";
import { personal } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import MagneticButton from "./ui/MagneticButton";
import { Mail, BookOpen, Phone } from "lucide-react";
import { FaLinkedin as Linkedin } from "react-icons/fa6";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

const CONTACT_LINKS = [
  {
    icon: <Mail size={20} aria-hidden="true" />,
    label: "Email",
    value: personal.email,
    href: `mailto:${personal.email}`,
    display: personal.email,
  },
  {
    icon: <Linkedin size={20} aria-hidden="true" />,
    label: "LinkedIn",
    value: "Veera Palla",
    href: personal.linkedin,
    display: "linkedin.com/in/veera-palla",
  },
  {
    icon: <BookOpen size={20} aria-hidden="true" />,
    label: "Medium",
    value: "@veera.palla919",
    href: personal.medium,
    display: "medium.com/@veera.palla919",
  },
  {
    icon: <Phone size={20} aria-hidden="true" />,
    label: "Phone",
    value: personal.phone,
    href: `tel:${personal.phone.replace(/\D/g, "")}`,
    display: personal.phone,
  },
];

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Please enter a valid email address.";
  if (!form.message.trim()) errors.message = "Message is required.";
  else if (form.message.trim().length < 10)
    errors.message = "Message must be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-card",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("sending");
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { name: form.name, email: form.email, message: form.message, title: `Portfolio inquiry from ${form.name}` },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#00f2ff] focus:border-transparent ${
      errors[field] ? "border-red-500/60" : "border-white/10"
    }`;

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact Veera Palla"
      className="container-wide"
    >
      <div className="section-label">06 // Contact</div>
      <h2 className="section-title">Let&apos;s Build Something.</h2>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Contact links */}
        <div className="lg:w-[42%] flex flex-col gap-4">
          {CONTACT_LINKS.map((link) => (
            <MagneticButton
              key={link.label}
              href={link.href}
              aria-label={`Contact via ${link.label}: ${link.display}`}
              className="contact-card glass-card flex items-center gap-5 p-5 min-h-[44px] w-full text-left"
            >
              <div
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ background: "rgba(0,242,255,0.08)", color: "#00f2ff" }}
              >
                {link.icon}
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-0.5 font-bold">
                  {link.label}
                </div>
                <div className="text-sm text-white font-medium">{link.display}</div>
              </div>
            </MagneticButton>
          ))}
        </div>

        {/* EmailJS form */}
        <form
          onSubmit={handleSubmit}
          className="lg:flex-1 flex flex-col gap-5"
          noValidate
          aria-label="Send a message"
        >
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              aria-required="true"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
              className={inputClass("name")}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              aria-required="true"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              className={inputClass("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="contact-message" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Message <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="What would you like to build together?"
              required
              aria-required="true"
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-invalid={!!errors.message}
              className={`${inputClass("message")} resize-none`}
            />
            {errors.message && (
              <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.message}
              </p>
            )}
          </div>

          {/* Status announcement */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {status === "success" && "Message sent successfully. Thank you!"}
            {status === "error" && "Failed to send message. Please try again or email directly."}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-4 rounded-full text-sm font-bold text-[#00f2ff] border border-[#00f2ff]/40 hover:bg-[#00f2ff]/10 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "sending" && (
              <span
                className="w-4 h-4 border-2 border-[#00f2ff]/30 border-t-[#00f2ff] rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {status === "idle" && "Send Message →"}
            {status === "sending" && "Sending…"}
            {status === "success" && "✓ Message Sent!"}
            {status === "error" && "Failed — try again"}
          </button>

          {status === "success" && (
            <p className="text-xs text-green-400 text-center" role="status">
              Thanks! I&apos;ll get back to you within 24 hours.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-red-400 text-center" role="alert">
              Something went wrong. Email me directly at{" "}
              <a href={`mailto:${personal.email}`} className="underline text-[#00f2ff]">
                {personal.email}
              </a>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
