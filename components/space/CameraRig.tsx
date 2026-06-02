// components/space/CameraRig.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { CURVE } from '@/lib/journeyCurve';

const _pos = new Vector3();
const _look = new Vector3();

export default function CameraRig({
  progressRef, warpLevelRef, frozen,
}: { progressRef: RefObject<number>; warpLevelRef: RefObject<number>; frozen: boolean }) {
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
    const warp = warpLevelRef.current ?? 0;
    let p = progressRef.current ?? 0;
    p = Math.min(1, Math.max(0, p + warp * 0.02));

    // Sit slightly behind the path point and look ahead along the curve.
    CURVE.getPointAt(Math.max(0, p - 0.012), _pos);
    CURVE.getPointAt(Math.min(1, p + 0.03), _look);

    // Drag-to-look + idle parallax shifts where we look (not where we are).
    const px = frozen ? 0 : pointer.current.x;
    const py = frozen ? 0 : pointer.current.y;
    _look.x += px * 6;
    _look.y += -py * 4;

    const k = frozen ? 1 : 0.06;
    cam.position.lerp(_pos, k);
    cam.lookAt(_look);
  });

  return null;
}
