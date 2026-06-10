'use client';
// Street navigation v4 — wheel/W/S drives, A/D or ◀▶ turns (forgiving
// junction snap, U-turn anywhere). Touch: horizontal swipe pans the camera
// smoothly, vertical swipe drives. On-screen D-pad commands and the
// auto-drive route (Continue button) flow in through scrollBus.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STREETS, LANE_HALF, SPAWN, PORTAL_XS, PORTAL_Z, DISTRICT_PORTALS, HUB } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

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
  const heading = useRef({ x: 0, z: -1 });
  const yaw = useRef(Math.atan2(0, -1));
  const look = useRef({ yaw: 0, pitch: 0 });
  const lookT = useRef({ yaw: 0, pitch: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; touch: boolean } | null>(null);
  const keysFwd = useRef(0);
  const lastTurn = useRef(0);
  const lookAt = useRef(new THREE.Vector3());
  const flight = useRef(0);
  const flightPos = useRef(new THREE.Vector3());
  const flightLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const right = (h: { x: number; z: number }) => ({ x: -h.z, z: h.x });
    const left = (h: { x: number; z: number }) => ({ x: h.z, z: -h.x });
    const cancelRoute = () => { scrollBus.route.length = 0; };

    const tryTurn = (dir: 1 | -1) => {
      const now = performance.now();
      if (now - lastTurn.current < 320) return;
      const h = heading.current;
      const nh = dir === 1 ? right(h) : left(h);
      const t = target.current;
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
      heading.current = { x: -h.x, z: -h.z }; // U-turn anywhere
      lastTurn.current = now;
    };

    const advance = (d: number) => {
      const t = target.current;
      const h = heading.current;
      let nx = t.x + h.x * d, nz = t.z + h.z * d;
      if (onRoad(nx, nz)) {
        const c = clampToNetwork(nx, nz);
        // corner wedge: the clamp can snap back onto the street BEHIND us and
        // eat the motion — when that stalls progress, glide onto the street
        // we're actually trying to ride
        const progressed = Math.abs(c.x - t.x) + Math.abs(c.z - t.z);
        if (progressed < Math.abs(d) * 0.3) {
          const seek = clampToNetwork(t.x + h.x * 6, t.z + h.z * 6);
          const vx = seek.x - t.x, vz = seek.z - t.z;
          const L = Math.hypot(vx, vz);
          if (L > 0.01) {
            const s = Math.min(Math.abs(d), L) / L;
            target.current = { x: t.x + vx * s, z: t.z + vz * s };
            return;
          }
        }
        target.current = { x: c.x, z: c.z };
        return;
      }
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

    // expose for the frame loop (D-pad + autopilot share these)
    rigApi.current = { tryTurn, advance };

    const onWheel = (e: WheelEvent) => {
      cancelRoute();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) {
        tryTurn(e.deltaX > 0 ? 1 : -1);
      } else {
        advance(e.deltaY * 0.022);
      }
    };
    const kd = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { cancelRoute(); keysFwd.current = 1; }
      else if (['ArrowDown', 's', 'S'].includes(e.key)) { cancelRoute(); keysFwd.current = -1; }
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) { cancelRoute(); tryTurn(1); }
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) { cancelRoute(); tryTurn(-1); }
    };
    const ku = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S'].includes(e.key)) keysFwd.current = 0;
    };
    const pd = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && typeof t.closest === 'function'
        && t.closest('a,button,.mx-hud,.mx-toggle,.mx-slab,.mx-gate,.mx-dpad,.mx-map')) return;
      drag.current = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
    };
    const pm = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      if (drag.current.touch) {
        // touch: horizontal swipe pans the view smoothly; vertical drives
        cancelRoute();
        lookT.current.yaw = THREE.MathUtils.clamp(lookT.current.yaw - dx * 0.0042, -1.35, 1.35);
        if (Math.abs(dy) > Math.abs(dx) * 0.6) advance(-dy * 0.06);
      } else {
        lookT.current.yaw = THREE.MathUtils.clamp(lookT.current.yaw - dx * 0.0035, -1.2, 1.2);
        lookT.current.pitch = THREE.MathUtils.clamp(lookT.current.pitch + dy * 0.0028, -0.8, 0.8);
      }
      drag.current = { x: e.clientX, y: e.clientY, touch: drag.current.touch };
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

  const rigApi = useRef<{ tryTurn: (d: 1 | -1) => void; advance: (d: number) => void } | null>(null);

  useFrame((state, dt) => {
    const api = rigApi.current;

    // keyboard / D-pad cruise
    const moveCmd = keysFwd.current || scrollBus.cmdMove;
    if (moveCmd !== 0 && api) {
      api.advance(moveCmd * dt * 26);
    }
    // D-pad one-shot turns
    if (scrollBus.cmdTurn !== 0 && api) {
      api.tryTurn(scrollBus.cmdTurn as 1 | -1);
      scrollBus.cmdTurn = 0;
    }
    // auto-drive route
    if (scrollBus.route.length > 0 && api && moveCmd === 0) {
      const wp = scrollBus.route[0];
      const t = target.current;
      const dx = wp.x - t.x, dz = wp.z - t.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 2.5) {
        scrollBus.route.shift();
      } else {
        // face the waypoint (cardinal), then advance
        const want = Math.abs(dx) > Math.abs(dz)
          ? { x: Math.sign(dx), z: 0 }
          : { x: 0, z: Math.sign(dz) };
        if (want.x !== heading.current.x || want.z !== heading.current.z) {
          heading.current = want;
        }
        api.advance(Math.min(dist, dt * 30));
      }
    }

    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.2);
    const px = pos.current.x, pz = pos.current.z;
    pos.current.x += (target.current.x - pos.current.x) * k;
    pos.current.z += (target.current.z - pos.current.z) * k;
    scrollBus.speed = Math.hypot(pos.current.x - px, pos.current.z - pz) / Math.max(dt, 1e-4);
    scrollBus.x = pos.current.x;
    scrollBus.z = pos.current.z;
    scrollBus.hx = heading.current.x;
    scrollBus.hz = heading.current.z;

    if (!drag.current) {
      lookT.current.yaw *= 1 - Math.min(1, dt * 1.1);
      lookT.current.pitch *= 1 - Math.min(1, dt * 1.1);
    }
    look.current.yaw += (lookT.current.yaw - look.current.yaw) * Math.min(1, dt * 7);
    look.current.pitch += (lookT.current.pitch - look.current.pitch) * Math.min(1, dt * 7);

    const targetYaw = Math.atan2(-heading.current.x, -heading.current.z);
    let dy = targetYaw - yaw.current;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    yaw.current += dy * Math.min(1, dt * (reduced ? 20 : 3.6));

    // warp: big through era portals, soft through district gates
    let warp = 0;
    for (const pxg of PORTAL_XS) {
      const ddx = pos.current.x - pxg, ddz = pos.current.z - PORTAL_Z;
      warp = Math.max(warp, Math.exp(-(ddx * ddx + ddz * ddz) / 38));
    }
    for (const dp of DISTRICT_PORTALS) {
      const ddx = pos.current.x - dp.x, ddz = pos.current.z - dp.z;
      warp = Math.max(warp, 0.55 * Math.exp(-(ddx * ddx + ddz * ddz) / 22));
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

    // free-flight easter egg — soar above the city, then ease back down
    const flying = !reduced && performance.now() < scrollBus.flightUntil;
    flight.current += ((flying ? 1 : 0) - flight.current) * Math.min(1, dt * 1.6);
    if (flight.current > 0.002) {
      const t = state.clock.elapsedTime * 0.22;
      const fx = HUB.x + Math.sin(t) * 78;
      const fz = HUB.z + Math.cos(t) * 78;
      cam.position.lerp(flightPos.current.set(fx, 135, fz), flight.current);
      lookAt.current.lerp(flightLook.current.set(HUB.x, 0, HUB.z), flight.current);
    }
    cam.lookAt(lookAt.current);

    const fovTarget = 52 + scrollBus.warp * 30;
    if (Math.abs(cam.fov - fovTarget) > 0.05) {
      cam.fov += (fovTarget - cam.fov) * Math.min(1, dt * 7);
      cam.updateProjectionMatrix();
    }
    state.gl.toneMappingExposure = 1 + scrollBus.warp * 1.15;
    onFrame(pos.current.x, pos.current.z);
  });

  return null;
}
