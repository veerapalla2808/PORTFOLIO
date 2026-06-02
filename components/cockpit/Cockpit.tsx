// components/cockpit/Cockpit.tsx
'use client';
import { DESTINATIONS } from '@/lib/destinations';
import { useWarp } from '@/components/galaxy/WarpController';

const BY_ID = Object.fromEntries(DESTINATIONS.map((d, i) => [d.id, { d, i }]));

// Decorative cockpit overlay: window struts/vignette + a bottom instrument strip.
export default function Cockpit() {
  const { activeSector } = useWarp();
  const cur = BY_ID[activeSector] ?? BY_ID.hero;
  const idx = cur?.i ?? 0;

  return (
    <div className="cockpit" aria-hidden="true">
      {/* window vignette + frame */}
      <div className="cockpit-vignette" />
      <span className="cockpit-corner tl" />
      <span className="cockpit-corner tr" />
      <span className="cockpit-corner bl" />
      <span className="cockpit-corner br" />

      {/* top status rail */}
      <div className="cockpit-top">
        <span className="cockpit-top-dot" /> FLIGHT DECK · ONLINE
        <span className="cockpit-top-sep" />
        SYS NOMINAL
      </div>

      {/* bottom instrument strip */}
      <div className="cockpit-dash">
        <div className="dash-cell">
          <span className="dash-k">DESTINATION</span>
          <span className="dash-v">{cur?.d.code ?? '—'}</span>
        </div>
        <div className="dash-cell">
          <span className="dash-k">WAYPOINT</span>
          <span className="dash-v">{String(idx).padStart(2, '0')} / {String(DESTINATIONS.length - 1).padStart(2, '0')}</span>
        </div>
        <div className="dash-reticle">
          <span className="dash-reticle-ring" />
          <span className="dash-reticle-cross" />
        </div>
        <div className="dash-cell">
          <span className="dash-k">VELOCITY</span>
          <span className="dash-v">0.42 <small>c</small></span>
        </div>
        <div className="dash-cell">
          <span className="dash-k">SYSTEM</span>
          <span className="dash-v">SOL</span>
        </div>
      </div>
    </div>
  );
}
