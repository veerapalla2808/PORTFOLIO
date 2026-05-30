// components/galaxy/GuideAvatar.tsx
'use client';
// One procedural SVG "AI construct" emblem; `variant` (0..7) changes geometry + hue.
export default function GuideAvatar({ variant, size = 44 }: { variant: number; size?: number }) {
  const spokes = 3 + (variant % 5);            // 3..7
  const rot = (variant * 24) % 360;
  const hue = variant % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)';
  // Round to fixed precision so SSR and client serialize identical strings
  // (avoids a float-precision hydration mismatch).
  const pts = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * Math.PI * 2 + (rot * Math.PI) / 180;
    return [
      Math.round((50 + Math.cos(a) * 34) * 100) / 100,
      Math.round((50 + Math.sin(a) * 34) * 100) / 100,
    ];
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke={hue} strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeOpacity="0.4" />
      {pts.map(([x, y], i) => (
        <line key={i} x1="50" y1="50" x2={x} y2={y} stroke={hue} strokeWidth="1.5" strokeOpacity="0.7" />
      ))}
      {pts.map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r="3.5" fill={hue} />)}
      <circle cx="50" cy="50" r={6 + (variant % 3)} fill="var(--accent)" />
    </svg>
  );
}
