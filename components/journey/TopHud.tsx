// components/journey/TopHud.tsx
'use client';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import { useWarp } from '@/components/galaxy/WarpController';

export default function TopHud() {
  const { warpTo } = useWarp();
  return (
    <div className="top-hud">
      <button className="top-hud-logo" onClick={() => warpTo('hero')} aria-label="Back to start">
        <Image src="/veera-logo.png" alt="Veera Palla" width={40} height={40} priority />
      </button>
      <ThemeToggle />
    </div>
  );
}
