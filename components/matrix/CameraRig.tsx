'use client';
// Street navigation — drive the city like a courier. Wheel/W/S = forward and
// back along the street you're on; A/D, ←/→ or horizontal wheel = turn into a
// side street at a junction (corners auto-turn when the road bends). Mouse
// drag looks around; touch drag drives.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STREETS, LANE_HALF, SPAWN, PORTAL_XS, PORTAL_Z } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

// nearest point on the street network
function clampToNetwork(x: number, z: number) {
  let bx = x, bz = z, bd = Infinity;
  for (const s of STREETS) {
    const ax = s.a[0], az = s.a[1], dx = s.b[0] - ax, dz = s.b[1] - az;
    const len2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + dx * t, pz = az + dz * t;
    const d = (x - px) * (x - px) + (z - pz) * (z - pz);
    if (d < bd) { bd = d; bx = px; bz = pz; }
  }
  return { x: bx, z: bz, dist: Math.sqrt(bd) };
}

const onRoad = (x: number, z: number) => clampToNetwork(x, z).dist <= LANE_HALF;

export default function CameraRig({
  reduced, onFrame,
}: { reduced: boolean; onFrame: (x: number, z: number) => void }) {
  const target = useRef({ x: SPAWN.x, z: SPAWN.z });
  const pos = useRef({ x: SPAWN.x, z: SPAWN.z });
  const heading = useRef({ x: 0, z: -1 });       // cardinal travel direction
  const yaw = useRef(Math.atan2(0, -1));          // visual yaw (lerped)
  const look = useRef({ yaw: 0, pitch: 0 });
  const lookT = useRef({ yaw: 0, pitch: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; touch: boolean } | null>(null);
  const keysFwd = useRef(0);
  const lastTurn = useRef(0);
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    const right = (h: { x: number; z: number }) => ({ x: -h.z, z: h.x });
    const left = (h: { x: number; z: number }) => ({ x: h.z, z: -h.x });

    const tryTurn = (dir: 1 | -1) => {
      const now = performance.now();
      if (now - lastTurn.current < 320) return;
      const h = heading.current;
      const nh = dir === 1 ? right(h) : left(h);
      const t = target.current;
      // forgiving turns: hunt for a junction a few steps behind/ahead too
      for (const off of [0, -2, 2, -4, 4, -6, 6, -8, 8]) {
        const bx = t.x + h.x * off, bz = t.z + h.z * off;
        if (onRoad(bx + nh.x * 5, bz + nh.z * 5)) {
          const snap = clampToNetwork(bx + nh.x * 3, bz + nh.z * 3);
          target.current = { x: snap.x - nh.x * 3, z: snap.z - nh.z * 3 };
          heading.current = nh;
          lastTurn.current = now;
          return;
        }
      }
      // no street that way — turn around instead (U-turn anywhere)
      heading.current = { x: -h.x, z: -h.z };
      lastTurn.current = now;
    };

    const advance = (d: number) => {
      const t = target.current;
      const h = heading.current;
      let nx = t.x + h.x * d, nz = t.z + h.z * d;
      if (onRoad(nx, nz)) {
        const c = clampToNetwork(nx, nz);
        target.current = { x: c.x, z: c.z };
        return;
      }
      // road bends — auto-corner if exactly one side continues
      const r = right(h), l = left(h);
      const rOk = onRoad(t.x + r.x * 4, t.z + r.z * 4);
      const lOk = onRoad(t.x + l.x * 4, t.z + l.z * 4);
      if (rOk !== lOk && d > 0) {
        heading.current = rOk ? r : l;
        const nh = heading.current;
        nx = t.x + nh.x * Math.abs(d); nz = t.z + nh.z * Math.abs(d);
        if (onRoad(nx, nz)) {
          const c = clampToNetwork(nx, nz);
          target.current = { x: c.x, z: c.z };
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) {
        tryTurn(e.deltaX > 0 ? 1 : -1);
      } else {
        advance(e.deltaY * 0.022);
      }
    };
    const kd = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) keysFwd.current = 1;
      else if (['ArrowDown', 's', 'S'].includes(e.key)) keysFwd.current = -1;
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) tryTurn(1);
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) tryTurn(-1);
    };
    const ku = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S'].includes(e.key)) keysFwd.current = 0;
    };
    const pd = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a,button,.mx-hud,.mx-toggle,.mx-slab,.mx-gate')) return;
      drag.current = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
    };
    const pm = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      if (drag.current.touch) {
        // touch drives: vertical = move, horizontal = turn
        advance(-dy * 0.05);
        if (Math.abs(dx) > 42) { tryTurn(dx > 0 ? 1 : -1); drag.current.x = e.clientX; }
        drag.current.y = e.clientY;
      } else {
        lookT.current.yaw = THREE.MathUtils.clamp(lookT.current.yaw - dx * 0.0035, -1.2, 1.2);
        lookT.current.pitch = THREE.MathUtils.clamp(lookT.current.pitch + dy * 0.0028, -0.8, 0.8);
        drag.current = { x: e.clientX, y: e.clientY, touch: false };
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
    // keyboard cruise
    if (keysFwd.current !== 0) {
      const h = heading.current, t = target.current;
      const d = keysFwd.current * dt * 26;
      const nx = t.x + h.x * d, nz = t.z + h.z * d;
      if (onRoad(nx, nz)) {
        const c = clampToNetwork(nx, nz);
        target.current = { x: c.x, z: c.z };
      }
    }

    // damp position
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.2);
    const px = pos.current.x, pz = pos.current.z;
    pos.current.x += (target.current.x - pos.current.x) * k;
    pos.current.z += (target.current.z - pos.current.z) * k;
    scrollBus.speed = Math.hypot(pos.current.x - px, pos.current.z - pz) / Math.max(dt, 1e-4);
    scrollBus.x = pos.current.x;
    scrollBus.z = pos.current.z;
    scrollBus.hx = heading.current.x;
    scrollBus.hz = heading.current.z;

    // free-look recenters when released
    if (!drag.current) {
      lookT.current.yaw *= 1 - Math.min(1, dt * 1.1);
      lookT.current.pitch *= 1 - Math.min(1, dt * 1.1);
    }
    look.current.yaw += (lookT.current.yaw - look.current.yaw) * Math.min(1, dt * 6);
    look.current.pitch += (lookT.current.pitch - look.current.pitch) * Math.min(1, dt * 6);

    // visual yaw chases the cardinal heading (shortest arc)
    const targetYaw = Math.atan2(-heading.current.x, -heading.current.z);
    let dy = targetYaw - yaw.current;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    yaw.current += dy * Math.min(1, dt * (reduced ? 20 : 3.6));

    // portal warp — proximity to any gate ring
    let warp = 0;
    for (const pxg of PORTAL_XS) {
      const ddx = pos.current.x - pxg, ddz = pos.current.z - PORTAL_Z;
      warp = Math.max(warp, Math.exp(-(ddx * ddx + ddz * ddz) / 38));
    }
    scrollBus.warp = reduced ? 0 : warp;

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.set(
      pos.current.x + (reduced ? 0 : pointer.current.x * 0.4),
      2.2 + (reduced ? 0 : -pointer.current.y * 0.3),
      pos.current.z,
    );
    const vy = yaw.current + look.current.yaw + (reduced ? 0 : pointer.current.x * 0.06);
    lookAt.current.set(
      cam.position.x - Math.sin(vy) * 10,
      cam.position.y + look.current.pitch * 9 + (reduced ? 0 : -pointer.current.y * 1),
      cam.position.z - Math.cos(vy) * 10,
    );
    cam.lookAt(lookAt.current);

    const fovTarget = 52 + scrollBus.warp * 30;
    if (Math.abs(cam.fov - fovTarget) > 0.05) {
      cam.fov += (fovTarget - cam.fov) * Math.min(1, dt * 7);
      cam.updateProjectionMatrix();
    }
    // warp flash — the whole frame blows out while crossing a portal
    state.gl.toneMappingExposure = 1 + scrollBus.warp * 1.15;
    onFrame(pos.current.x, pos.current.z);
  });

  return null;
}
