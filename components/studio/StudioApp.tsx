'use client';
import dynamic from 'next/dynamic';
import { personal } from '@/lib/data';

const StudioScene = dynamic(() => import('./StudioScene'), { ssr: false });

export default function StudioApp() {
  return (
    <div className="studio">
      <div className="studio-bg" aria-hidden="true" />
      <div className="studio-canvas"><StudioScene /></div>
      <header className="studio-head">
        <p className="studio-eyebrow">PORTFOLIO · 2026</p>
        <h1 className="studio-name">{personal.name}</h1>
        <p className="studio-role">{personal.title}</p>
      </header>
      <p className="studio-hint">DRAG · EXPLORE · A TACTILE STUDIO OF WORK</p>
    </div>
  );
}
