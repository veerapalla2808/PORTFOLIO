// components/three/CameraRig.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';

export default function CameraRig({
  scrollProgress,
  frozen,
}: {
  scrollProgress: RefObject<number>;
  frozen: boolean;
}) {
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

  // `state.camera` comes from the useFrame callback argument (the mutable R3F
  // scene graph), not a hook return value, so mutating it each frame is correct.
  useFrame((state) => {
    if (frozen) return;
    const p = scrollProgress.current ?? 0;
    const cam = state.camera;
    // Dolly from z=6 (top) to z=3.2 (bottom); orbit slightly with scroll.
    const targetZ = 6 - p * 2.8;
    const targetX = pointer.current.x * 0.6;
    const targetY = -pointer.current.y * 0.4 + p * 0.5;
    cam.position.x += (targetX - cam.position.x) * 0.05;
    cam.position.y += (targetY - cam.position.y) * 0.05;
    cam.position.z += (targetZ - cam.position.z) * 0.05;
    cam.lookAt(0, 0, 0);
  });

  return null;
}
