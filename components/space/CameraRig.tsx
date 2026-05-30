// components/space/CameraRig.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';

export default function CameraRig({
  cameraZRef, warpLevelRef, frozen,
}: { cameraZRef: RefObject<number>; warpLevelRef: RefObject<number>; frozen: boolean }) {
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
    const warp = warpLevelRef.current ?? 0;
    // Journey z (eased per-station) sits a few units back, with a small warp overshoot.
    const targetZ = (cameraZRef.current ?? 0) + 7 - warp * 6;
    const k = frozen ? 1 : 0.07;
    cam.position.z += (targetZ - cam.position.z) * k;

    if (!frozen) {
      sway.current += dt;
      const px = pointer.current.x * 1.5 + Math.sin(sway.current * 0.3) * 0.4;
      const py = -pointer.current.y * 0.9 + Math.cos(sway.current * 0.24) * 0.25;
      cam.position.x += (px - cam.position.x) * 0.04;
      cam.position.y += (py - cam.position.y) * 0.04;
      cam.lookAt(cam.position.x * 0.5, cam.position.y * 0.5, cam.position.z - 14);
    } else {
      cam.position.x = 0; cam.position.y = 0;
      cam.lookAt(0, 0, cam.position.z - 14);
    }
  });

  return null;
}
