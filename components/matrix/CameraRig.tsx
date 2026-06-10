'use client';
// Horizontal exploration: wheel (any axis), drag, arrow keys and touch all
// drive one damped offset along the world's X axis. No scroll container —
// the world is a place, not a page.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { WORLD_X } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

export function worldPos(offset: number) {
  return offset * WORLD_X;
}

export default function CameraRig({
  reduced, onFrame,
}: { reduced: boolean; onFrame: (offset: number) => void }) {
  const target = useRef(0);     // target offset 0..1
  const current = useRef(0);    // damped offset
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef<{ on: boolean; x: number } | null>(null);
  const keys = useRef(0);

  useEffect(() => {
    const STEP = 0.00022;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current = clamp(target.current + d * STEP);
    };
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.current = down ? 1 : 0;
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.current = down ? -1 : 0;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    const pd = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a,button,.mx-hud,.mx-toggle')) return;
      drag.current = { on: true, x: e.clientX };
    };
    const pm = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (drag.current?.on) {
        const dx = e.clientX - drag.current.x;
        drag.current.x = e.clientX;
        target.current = clamp(target.current - dx * 0.00065);
      }
    };
    const pu = () => { drag.current = null; };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm, { passive: true });
    window.addEventListener('pointerup', pu);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
    };
  }, []);

  useFrame((state, dt) => {
    // keyboard travel
    if (keys.current !== 0) {
      target.current = Math.min(1, Math.max(0, target.current + keys.current * dt * 0.055));
    }
    // damp toward target
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.2);
    const prev = current.current;
    current.current += (target.current - current.current) * k;
    scrollBus.delta = current.current - prev;
    scrollBus.offset = current.current;

    const x = worldPos(current.current);
    const cam = state.camera;
    cam.position.x = x + (reduced ? 0 : pointer.current.x * 0.9);
    cam.position.y = 1.1 + (reduced ? 0 : -pointer.current.y * 0.55);
    cam.position.z = 16;
    cam.lookAt(
      x + (reduced ? 0 : pointer.current.x * 2.2),
      1 + (reduced ? 0 : -pointer.current.y * 1.2),
      -2,
    );
    onFrame(current.current);
  });

  return null;
}
