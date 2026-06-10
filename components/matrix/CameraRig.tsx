'use client';
// Flight camera — one damped offset flies you along a 3D path (forward, side-
// to-side AND up/down). Wheel/arrows travel; dragging looks around freely;
// passing a portal kicks the FOV and floods the warp bus.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { samplePath, PORTALS } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

export default function CameraRig({
  reduced, onFrame,
}: { reduced: boolean; onFrame: (offset: number) => void }) {
  const target = useRef(0);
  const current = useRef(0);
  const look = useRef({ yaw: 0, pitch: 0 });      // free-look from dragging
  const lookT = useRef({ yaw: 0, pitch: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const keys = useRef(0);
  const pos = useRef({ x: 0, y: 2, z: 40 });
  const ahead = useRef({ x: 0, y: 2, z: 0 });
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    const STEP = 0.00016;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current = clamp(target.current + d * STEP);
    };
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (['ArrowRight', 'ArrowUp', 'd', 'D', 'w', 'W'].includes(e.key)) keys.current = down ? 1 : 0;
      else if (['ArrowLeft', 'ArrowDown', 'a', 'A', 's', 'S'].includes(e.key)) keys.current = down ? -1 : 0;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    const pd = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a,button,.mx-hud,.mx-toggle,.mx-slab,.mx-gate')) return;
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const pm = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (drag.current) {
        lookT.current.yaw = THREE.MathUtils.clamp(lookT.current.yaw - (e.clientX - drag.current.x) * 0.0035, -1.1, 1.1);
        lookT.current.pitch = THREE.MathUtils.clamp(lookT.current.pitch + (e.clientY - drag.current.y) * 0.0028, -0.8, 0.8);
        drag.current = { x: e.clientX, y: e.clientY };
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
    if (keys.current !== 0) {
      target.current = Math.min(1, Math.max(0, target.current + keys.current * dt * 0.045));
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    const prev = current.current;
    current.current += (target.current - current.current) * k;
    scrollBus.delta = current.current - prev;
    scrollBus.offset = current.current;

    // when idle, free-look slowly recenters
    if (!drag.current) {
      lookT.current.yaw *= 1 - Math.min(1, dt * 0.8);
      lookT.current.pitch *= 1 - Math.min(1, dt * 0.8);
    }
    look.current.yaw += (lookT.current.yaw - look.current.yaw) * Math.min(1, dt * 6);
    look.current.pitch += (lookT.current.pitch - look.current.pitch) * Math.min(1, dt * 6);

    // portal warp — gaussian proximity to any gate
    let warp = 0;
    for (const p of PORTALS) {
      const d = (current.current - p.o) / 0.018;
      warp = Math.max(warp, Math.exp(-d * d));
    }
    scrollBus.warp = reduced ? 0 : warp;

    samplePath(current.current, pos.current);
    samplePath(Math.min(1, current.current + 0.035), ahead.current);

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.set(
      pos.current.x + (reduced ? 0 : pointer.current.x * 0.5),
      pos.current.y + (reduced ? 0 : -pointer.current.y * 0.35),
      pos.current.z,
    );
    // look ahead along the path, bent by free-look
    const dirX = ahead.current.x - pos.current.x;
    const dirY = ahead.current.y - pos.current.y;
    const dirZ = ahead.current.z - pos.current.z;
    const yaw = look.current.yaw + (reduced ? 0 : pointer.current.x * 0.07);
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    lookAt.current.set(
      cam.position.x + dirX * cosY - dirZ * sinY,
      cam.position.y + dirY + look.current.pitch * 12 + (reduced ? 0 : -pointer.current.y * 1.2),
      cam.position.z + dirX * sinY + dirZ * cosY,
    );
    cam.lookAt(lookAt.current);

    const fovTarget = 52 + scrollBus.warp * 22;
    if (Math.abs(cam.fov - fovTarget) > 0.05) {
      cam.fov += (fovTarget - cam.fov) * Math.min(1, dt * 7);
      cam.updateProjectionMatrix();
    }
    // warp flash — the whole frame brightens while crossing a portal
    state.gl.toneMappingExposure = 1 + scrollBus.warp * 0.75;
    onFrame(current.current);
  });

  return null;
}
