// components/cockpit/SpaceMount.tsx
'use client';
import dynamic from 'next/dynamic';

// WebGL is client-only; lazy-load so three.js stays out of the initial chunk.
const SpaceScene = dynamic(() => import('./SpaceScene'), { ssr: false });

export default function SpaceMount() {
  return <SpaceScene />;
}
