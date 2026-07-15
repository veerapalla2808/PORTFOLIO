'use client';
// The chooser. Two doors over the particle field — Front-End (light) and
// Back-End (dark, the default). Big typed title; the doors slide in from the
// left and right; hovering a door tints the particles.
import { landing, now } from '@/lib/data';
import { Typed, Icon } from './ui';

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
        <p className="landing-kicker landing-fade">{landing.name}</p>
        <Typed as="h1" className="landing-title" text={landing.role} speed={14} />
        <p className="landing-line landing-fade landing-fade-2">{landing.line}</p>

        <div className="doors">
          <button
            className="door door--front door--slide-l"
            onClick={() => onChoose('front')}
            onMouseEnter={() => onHover('light')}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover('light')}
            onBlur={() => onHover(null)}
          >
            <span className="door-ico"><Icon name="palette" /></span>
            <span className="door-side">FRONT-END</span>
            <span className="door-kicker">The Interface · Light</span>
            <span className="door-teaser">{landing.frontTeaser}</span>
            <span className="door-go">Enter left <Icon name="west" /></span>
          </button>

          <button
            className="door door--back door--slide-r is-default"
            onClick={() => onChoose('back')}
            onMouseEnter={() => onHover('dark')}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover('dark')}
            onBlur={() => onHover(null)}
          >
            <span className="door-tag">DEFAULT</span>
            <span className="door-ico"><Icon name="terminal" /></span>
            <span className="door-side">BACK-END</span>
            <span className="door-kicker">The System · Dark</span>
            <span className="door-teaser">{landing.backTeaser}</span>
            <span className="door-go">Enter right <Icon name="east" /></span>
          </button>
        </div>

        <p className="landing-hint landing-fade landing-fade-3">{landing.hint}</p>
      </div>

      <footer className="landing-foot landing-fade landing-fade-3">
        <span>Full-stack · Walmart / Southwest / Flipkart</span>
        <span>Pick a side — you can switch anytime</span>
      </footer>
    </div>
  );
}
