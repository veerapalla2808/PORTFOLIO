// components/space/CameraRig.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { JOURNEY_DEPTH } from '@/lib/journey';

export default function CameraRig({
  scrollProgress, warpLevelRef, frozen,
}: { scrollProgress: RefObject<number>; warpLevelRef: RefObject<number>; frozen: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const sway = useRef(0);

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

  useFrame((state, dt) => {
    const cam = state.camera;
    const p = scrollProgress.current ?? 0;
    const warp = warpLevelRef.current ?? 0;

    // Fly forward along -z with the journey; warp overshoots a little.
    // Start a few units back so the first station sits ahead of the camera.
    const targetZ = 6 - p * JOURNEY_DEPTH - warp * 6;
    const k = frozen ? 1 : 0.08;
    cam.position.z += (targetZ - cam.position.z) * k;

    if (!frozen) {
      sway.current += dt;
      const px = pointer.current.x * 1.6 + Math.sin(sway.current * 0.3) * 0.5;
      const py = -pointer.current.y * 1.0 + Math.cos(sway.current * 0.24) * 0.3;
      cam.position.x += (px - cam.position.x) * 0.05;
      cam.position.y += (py - cam.position.y) * 0.05;
      cam.lookAt(cam.position.x * 0.4, cam.position.y * 0.4, cam.position.z - 12);
    } else {
      cam.position.x = 0; cam.position.y = 0;
      cam.lookAt(0, 0, cam.position.z - 12);
    }
  });

  return null;
}
