'use client';
// Drive engine v6 — POLYLINE streets (curves bend the camera naturally),
// junction turns, U-turns, and INTERIORS: drive into a landmark's lobby and
// you're inside it; back out to return to the street. Touch pans/drives,
// wheel drives, A/D turns, D-pad and autopilot ride the same rails.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STREETS, SPAWN, LANDMARKS, HUB } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

interface Seg { ax: number; az: number; bx: number; bz: number; ux: number; uz: number; len: number }
const SEGS: Seg[] = [];
for (const s of STREETS) {
  for (let i = 0; i < s.pts.length - 1; i++) {
    const [ax, az] = s.pts[i];
    const [bx, bz] = s.pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    SEGS.push({ ax, az, bx, bz, ux: (bx - ax) / len, uz: (bz - az) / len, len });
  }
}

function clampToNetwork(x: number, z: number) {
  let bx = x, bz = z, bd = Infinity, seg = SEGS[0], t = 0;
  for (const s of SEGS) {
    const tt = Math.max(0, Math.min(s.len, (x - s.ax) * s.ux + (z - s.az) * s.uz));
    const px = s.ax + s.ux * tt, pz = s.az + s.uz * tt;
    const d = (x - px) * (x - px) + (z - pz) * (z - pz);
    if (d < bd) { bd = d; bx = px; bz = pz; seg = s; t = tt; }
  }
  return { x: bx, z: bz, dist: Math.sqrt(bd), seg, t };
}



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
  const top = useRef(0);
  const flightPos = useRef(new THREE.Vector3());
  const flightLook = useRef(new THREE.Vector3());
  const savedExt = useRef<{ x: number; z: number; hx: number; hz: number } | null>(null);
  const enterArmed = useRef(true);

  useEffect(() => {
    const cancelRoute = () => { scrollBus.route.length = 0; };

    // walk the rails: move d units along the network following `heading`
    const advance = (d: number) => {
      if (scrollBus.interior) {
        const lm = LANDMARKS.find(l => l.id === scrollBus.interior);
        if (!lm) return;
        scrollBus.intT = Math.max(0, Math.min(lm.interiorLen, scrollBus.intT + d));
        return;
      }
      let remaining = Math.abs(d);
      const sign = Math.sign(d);
      let guard = 4;
      while (remaining > 0.001 && guard-- > 0) {
        const c = clampToNetwork(target.current.x, target.current.z);
        // at a junction several segments are equally close — prefer the one
        // ALIGNED with our heading, or we can never turn onto a cross street
        let s = c.seg;
        let bestAlign = Math.abs(s.ux * heading.current.x + s.uz * heading.current.z);
        let bestT = c.t;
        for (const cand of SEGS) {
          if (cand === c.seg) continue;
          const tt = Math.max(0, Math.min(cand.len,
            (target.current.x - cand.ax) * cand.ux + (target.current.z - cand.az) * cand.uz));
          const px = cand.ax + cand.ux * tt, pz = cand.az + cand.uz * tt;
          if (Math.hypot(target.current.x - px, target.current.z - pz) > 2.6) continue;
          const align = Math.abs(cand.ux * heading.current.x + cand.uz * heading.current.z);
          if (align > bestAlign + 0.1) { bestAlign = align; s = cand; bestT = tt; }
        }
        const cT = s === c.seg ? c.t : bestT;
        const cx = s.ax + s.ux * cT, cz = s.az + s.uz * cT;
        const cAdj = { x: cx, z: cz, t: cT };
        // orient tangent with travel direction
        const dot = s.ux * heading.current.x + s.uz * heading.current.z;
        const dir = (dot >= 0 ? 1 : -1) * sign;
        const room = dir > 0 ? s.len - cAdj.t : cAdj.t;
        const step = Math.min(remaining, Math.max(room, 0));
        target.current = {
          x: cAdj.x + s.ux * dir * step,
          z: cAdj.z + s.uz * dir * step,
        };
        if (sign > 0) {
          heading.current = { x: s.ux * dir, z: s.uz * dir };
        }
        remaining -= step;
        if (remaining > 0.001) {
          // at a node — find the best continuing segment
          const nx = target.current.x, nz = target.current.z;
          const hx = s.ux * dir, hz = s.uz * dir;
          let best: Seg | null = null, bestDot = 0.25, bestDir = 1;
          for (const cand of SEGS) {
            if (cand === s) continue;
            for (const [ex, ez, cd] of [[cand.ax, cand.az, 1], [cand.bx, cand.bz, -1]] as const) {
              if (Math.hypot(ex - nx, ez - nz) > 1.5) continue;
              const ddot = cand.ux * cd * hx + cand.uz * cd * hz;
              if (ddot > bestDot) { bestDot = ddot; best = cand; bestDir = cd; }
            }
          }
          if (!best) break; // dead end
          heading.current = { x: best.ux * bestDir * (sign > 0 ? 1 : 1), z: best.uz * bestDir };
          if (sign < 0) heading.current = { x: -heading.current.x, z: -heading.current.z };
          target.current = {
            x: target.current.x + best.ux * bestDir * sign * 0.01,
            z: target.current.z + best.uz * bestDir * sign * 0.01,
          };
        }
      }
    };

    const tryTurn = (turnDir: 1 | -1) => {
      const now = performance.now();
      if (now - lastTurn.current < 320 || scrollBus.interior) return;
      const t = target.current;
      const h = heading.current;
      const want = { x: turnDir === 1 ? -h.z : h.z, z: turnDir === 1 ? h.x : -h.x };
      // find a departing segment near us whose tangent matches the turn
      let best: { ux: number; uz: number } | null = null, bestDot = 0.55;
      for (const cand of SEGS) {
        for (const [ex, ez, cd] of [[cand.ax, cand.az, 1], [cand.bx, cand.bz, -1]] as const) {
          if (Math.hypot(ex - t.x, ez - t.z) > 9) continue;
          const tx = cand.ux * cd, tz = cand.uz * cd;
          const ddot = tx * want.x + tz * want.z;
          if (ddot > bestDot) {
            bestDot = ddot;
            best = { ux: tx, uz: tz };
            // snap to the junction
            target.current = { x: ex, z: ez };
          }
        }
      }
      if (best) {
        heading.current = { x: best.ux, z: best.uz };
        lastTurn.current = now;
        return;
      }
      // no branch — U-turn
      heading.current = { x: -h.x, z: -h.z };
      lastTurn.current = now;
    };

    rigApi.current = { tryTurn, advance };

    const onWheel = (e: WheelEvent) => {
      cancelRoute();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) tryTurn(e.deltaX > 0 ? 1 : -1);
      else advance(e.deltaY * 0.022);
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
    const now = performance.now();

    const moveCmd = keysFwd.current || scrollBus.cmdMove;
    if (moveCmd !== 0 && api) api.advance(moveCmd * dt * 26);
    if (scrollBus.cmdTurn !== 0 && api) {
      api.tryTurn(scrollBus.cmdTurn as 1 | -1);
      scrollBus.cmdTurn = 0;
    }
    // autopilot
    if (scrollBus.route.length > 0 && api && moveCmd === 0 && !scrollBus.interior) {
      const wp = scrollBus.route[0];
      const t = target.current;
      const dx = wp.x - t.x, dz = wp.z - t.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 2.5) scrollBus.route.shift();
      else {
        const L = Math.hypot(dx, dz);
        heading.current = { x: dx / L, z: dz / L };
        api.advance(Math.min(dist, dt * 30));
      }
    }

    // ── enter / exit landmarks ──
    if (!scrollBus.interior) {
      let nearAny = false;
      for (const lm of LANDMARKS) {
        const d = Math.hypot(target.current.x - lm.entrance[0], target.current.z - lm.entrance[1]);
        if (d < 7) nearAny = true;
        if (d < 3.4 && enterArmed.current) {
          savedExt.current = { x: lm.entrance[0] + lm.outDir[0] * 7, z: lm.entrance[1] + lm.outDir[1] * 7, hx: lm.outDir[0], hz: lm.outDir[1] };
          scrollBus.interior = lm.id;
          scrollBus.intT = 1.5;
          scrollBus.route.length = 0;
          scrollBus.warp = Math.max(scrollBus.warp, 1);
          enterArmed.current = false;
          keysFwd.current = 0;
          scrollBus.cmdMove = 0;
          break;
        }
      }
      // re-arm only once you've genuinely left the doorway
      if (!nearAny) enterArmed.current = true;
    } else if (scrollBus.intT <= 0.2) {
      // walked back out the door
      const ext = savedExt.current;
      if (ext) {
        target.current = { x: ext.x, z: ext.z };
        pos.current = { x: ext.x, z: ext.z };
        heading.current = { x: ext.hx, z: ext.hz };
      }
      scrollBus.interior = null;
      scrollBus.warp = Math.max(scrollBus.warp, 0.9);
      enterArmed.current = false;
      keysFwd.current = 0;
      scrollBus.cmdMove = 0;
    }

    // damping
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

    // warp decay
    scrollBus.warp = Math.max(0, scrollBus.warp - dt * 1.4);

    const cam = state.camera as THREE.PerspectiveCamera;

    if (scrollBus.interior) {
      // inside a landmark: a straight gallery laid out far from the city
      const idx = LANDMARKS.findIndex(l => l.id === scrollBus.interior);
      const baseX = 4000 + idx * 300;
      cam.position.set(
        baseX + (reduced ? 0 : pointer.current.x * 0.3),
        2,
        -scrollBus.intT,
      );
      const vy = look.current.yaw + (reduced ? 0 : pointer.current.x * 0.05);
      lookAt.current.set(
        baseX - Math.sin(vy) * 10,
        2 + look.current.pitch * 8,
        -scrollBus.intT - Math.cos(vy) * 10,
      );
      cam.lookAt(lookAt.current);
    } else {
      const targetYaw = Math.atan2(-heading.current.x, -heading.current.z);
      let dy = targetYaw - yaw.current;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      yaw.current += dy * Math.min(1, dt * (reduced ? 20 : 3.2));

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

      // flight / top view / dive intro
      const flying = !reduced && now < scrollBus.flightUntil;
      flight.current += ((flying ? 1 : 0) - flight.current) * Math.min(1, dt * 1.6);
      if (flight.current > 0.002) {
        const t = state.clock.elapsedTime * 0.22;
        cam.position.lerp(flightPos.current.set(HUB.x + Math.sin(t) * 90, 140, HUB.z + Math.cos(t) * 90), flight.current);
        lookAt.current.lerp(flightLook.current.set(HUB.x, 0, HUB.z), flight.current);
      }
      top.current += ((scrollBus.topView ? 1 : 0) - top.current) * Math.min(1, dt * 2.2);
      if (top.current > 0.002) {
        cam.position.lerp(flightPos.current.set(pos.current.x, 150, pos.current.z + 0.01), top.current);
        lookAt.current.lerp(flightLook.current.set(pos.current.x, 0, pos.current.z), top.current);
      }
      const introLeft = scrollBus.introUntil - now;
      if (introLeft > 0 && !reduced) {
        const kk = 1 - introLeft / 4200;
        const e = kk < 0.5 ? 2 * kk * kk : 1 - Math.pow(-2 * kk + 2, 2) / 2;
        flightPos.current.set(-20 + Math.sin(kk * Math.PI) * 14, 170 - 167.8 * e, 170 - 126 * e);
        cam.position.copy(flightPos.current);
        flightLook.current.set(-20, 4 + (1 - e) * 14, 170 - 126 * e - 30);
        lookAt.current.copy(flightLook.current);
        scrollBus.warp = Math.max(scrollBus.warp, Math.sin(kk * Math.PI) * 0.95);
      }
      cam.lookAt(lookAt.current);
    }

    if (!reduced && scrollBus.warp > 0.45) {
      const t = state.clock.elapsedTime;
      cam.rotation.z += Math.sin(t * 43) * 0.012 * scrollBus.warp;
      cam.rotation.x += Math.sin(t * 37) * 0.008 * scrollBus.warp;
    }
    const fovTarget = 52 + scrollBus.warp * 30;
    if (Math.abs(cam.fov - fovTarget) > 0.05) {
      cam.fov += (fovTarget - cam.fov) * Math.min(1, dt * 7);
      cam.updateProjectionMatrix();
    }
    state.gl.toneMappingExposure = 1 + scrollBus.warp * 1.3;
    onFrame(pos.current.x, pos.current.z);
  });

  return null;
}
