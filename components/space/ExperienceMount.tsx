// components/space/ExperienceMount.tsx
'use client';
import dynamic from 'next/dynamic';

// WebGL is client-only; lazy-load so three.js stays out of the initial chunk.
const Experience = dynamic(() => import('./Experience'), { ssr: false });

export default function ExperienceMount() {
  return <Experience />;
}
