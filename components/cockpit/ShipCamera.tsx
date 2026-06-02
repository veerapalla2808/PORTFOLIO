// components/cockpit/ShipCamera.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { DESTINATIONS, DEST_Z } from '@/lib/destinations';

const APPROACH = 36;   // how far in front of a destination the ship sits
const N = DESTINATIONS.length;
const OFFX = DESTINATIONS.map(d => d.offset[0]);
const OFFY = DESTINATIONS.map(d => d.offset[1]);
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function ShipCamera({
  progressRef, frozen,
}: { progressRef: RefObject<number>; frozen: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (frozen) return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      pointer.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [frozen]);

  useFrame((state) => {
    const cam = state.camera;
    const p = Math.min(1, Math.max(0, progressRef.current ?? 0));
    const f = p * (N - 1);
    const i = Math.min(N - 1, Math.floor(f));
    const j = Math.min(N - 1, i + 1);
    const t = f - i;

    const zCur = lerp(DEST_Z[i], DEST_Z[j], t) + APPROACH;
    const ox = lerp(OFFX[i], OFFX[j], t);
    const oy = lerp(OFFY[i], OFFY[j], t);

    const px = frozen ? 0 : pointer.current.x;
    const py = frozen ? 0 : pointer.current.y;

    const k = frozen ? 1 : 0.055;
    cam.position.z += (zCur - cam.position.z) * k;
    cam.position.x += ((ox * 0.18 + px * 4) - cam.position.x) * 0.05;
    cam.position.y += ((oy * 0.18 + py * -3) - cam.position.y) * 0.05;

    // Look toward the upcoming planet, biased forward out the window.
    cam.lookAt(ox * 0.5 + px * 8, oy * 0.5 + py * -5, cam.position.z - 80);
  });

  return null;
}
