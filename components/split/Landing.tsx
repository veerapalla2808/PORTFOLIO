'use client';
// The chooser. Two doors over the particle field — Front-End (light) and
// Back-End (dark, the default). Hovering a door tints the particles.
import { landing, now } from '@/lib/data';

function Mark() {
  return (
    <span className="mark" aria-label="Veera Palla">
      <span>V</span><span className="mark-seam" aria-hidden="true" /><span>P</span>
    </span>
  );
}

export default function Landing({
  onChoose, onHover,
}: {
  onChoose: (v: 'front' | 'back') => void;
  onHover: (t: 'light' | 'dark' | null) => void;
}) {
  return (
    <div className="landing">
      <header className="landing-top">
        <Mark />
        <span className="status status--dark">{now.status}</span>
      </header>

      <div className="landing-mid">
        <p className="landing-kicker">{landing.name}</p>
        <h1 className="landing-title">{landing.role}</h1>
        <p className="landing-line">{landing.line}</p>

        <div className="doors">
          <button
            className="door door--front"
            onClick={() => onChoose('front')}
            onMouseEnter={() => onHover('light')}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover('light')}
            onBlur={() => onHover(null)}
          >
            <span className="door-side">FRONT-END</span>
            <span className="door-kicker">The Interface · Light</span>
            <span className="door-teaser">{landing.frontTeaser}</span>
            <span className="door-go">Enter left ←</span>
          </button>

          <button
            className="door door--back is-default"
            onClick={() => onChoose('back')}
            onMouseEnter={() => onHover('dark')}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover('dark')}
            onBlur={() => onHover(null)}
          >
            <span className="door-tag">DEFAULT</span>
            <span className="door-side">BACK-END</span>
            <span className="door-kicker">The System · Dark</span>
            <span className="door-teaser">{landing.backTeaser}</span>
            <span className="door-go">Enter right →</span>
          </button>
        </div>

        <p className="landing-hint">{landing.hint}</p>
      </div>

      <footer className="landing-foot">
        <span>Full-stack · Walmart / Southwest / Flipkart</span>
        <span>Pick a side — you can switch anytime</span>
      </footer>
    </div>
  );
}
