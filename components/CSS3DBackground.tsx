// components/CSS3DBackground.tsx
'use client';

const SHAPES = [
  { size: 220, top: '20%', left: '15%', dur: 22, delay: 0 },
  { size: 160, top: '60%', left: '70%', dur: 28, delay: -6 },
  { size: 280, top: '70%', left: '25%', dur: 34, delay: -12 },
];

export default function CSS3DBackground({ frozen }: { frozen: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        perspective: '900px',
        background: 'var(--bg-primary)',
      }}
    >
      <style>{`
        @keyframes css3d-spin {
          from { transform: rotate3d(1,1,0,0deg); }
          to   { transform: rotate3d(1,1,0,360deg); }
        }
      `}</style>
      {SHAPES.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '24%',
            transformStyle: 'preserve-3d',
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-2))',
            opacity: 0.18,
            filter: 'blur(2px)',
            animation: frozen
              ? 'none'
              : `css3d-spin ${s.dur}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
