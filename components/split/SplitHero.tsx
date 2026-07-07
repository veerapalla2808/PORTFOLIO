'use client';
// THE SPLIT STACK — hero slice.
// Two full-viewport layers with identical scaffolding; the light layer is
// clipped at a draggable seam. The name is rendered in both layers at the
// same position, so moving the seam "fills" it from either side.
import { useEffect, useRef } from 'react';
import { personal } from '@/lib/data';

function useSeam(stageRef: React.RefObject<HTMLElement | null>, seamRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    const seam = seamRef.current;
    if (!stage || !seam) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let split = 55;          // percent
    let target = split;
    let interacted = false;
    let raf = 0;
    const t0 = performance.now();

    const vertical = () => window.matchMedia('(max-width: 760px)').matches;

    const apply = (v: number) => {
      stage.style.setProperty('--split', `${v}%`);
      seam.setAttribute('aria-valuenow', String(Math.round(v)));
    };

    const tick = (now: number) => {
      // idle breathing until the first interaction
      if (!interacted && !reduced) {
        target = 55 + Math.sin((now - t0) / 1600) * 2.2;
      }
      split += (target - split) * 0.14;
      apply(split);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const toPct = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const v = vertical()
        ? ((e.clientY - r.top) / r.height) * 100
        : ((e.clientX - r.left) / r.width) * 100;
      return Math.min(88, Math.max(12, v));
    };

    const onDown = (e: PointerEvent) => {
      interacted = true;
      seam.setPointerCapture(e.pointerId);
      target = toPct(e);
    };
    const onMove = (e: PointerEvent) => {
      if (!seam.hasPointerCapture(e.pointerId)) return;
      target = toPct(e);
    };
    const onDbl = () => { target = 55; };
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 12 : 4;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { interacted = true; target = Math.max(12, target - step); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { interacted = true; target = Math.min(88, target + step); }
      else if (e.key === 'Home') { interacted = true; target = 12; }
      else if (e.key === 'End') { interacted = true; target = 88; }
      else return;
      e.preventDefault();
    };

    seam.addEventListener('pointerdown', onDown);
    seam.addEventListener('pointermove', onMove);
    seam.addEventListener('dblclick', onDbl);
    seam.addEventListener('keydown', onKey);
    if (reduced) apply(55);

    return () => {
      cancelAnimationFrame(raf);
      seam.removeEventListener('pointerdown', onDown);
      seam.removeEventListener('pointermove', onMove);
      seam.removeEventListener('dblclick', onDbl);
      seam.removeEventListener('keydown', onKey);
    };
  }, [stageRef, seamRef]);
}

/* the scaffold rendered into BOTH layers — copy differs per side focus */
function Pane({ side }: { side: 'front' | 'back' }) {
  const front = side === 'front';
  return (
    <div className="pane" aria-hidden={!front}>
      <div className="pane-top">
        <span className={`side-tag ${front ? 'side-tag--near' : 'side-tag--far'}`}>
          <b>THE INTERFACE</b> · REACT + TYPESCRIPT
        </span>
        <span className={`side-tag ${front ? 'side-tag--far' : 'side-tag--near'}`}>
          JAVA 17 + SPRING BOOT · <b>THE SYSTEM</b>
        </span>
      </div>

      <div className="pane-mid">
        <div className="wing wing--left">
          <span className="wing-label">01 · WHAT PEOPLE SEE</span>
          <span className="num">15+ shared components</span>
          interfaces that load visibly faster — code-split, memoized, accessible.
        </div>
        <div className="name-block">
          <h1>Veera Palla</h1>
          <p className="role">Full-Stack Developer · Both Sides of the Wire</p>
        </div>
        <div className="wing wing--right">
          <span className="wing-label">02 · WHAT THE SYSTEM DOES</span>
          <span className="num">3,000 req/s held</span>
          microservices with circuit breakers, Kafka streams and canary deploys.
        </div>
      </div>

      <div className="pane-bottom">
        <div className="chips">
          {['React', 'TypeScript', 'Redux Toolkit', 'Java 17', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'AWS', 'Kubernetes'].map(c => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
        <div className="deck">
          <span className="deck-note">
            4 YEARS · WALMART / SOUTHWEST AIRLINES / FLIPKART · {personal.location.toUpperCase()}
          </span>
          <div className="deck-ctas">
            <a className="cta cta--solid" href={`mailto:${personal.email}`}>Say hello</a>
            <a className="cta cta--ghost" href={personal.resumeUrl} download>Resume</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SplitHero() {
  const stageRef = useRef<HTMLElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  useSeam(stageRef, seamRef);

  return (
    <main className="stage" ref={stageRef}>
      <div className="layer layer-back"><Pane side="back" /></div>
      <div className="layer layer-front"><Pane side="front" /></div>

      <div
        className="seam"
        ref={seamRef}
        role="separator"
        aria-label="Drag to slide between the interface and the system"
        aria-orientation="vertical"
        aria-valuemin={12}
        aria-valuemax={88}
        aria-valuenow={55}
        tabIndex={0}
      >
        <div className="seam-hit" />
        <div className="seam-knob">↔</div>
        <div className="seam-hint">DRAG THE SEAM — ONE DEVELOPER, BOTH SIDES</div>
      </div>

      <a className="scroll-cue" href="#work" aria-label="Scroll to the work">
        SCROLL <span>▾</span>
      </a>
    </main>
  );
}
