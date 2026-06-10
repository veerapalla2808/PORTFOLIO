'use client';
// NEON GRID v4 set pieces — an open-world map. Each district has a UNIQUE
// entry portal and its own atmosphere; the hub ties the map together.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GX, NEONS, STREETS, SIGNPOSTS, GATE_ARCH, HUB, IDENTITY_SPOT, ARSENAL_SPOT,
  PORTAL_XS, PORTAL_Z, ANOM_SPOTS, CREDS_SPOT, TRANS_SPOT, DOCKS_SPOT, OBS_SPOT,
  PILLS_SPOT, DISTRICT_PORTALS, ZONES, zoneAt, type DistrictPortal,
} from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';
import { skillCategories, projects, personal, certifications, education, blogPosts, experiences } from '@/lib/data';

const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const setCursor = (on: boolean) => { document.body.style.cursor = on ? 'pointer' : ''; };

function distToRoads(x: number, z: number) {
  let bd = Infinity;
  for (const s of STREETS) {
    const ax = s.a[0], az = s.a[1], dx = s.b[0] - ax, dz = s.b[1] - az;
    const len2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + dx * t, pz = az + dz * t;
    bd = Math.min(bd, (x - px) * (x - px) + (z - pz) * (z - pz));
  }
  return Math.sqrt(bd);
}

// ── canvas texture helpers ──────────────────────────────────────────────────
const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789Z+*=<>:・"日';

function glyphAtlas(): THREE.CanvasTexture {
  const size = 512;
  const cell = size / 8;
  const cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.font = `${cell * 0.72}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 64; i++) {
    const x = (i % 8) * cell + cell / 2;
    const y = Math.floor(i / 8) * cell + cell / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.fillText(GLYPHS[i % GLYPHS.length], 0, 0);
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(cv);
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// resolved Zen Tokyo Zoo family name (next/font hashes it) — for canvas text
function zenFamily(): string {
  if (typeof document === 'undefined') return '"JetBrains Mono", monospace';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-zen').trim();
  return v || '"JetBrains Mono", monospace';
}

// re-render canvas textures once webfonts are actually loaded
function useFontsReady(): number {
  const [ready, setReady] = useState(0);
  useEffect(() => {
    let on = true;
    document.fonts?.ready.then(() => { if (on) setReady(1); });
    return () => { on = false; };
  }, []);
  return ready;
}

function textTexture(
  lines: { text: string; size: number; color: string; font?: string; family?: string }[],
  w: number, h: number, border?: string,
): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(4,5,11,0.94)';
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = Math.max(4, w * 0.012);
    ctx.shadowColor = border;
    ctx.shadowBlur = 26;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.shadowBlur = 0;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let y = h / (lines.length + 1);
  for (const l of lines) {
    ctx.font = `${l.font ?? '700'} ${l.size}px ${l.family ?? '"JetBrains Mono", monospace'}`;
    ctx.fillStyle = l.color;
    ctx.shadowColor = l.color;
    ctx.shadowBlur = 20;
    ctx.fillText(l.text, w / 2, y);
    y += h / (lines.length + 1);
  }
  ctx.shadowBlur = 0;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stripesTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(8,2,3,0.9)';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = GX.red;
  ctx.lineWidth = 14;
  for (let i = -128; i < 256; i += 38) {
    ctx.beginPath();
    ctx.moveTo(i, 132);
    ctx.lineTo(i + 128, -4);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ── per-district atmosphere: fog tint follows the zone you're in.
// In TOP VIEW the fog opens right up so the whole city reads like a map.
export function ZoneAmbience() {
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((state, dt) => {
    const zo = zoneAt(scrollBus.x, scrollBus.z);
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      tmp.set(zo.fog);
      fog.color.lerp(tmp, Math.min(1, dt * 1.4));
      const farT = scrollBus.topView ? 420 : 150;
      const nearT = scrollBus.topView ? 120 : 24;
      fog.far += (farT - fog.far) * Math.min(1, dt * 2);
      fog.near += (nearT - fog.near) * Math.min(1, dt * 2);
    }
  });
  return (
    <group>
      {/* district ground glow discs — you can SEE you've entered a new realm */}
      {ZONES.filter(z => z.id !== 'gate').map(z => (
        <mesh key={z.id} position={[z.x, 0.03, z.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[17, 48]} />
          <meshBasicMaterial color={glow(z.accent, 0.5)} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── city blocks — towers BUILT of falling code (matrix-rain facades) ────────
const BLDG_VERT = /* glsl */ `
attribute float aHue;
attribute float aSeed;
attribute float aSurge;
varying vec3 vWorld;
varying float vNy;
varying float vHue;
varying float vSeed;
varying float vSurge;
void main() {
  vHue = aHue;
  vSeed = aSeed;
  vSurge = aSurge;
  vNy = normal.y;
  vec4 mp = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    mp = instanceMatrix * mp;
  #endif
  vWorld = (modelMatrix * mp).xyz;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * mp;
}`;

const BLDG_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uAtlas;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uBlue; uniform vec3 uViolet; uniform vec3 uRed;
varying vec3 vWorld;
varying float vNy;
varying float vHue;
varying float vSeed;
varying float vSurge;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  // roofs stay matte — the rain lives on the faces
  if (vNy > 0.5) { gl_FragColor = vec4(uBase * 0.6, 1.0); return; }
  // click surge — the whole tower floods for a moment
  float surge = clamp(1.0 - (uTime - vSurge) * 0.65, 0.0, 1.0);

  // planar glyph grid in world units (x+z collapses each face to a line)
  float u = vWorld.x + vWorld.z + vSeed * 7.0;
  float v = vWorld.y;
  float colW = 1.05;
  float rowH = 1.3;
  float col = floor(u / colW);
  float row = floor(v / rowH);
  vec2 local = vec2(fract(u / colW), fract(v / rowH));

  // each column is a falling code stream
  float spd = 0.05 + hash(vec2(col, vSeed)) * 0.11;
  float t = fract(v * 0.03 + uTime * spd + hash(vec2(col, 3.7)) * 7.0);
  float b = pow(t, 5.0);
  if (hash(vec2(col, row * 2.3)) < 0.08) b *= 0.15; // dead cells

  float cyc = floor(uTime * (0.6 + hash(vec2(col, row)) * 1.6));
  float gi = floor(hash(vec2(col * 1.7 + row * 3.1, cyc)) * 63.99);
  vec2 tile = vec2(mod(gi, 8.0), floor(gi / 8.0));
  float glyph = texture2D(uAtlas, (tile + local) / 8.0).r;

  vec3 neon = vHue < 0.5 ? uBlue : (vHue < 1.5 ? uViolet : uRed);
  vec3 c = uBase + neon * (glyph * (0.10 + b * 1.7));
  if (t > 0.962) c += (neon * 1.1 + vec3(0.4)) * glyph; // bright stream head
  c += (neon * 2.2 + vec3(0.5)) * glyph * surge;        // click surge flood
  c += (hash(gl_FragCoord.xy * 0.7) - 0.5) * 0.04;      // dither
  gl_FragColor = vec4(c, 1.0);
}`;

export function CityBlocks({ tier, reduced }: { tier: 'S' | 'M' | 'L'; reduced: boolean }) {
  const step = tier === 'S' ? 24 : tier === 'M' ? 16 : 12;
  const atlas = useMemo(() => glyphAtlas(), []);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeRef = useRef(17.3);

  const { body, trims, surgeAttr } = useMemo(() => {
    const slots: { x: number; z: number; seed: number }[] = [];
    STREETS.forEach((s, si) => {
      const ax = s.a[0], az = s.a[1];
      const dx = s.b[0] - ax, dz = s.b[1] - az;
      const len = Math.hypot(dx, dz);
      const ux = dx / len, uz = dz / len;
      const nx = -uz, nz = ux;
      for (let d = 8; d < len - 4; d += step) {
        for (const side of [-1, 1]) {
          const seed = si * 997 + d * 13 + side * 7;
          const off = 16 + rnd(seed + 1) * 12;
          const X = ax + ux * d + nx * side * off;
          const Z = az + uz * d + nz * side * off;
          if (distToRoads(X, Z) < 10) continue; // never block another street
          slots.push({ x: X, z: Z, seed });
        }
      }
    });
    const n = slots.length;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const hue = new Float32Array(n);
    const seedAttr = new Float32Array(n);
    const mat = new THREE.ShaderMaterial({
      vertexShader: BLDG_VERT,
      fragmentShader: BLDG_FRAG,
      uniforms: {
        uAtlas: { value: atlas },
        uTime: { value: 17.3 },
        uBase: { value: new THREE.Color('#04050C') },
        uBlue: { value: new THREE.Color(GX.blueBright) },
        uViolet: { value: new THREE.Color(GX.violetBright) },
        uRed: { value: new THREE.Color(GX.redBright) },
      },
    });
    const bodyMesh = new THREE.InstancedMesh(geo, mat, n);
    // rooftop trim as a hollow FRAME (4 edge strips) — from above the roofs
    // read as outlined blocks, not glowing slabs
    const trimMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const trims = [0, 1, 2, 3].map(() =>
      new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), trimMat, n));
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const q = new THREE.Quaternion();
    slots.forEach((sl, i) => {
      const w = 7 + rnd(sl.seed + 2) * 8;
      const h = 16 + rnd(sl.seed + 3) * 36;
      const dpt = 7 + rnd(sl.seed + 4) * 8;
      m.compose(new THREE.Vector3(sl.x, h / 2, sl.z), q, new THREE.Vector3(w, h, dpt));
      bodyMesh.setMatrixAt(i, m);
      const y = h + 0.1;
      // north/south strips (full width), east/west strips (full depth)
      m.compose(new THREE.Vector3(sl.x, y, sl.z - dpt / 2), q, new THREE.Vector3(w * 1.02, 0.2, 0.34));
      trims[0].setMatrixAt(i, m);
      m.compose(new THREE.Vector3(sl.x, y, sl.z + dpt / 2), q, new THREE.Vector3(w * 1.02, 0.2, 0.34));
      trims[1].setMatrixAt(i, m);
      m.compose(new THREE.Vector3(sl.x - w / 2, y, sl.z), q, new THREE.Vector3(0.34, 0.2, dpt * 1.02));
      trims[2].setMatrixAt(i, m);
      m.compose(new THREE.Vector3(sl.x + w / 2, y, sl.z), q, new THREE.Vector3(0.34, 0.2, dpt * 1.02));
      trims[3].setMatrixAt(i, m);
      c.set(NEONS[i % NEONS.length]).multiplyScalar(2.1);
      trims.forEach(tm => tm.setColorAt(i, c));
      // 45% blue · 30% violet · 25% red — matches the weather
      const hr = rnd(sl.seed + 5);
      hue[i] = hr < 0.45 ? 0 : hr < 0.75 ? 1 : 2;
      seedAttr[i] = rnd(sl.seed + 6) * 53;
    });
    const surge = new Float32Array(n).fill(-100);
    const surgeAttr = new THREE.InstancedBufferAttribute(surge, 1);
    surgeAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aHue', new THREE.InstancedBufferAttribute(hue, 1));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedAttr, 1));
    geo.setAttribute('aSurge', surgeAttr);
    bodyMesh.instanceMatrix.needsUpdate = true;
    trims.forEach(tm => {
      tm.instanceMatrix.needsUpdate = true;
      if (tm.instanceColor) tm.instanceColor.needsUpdate = true;
    });
    return { body: bodyMesh, trims, surgeAttr };
  }, [step, atlas]);

  const surgeRef = useRef<THREE.InstancedBufferAttribute | null>(null);
  useEffect(() => {
    matRef.current = body.material as THREE.ShaderMaterial;
    surgeRef.current = surgeAttr;
  }, [body, surgeAttr]);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    if (matRef.current && !reduced) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.add(body, ...trims);
    return () => {
      g.remove(body, ...trims);
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
      trims.forEach(tm => tm.geometry.dispose());
      (trims[0].material as THREE.Material).dispose();
    };
  }, [body, trims]);

  // click a tower → its code stream floods for a moment
  return (
    <group
      ref={group}
      onClick={(e) => {
        const hit = e.intersections.find(i => i.object === body);
        if (hit?.instanceId === undefined) return;
        e.stopPropagation();
        const attr = surgeRef.current;
        if (attr) {
          attr.setX(hit.instanceId, timeRef.current);
          attr.needsUpdate = true;
        }
      }}
    />
  );
}

// ── streets — dark asphalt, ONE lane color per street (both edges), and a
// highway-style dashed center line. No grid tiles.
export function StreetLanes() {
  const { lanes, dashes } = useMemo(() => {
    const laneList: { x: number; z: number; sx: number; sz: number; color: string }[] = [];
    const dashList: { x: number; z: number; sx: number; sz: number }[] = [];
    const DASH = 3.2, GAP = 4.2;
    STREETS.forEach((s) => {
      const ax = s.a[0], az = s.a[1];
      const dx = s.b[0] - ax, dz = s.b[1] - az;
      const len = Math.hypot(dx, dz);
      const ux = dx / len, uz = dz / len;
      const nx = -uz, nz = ux;
      const cx = ax + dx / 2, cz = az + dz / 2;
      const horizontal = Math.abs(ux) > 0.5;
      // edges — same color on BOTH sides of the street
      for (const side of [-1, 1]) {
        laneList.push({
          x: cx + nx * side * 4.6,
          z: cz + nz * side * 4.6,
          sx: horizontal ? len : 0.16,
          sz: horizontal ? 0.16 : len,
          color: s.color,
        });
      }
      // dashed center line
      for (let d = 4; d < len - 3; d += DASH + GAP) {
        const mx = ax + ux * (d + DASH / 2), mz = az + uz * (d + DASH / 2);
        dashList.push({
          x: mx, z: mz,
          sx: horizontal ? DASH : 0.14,
          sz: horizontal ? 0.14 : DASH,
        });
      }
    });
    return { lanes: laneList, dashes: dashList };
  }, []);

  const dashMesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 0.06, 1);
    const mesh = new THREE.InstancedMesh(
      geo,
      new THREE.MeshBasicMaterial({ color: glow('#ADc4E8'.toUpperCase(), 0.9), toneMapped: false, transparent: true, opacity: 0.55 }),
      dashes.length,
    );
    const m = new THREE.Matrix4();
    dashes.forEach((d, i) => {
      m.compose(new THREE.Vector3(d.x, 0.05, d.z), new THREE.Quaternion(), new THREE.Vector3(d.sx, 1, d.sz));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [dashes]);

  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.add(dashMesh);
    return () => {
      g.remove(dashMesh);
      dashMesh.geometry.dispose();
      (dashMesh.material as THREE.Material).dispose();
    };
  }, [dashMesh]);

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -120]}>
        <planeGeometry args={[460, 520]} />
        <meshBasicMaterial color={'#020207'} />
      </mesh>
      {lanes.map((l, i) => (
        <mesh key={i} position={[l.x, 0.06, l.z]}>
          <boxGeometry args={[l.sx, 0.1, l.sz]} />
          <meshBasicMaterial color={glow(l.color, 1.3)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── streetlights — instanced lamps at regular intervals on every road ───────
export function StreetLights() {
  const lamps = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    STREETS.forEach((s) => {
      const ax = s.a[0], az = s.a[1];
      const dx = s.b[0] - ax, dz = s.b[1] - az;
      const len = Math.hypot(dx, dz);
      const ux = dx / len, uz = dz / len;
      const nx = -uz, nz = ux;
      for (let d = 10; d < len - 6; d += 19) {
        for (const side of [-1, 1]) {
          const X = ax + ux * d + nx * side * 5.4;
          const Z = az + uz * d + nz * side * 5.4;
          // keep junctions clear
          let nearNode = false;
          for (const st of STREETS) {
            for (const end of [st.a, st.b]) {
              if (Math.hypot(X - end[0], Z - end[1]) < 9) { nearNode = true; break; }
            }
            if (nearNode) break;
          }
          if (!nearNode) out.push({ x: X, z: Z });
        }
      }
    });
    return out;
  }, []);

  const meshes = useMemo(() => {
    const n = lamps.length;
    const pole = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.07, 0.1, 5.6, 6),
      new THREE.MeshBasicMaterial({ color: '#0B0E1A' }), n);
    const head = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.17, 8, 8),
      new THREE.MeshBasicMaterial({ color: glow('#CFE0FF', 1.9), toneMapped: false }), n);
    const pool = new THREE.InstancedMesh(
      new THREE.CircleGeometry(2.6, 20),
      new THREE.MeshBasicMaterial({ color: '#27314F', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }), n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    lamps.forEach((l, i) => {
      m.compose(new THREE.Vector3(l.x, 2.8, l.z), q, new THREE.Vector3(1, 1, 1));
      pole.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(l.x, 5.65, l.z), q, new THREE.Vector3(1, 1, 1));
      head.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(l.x, 0.04, l.z), qFlat, new THREE.Vector3(1, 1, 1));
      pool.setMatrixAt(i, m);
    });
    pole.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    pool.instanceMatrix.needsUpdate = true;
    return [pole, head, pool];
  }, [lamps]);

  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    meshes.forEach(m => g.add(m));
    return () => {
      meshes.forEach(m => {
        g.remove(m);
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
    };
  }, [meshes]);
  return <group ref={group} />;
}

// ── sky traffic — light streams crossing high above the city ────────────────
export function SkyTraffic({ reduced }: { reduced: boolean }) {
  const COUNT = 14;
  const craft = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    lane: i % 3,
    off: rnd(i * 7 + 1) * 400,
    speed: 26 + rnd(i * 7 + 2) * 30,
    red: rnd(i * 7 + 3) > 0.6,
    y: 58 + (i % 3) * 14 + rnd(i * 7 + 4) * 6,
  })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const c = craft[i];
      const p = ((t * c.speed + c.off) % 460) - 230;
      if (c.lane === 0) m.position.set(p, c.y, -52);
      else if (c.lane === 1) m.position.set(-p, c.y, -198);
      else m.position.set(p, c.y, -310);
    });
  });
  return (
    <>
      {craft.map((c, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }} position={[0, c.y, 0]}>
          <boxGeometry args={[3.2, 0.09, 0.09]} />
          <meshBasicMaterial color={glow(c.red ? GX.redBright : GX.blueBright, 2)} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

// ── searchlights — slow sweeping beams over the skyline ─────────────────────
export function Searchlights({ reduced }: { reduced: boolean }) {
  const beams = useRef<(THREE.Group | null)[]>([]);
  const spots = useMemo(() => [
    { x: -60, z: -40, color: GX.violet, speed: 0.16, tilt: 0.5 },
    { x: 70, z: -120, color: GX.blue, speed: -0.11, tilt: 0.42 },
    { x: -50, z: -210, color: GX.red, speed: 0.13, tilt: 0.55 },
  ], []);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    beams.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y = t * spots[i].speed * Math.PI;
    });
  });
  return (
    <>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} ref={(g) => { beams.current[i] = g; }}>
          <group rotation={[0, 0, s.tilt]}>
            <mesh position={[0, 60, 0]}>
              <coneGeometry args={[7, 120, 16, 1, true]} />
              <meshBasicMaterial
                color={glow(s.color, 0.6)} transparent opacity={0.05}
                blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

// ── city gates — neon arch (hero backdrop) ──────────────────────────────────
export function GateArch() {
  const fontsReady = useFontsReady();
  const tex = useMemo(() => textTexture([
    { text: 'VEERA PALLA', size: 116, color: GX.white, family: zenFamily(), font: '400' },
    { text: 'THE NEON GRID · 11 YEARS IN PRODUCTION', size: 34, color: GX.blueBright },
  ], 1280, 320, GX.violet), [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[GATE_ARCH.x, 0, GATE_ARCH.z]}>
      {[-9, 9].map(x => (
        <mesh key={x} position={[x, 7, 0]}>
          <boxGeometry args={[1.6, 14, 1.6]} />
          <meshStandardMaterial color={'#0A0D16'} roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 14.6, 0]}>
        <boxGeometry args={[21, 3.6, 1.8]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 14.6, 1.0]}>
        <planeGeometry args={[19.5, 4.9]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {[-9, 9].map(x => (
        <mesh key={`p${x}`} position={[x + (x > 0 ? 0.95 : -0.95), 7, 0]}>
          <boxGeometry args={[0.12, 14, 0.12]} />
          <meshBasicMaterial color={glow(x > 0 ? GX.blue : GX.red, 1.9)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 16.55, 0]}>
        <boxGeometry args={[21.2, 0.14, 0.14]} />
        <meshBasicMaterial color={glow(GX.violet, 2)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── central hub — the map's beating heart ───────────────────────────────────
export function HubBeacon({ reduced }: { reduced: boolean }) {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (reduced) return;
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.z += dt * (i % 2 === 0 ? 0.4 : -0.3);
      r.rotation.x = Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.2;
    });
    if (core.current) core.current.rotation.y += dt * 0.5;
  });
  return (
    <group position={[HUB.x, 0, HUB.z]}>
      <mesh ref={core} position={[0, 7.5, 0]}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color={glow(GX.white, 1.5)} wireframe toneMapped={false} />
      </mesh>
      {[3.2, 4.4, 5.6].map((r, i) => (
        <mesh key={r} position={[0, 7.5, 0]} ref={(m) => { rings.current[i] = m; }}>
          <torusGeometry args={[r, 0.05, 8, 64]} />
          <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.6)} toneMapped={false} transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.5, 1.1, 6.4, 12, 1, true]} />
        <meshBasicMaterial color={glow(GX.violet, 0.9)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── junction signposts — big, labeled, data-driven ──────────────────────────
export function Signposts() {
  const posts = useMemo(() => SIGNPOSTS.map(p => ({
    x: p.x, z: p.z,
    boards: p.boards.map(b => ({
      tex: textTexture([{ text: b.text, size: 54, color: b.color }], 820, 110, b.color),
    })),
  })), []);
  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, 3.4, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 6.8, 8]} />
            <meshStandardMaterial color={'#0B0E18'} roughness={0.5} metalness={0.6} />
          </mesh>
          {p.boards.map((b, j) => (
            <mesh key={j} position={[0, 6.2 - j * 1.25, 0]}>
              <planeGeometry args={[7.4, 1.05]} />
              <meshBasicMaterial map={b.tex} transparent side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── UNIQUE district portals — no two alike ──────────────────────────────────
function PortalShell({ p, children }: { p: DistrictPortal; children: React.ReactNode }) {
  return (
    <group position={[p.x, 4.6, p.z]} rotation={[0, p.rotY, 0]}>
      {children}
      <mesh position={[0, -4.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.4, 48]} />
        <meshBasicMaterial color={glow(p.color, 1.4)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HexPortal({ p }: { p: DistrictPortal }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ring.current) ring.current.rotation.z += dt * 0.25; });
  return (
    <PortalShell p={p}>
      <mesh ref={ring}>
        <torusGeometry args={[4.5, 0.2, 6, 6]} />
        <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} toneMapped={false} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <circleGeometry args={[4.1, 6]} />
        <meshBasicMaterial color={glow(p.color, 0.5)} transparent opacity={0.16} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function IndustrialPortal({ p }: { p: DistrictPortal }) {
  const tex = useMemo(() => stripesTexture(), []);
  const film = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const m = film.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m?.map) m.map.offset.x += dt * 0.18;
  });
  return (
    <PortalShell p={p}>
      {[-4.2, 4.2].map(x => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.8, 9.4, 0.8]} />
          <meshStandardMaterial color={'#0C0508'} emissive={p.color} emissiveIntensity={1.4} toneMapped={false} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[9.2, 0.8, 0.8]} />
        <meshStandardMaterial color={'#0C0508'} emissive={p.color} emissiveIntensity={1.4} toneMapped={false} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh ref={film} position={[0, -0.2, 0]}>
        <planeGeometry args={[7.6, 8.2]} />
        <meshBasicMaterial map={tex} transparent opacity={0.32} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function GlitchPortal({ p }: { p: DistrictPortal }) {
  const bolts = useMemo(() => {
    const mk = (seedBase: number) => {
      const pts: number[] = [];
      let x = 0, y = -4.6;
      let i = 0;
      while (y < 4.6) {
        const nx = (rnd(seedBase + i) - 0.5) * 3.4;
        const ny = y + 0.8 + rnd(seedBase + i + 50) * 0.9;
        pts.push(x, y, 0, nx, Math.min(ny, 4.6), 0);
        x = nx; y = ny; i++;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      return g;
    };
    return [mk(11), mk(77)];
  }, []);
  const mats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (m) m.opacity = Math.sin(t * (13 + i * 5) + i) > -0.6 ? 1 : 0.15;
    });
  });
  return (
    <PortalShell p={p}>
      {bolts.map((g, i) => (
        <lineSegments key={i} geometry={g} position={[i === 0 ? -0.7 : 0.7, 0, 0]}>
          <lineBasicMaterial
            ref={(m) => { mats.current[i] = m; }}
            color={glow(i === 0 ? p.color : GX.white, 2)} toneMapped={false} transparent
          />
        </lineSegments>
      ))}
      <mesh>
        <planeGeometry args={[5.6, 9]} />
        <meshBasicMaterial color={glow(p.color, 0.4)} transparent opacity={0.1} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function DoubleRingPortal({ p }: { p: DistrictPortal }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.5;
    if (b.current) b.current.rotation.z -= dt * 0.7;
  });
  return (
    <PortalShell p={p}>
      <mesh ref={a}>
        <torusGeometry args={[4.7, 0.12, 10, 64]} />
        <meshBasicMaterial color={glow(GX.white, 1.7)} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[3.6, 0.12, 10, 64]} />
        <meshBasicMaterial color={glow(p.color, 1.9)} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color={glow(p.color, 0.5)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function ArcsPortal({ p }: { p: DistrictPortal }) {
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    arcs.current.forEach((m, i) => {
      if (!m) return;
      const k = 1 + Math.sin(t * 2 - i * 0.9) * 0.06;
      m.scale.setScalar(k);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2 - i * 0.9) * 0.35;
    });
  });
  return (
    <PortalShell p={p}>
      {[2.6, 3.7, 4.8].map((r, i) => (
        <mesh key={r} position={[0, -1.5, 0]} ref={(m) => { arcs.current[i] = m; }}>
          <torusGeometry args={[r, 0.14, 10, 48, Math.PI]} />
          <meshBasicMaterial color={glow(p.color, 1.8)} toneMapped={false} transparent />
        </mesh>
      ))}
    </PortalShell>
  );
}

function WavePortal({ p }: { p: DistrictPortal }) {
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    arcs.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = (i - 1) * 2.5 + Math.sin(t * 1.6 + i * 1.3) * 0.5;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 1.6 + i * 1.3) * 0.3;
    });
  });
  return (
    <PortalShell p={p}>
      {[0, 1, 2].map(i => (
        <mesh
          key={i}
          ref={(m) => { arcs.current[i] = m; }}
          rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI]}
        >
          <torusGeometry args={[3.8, 0.14, 10, 48, Math.PI]} />
          <meshBasicMaterial color={glow(p.color, 1.8)} toneMapped={false} transparent />
        </mesh>
      ))}
    </PortalShell>
  );
}

function OrreryPortal({ p }: { p: DistrictPortal }) {
  const orbitA = useRef<THREE.Group>(null);
  const orbitB = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (orbitA.current) orbitA.current.rotation.z += dt * 1.1;
    if (orbitB.current) orbitB.current.rotation.z -= dt * 0.7;
  });
  return (
    <PortalShell p={p}>
      <mesh>
        <torusGeometry args={[4.5, 0.14, 10, 72]} />
        <meshBasicMaterial color={glow(p.color, 1.7)} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, 0.6]}>
        <torusGeometry args={[3.2, 0.06, 8, 64]} />
        <meshBasicMaterial color={glow(GX.blue, 1.4)} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <group ref={orbitA}>
        <mesh position={[4.5, 0, 0]}>
          <sphereGeometry args={[0.34, 12, 12]} />
          <meshBasicMaterial color={glow(GX.white, 1.9)} toneMapped={false} />
        </mesh>
      </group>
      <group ref={orbitB}>
        <mesh position={[-3.2, 0, 0]}>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshBasicMaterial color={glow(GX.red, 2)} toneMapped={false} />
        </mesh>
      </group>
    </PortalShell>
  );
}

function DiamondPortal({ p }: { p: DistrictPortal }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });
  return (
    <PortalShell p={p}>
      <mesh ref={ring} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[4.4, 0.18, 8, 4]} />
        <meshBasicMaterial color={glow(GX.white, 1.8)} toneMapped={false} />
      </mesh>
      <mesh position={[-3.4, 0, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={glow(GX.red, 2.2)} toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 0, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={glow(GX.blue, 2.2)} toneMapped={false} />
      </mesh>
    </PortalShell>
  );
}

export function DistrictPortals() {
  return (
    <>
      {DISTRICT_PORTALS.map((p, i) => {
        switch (p.kind) {
          case 'hex': return <HexPortal key={i} p={p} />;
          case 'industrial': return <IndustrialPortal key={i} p={p} />;
          case 'glitch': return <GlitchPortal key={i} p={p} />;
          case 'doublering': return <DoubleRingPortal key={i} p={p} />;
          case 'arcs': return <ArcsPortal key={i} p={p} />;
          case 'wave': return <WavePortal key={i} p={p} />;
          case 'orrery': return <OrreryPortal key={i} p={p} />;
          case 'diamond': return <DiamondPortal key={i} p={p} />;
        }
      })}
    </>
  );
}

// ── event docks — stacked stream containers riding slow waves ───────────────
export function EventDocks({ reduced }: { reduced: boolean }) {
  const crates = useMemo(() => {
    const labels = ['KAFKA', 'RABBITMQ', 'KINESIS', 'PUB/SUB', 'EVENT HUB', 'SQS'];
    return labels.map((l, i) => ({
      tex: textTexture([{ text: l, size: 58, color: i % 2 === 0 ? GX.blueBright : GX.violetBright }], 640, 180, i % 2 === 0 ? GX.blue : GX.violet),
      x: DOCKS_SPOT.x + (i % 2) * 9 - 2,
      z: DOCKS_SPOT.z + (Math.floor(i / 2) - 1) * 10,
      y: 1.6 + (i % 3) * 2.9,
      seed: i * 3.1,
    }));
  }, []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = crates[i].y + Math.sin(t * 0.9 + crates[i].seed) * 0.35;
    });
  });
  return (
    <group>
      {crates.map((c, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={[c.x, c.y, c.z]}>
          <mesh>
            <boxGeometry args={[7.4, 2.6, 4]} />
            <meshStandardMaterial color={'#070A14'} roughness={0.45} metalness={0.6} />
          </mesh>
          <mesh position={[-3.71, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3.8, 2.2]} />
            <meshBasicMaterial map={c.tex} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── the observatory — an orrery of watching instruments ─────────────────────
export function Observatory({ reduced }: { reduced: boolean }) {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const dish = useRef<THREE.Mesh>(null);
  const board = useMemo(() => textTexture([
    { text: 'OBSERVATORY UPLINK', size: 40, color: GX.violetBright },
    { text: 'MTTR ▼ 40% · PROMETHEUS + GRAFANA', size: 34, color: GX.white },
    { text: 'CLOUDWATCH · STACKDRIVER · SENTRY · DATADOG', size: 26, color: GX.blueBright },
  ], 1000, 420, GX.violet), []);
  useFrame((state, dt) => {
    if (reduced) return;
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.x += dt * (0.2 + i * 0.12);
      r.rotation.y += dt * (0.14 + i * 0.08);
    });
    if (dish.current) dish.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.8;
  });
  return (
    <group position={[OBS_SPOT.x, 0, OBS_SPOT.z]}>
      {/* observation sphere of nested rings */}
      <group position={[0, 9, 0]}>
        {[3.4, 4.4, 5.4].map((r, i) => (
          <mesh key={r} ref={(m) => { rings.current[i] = m; }}>
            <torusGeometry args={[r, 0.07, 8, 64]} />
            <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.7)} toneMapped={false} transparent opacity={0.85} />
          </mesh>
        ))}
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshBasicMaterial color={glow(GX.white, 1.6)} wireframe toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.4, 0.9, 6, 10]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh ref={dish} position={[0, 14.6, 0]} rotation={[0.7, 0, 0]}>
        <coneGeometry args={[1.6, 0.9, 16, 1, true]} />
        <meshBasicMaterial color={glow(GX.violetBright, 1.2)} toneMapped={false} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6, 6, 8]} rotation={[0, Math.PI / 2.6, 0]}>
        <planeGeometry args={[9.4, 4]} />
        <meshBasicMaterial map={board} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── identity plaza ──────────────────────────────────────────────────────────
export function IdentityHolo({ reduced }: { reduced: boolean }) {
  const card = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => textTexture([
    { text: '◢ VP', size: 92, color: GX.violetBright },
    { text: personal.name.toUpperCase(), size: 78, color: GX.white },
    { text: 'SR. REACT.JS / NODE.JS · 11 YEARS', size: 38, color: GX.blueBright },
    { text: 'FINTECH · HEALTH · RETAIL · GENAI', size: 32, color: GX.redBright },
  ], 1024, 640, GX.blue), []);
  useFrame((state) => {
    if (!card.current || reduced) return;
    const t = state.clock.elapsedTime;
    card.current.position.y = IDENTITY_SPOT.y + Math.sin(t * 0.9) * 0.35;
    card.current.rotation.y = -Math.PI / 2 + Math.sin(t * 0.4) * 0.08;
  });
  return (
    <group>
      <mesh ref={card} position={[IDENTITY_SPOT.x, IDENTITY_SPOT.y, IDENTITY_SPOT.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10.4, 6.5]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[IDENTITY_SPOT.x, 1.2, IDENTITY_SPOT.z]}>
        <cylinderGeometry args={[2.4, 3.2, 2.4, 24, 1, true]} />
        <meshBasicMaterial color={glow(GX.blue, 0.9)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── arsenal forge — flickering neon sign wall ───────────────────────────────
export function NeonSignWall({ reduced }: { reduced: boolean }) {
  const signs = useMemo(() => skillCategories.map((c, i) => ({
    tex: textTexture([{ text: c.label.toUpperCase(), size: 64, color: NEONS[i % NEONS.length] }], 768, 144, NEONS[i % NEONS.length]),
    row: Math.floor(i / 2),
    col: i % 2,
    seed: rnd(i * 7 + 3) * 10,
  })), []);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (!m) return;
      const flick = Math.sin(t * 7 + signs[i].seed) > -0.92 ? 1 : 0.3;
      m.opacity = 0.95 * flick;
    });
  });
  return (
    <group position={[ARSENAL_SPOT.x, ARSENAL_SPOT.y, ARSENAL_SPOT.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[26, 28, 0.6]} />
        <meshBasicMaterial color={'#060810'} />
      </mesh>
      {signs.map((s, i) => (
        <mesh key={i} position={[(s.col === 0 ? -6.4 : 6.4), 10.5 - s.row * 3.5, 0.1]}>
          <planeGeometry args={[11.6, 2.2]} />
          <meshBasicMaterial ref={(m) => { mats.current[i] = m; }} map={s.tex} transparent />
        </mesh>
      ))}
    </group>
  );
}

// ── era portals along the TIME TUNNEL (ring top) ────────────────────────────
function filmTexture(color: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 126);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.55, `${color}26`);
  g.addColorStop(0.82, `${color}88`);
  g.addColorStop(1, `${color}EE`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}

function EraPortal({ index }: { index: number }) {
  const x = PORTAL_XS[index];
  const color = NEONS[index % NEONS.length];
  const film = useRef<THREE.Mesh>(null);
  const film2 = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const sparks = useRef<(THREE.Mesh | null)[]>([]);
  const tex = useMemo(() => filmTexture(color), [color]);
  const label = useMemo(() => textTexture([
    { text: `ERA 0${index + 1}`, size: 54, color: GX.white },
    { text: experiences[index].period.toUpperCase(), size: 34, color },
  ], 640, 200, color), [index, color]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (film.current) {
      const s = 1 + Math.sin(t * 1.8 + index) * 0.045;
      film.current.scale.setScalar(s);
      film.current.rotation.z = t * 0.18;
      (film.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 2.3 + index * 2) * 0.13 + scrollBus.warp * 0.3;
    }
    if (film2.current) {
      film2.current.rotation.z = -t * 0.27;
      film2.current.scale.setScalar(0.92 + Math.sin(t * 1.4 + index * 3) * 0.05);
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.9 + Math.sin(t * 2 + index) * 0.5 + scrollBus.warp * 2.2;
    }
    // energy sparks spiralling INTO the surface — the portal is feeding
    sparks.current.forEach((m, i) => {
      if (!m) return;
      const k = ((t * (0.4 + (i % 4) * 0.1) + i / 12) % 1);
      const a = i * 2.4 + t * 0.7;
      const r = 4.4 * (1 - k * 0.85);
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); // in the portal's disc plane
      m.scale.setScalar(0.16 * (1 - k) + 0.03);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - k);
    });
  });
  return (
    <group position={[x, 4.6, PORTAL_Z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[4.4, 0.2, 14, 96]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.9} toneMapped={false} roughness={0.25} metalness={0.5} />
      </mesh>
      <mesh ref={film}>
        <circleGeometry args={[4.22, 48]} />
        <meshBasicMaterial map={tex} transparent opacity={0.55} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={film2}>
        <circleGeometry args={[3.6, 48]} />
        <meshBasicMaterial map={tex} transparent opacity={0.3} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} ref={(m) => { sparks.current[i] = m; }}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color={glow(color, 2.2)} toneMapped={false} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, 6.4, 0]}>
        <planeGeometry args={[5.4, 1.7]} />
        <meshBasicMaterial map={label} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.5, 48]} />
        <meshBasicMaterial color={glow(color, 1.4)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function EraPortals() {
  return <>{PORTAL_XS.map((_, i) => <EraPortal key={i} index={i} />)}</>;
}

// ── warp speed-lines ────────────────────────────────────────────────────────
export function SpeedLines() {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 110; i++) {
      const x = rnd(i * 3 + 1) * 256;
      const len = 26 + rnd(i * 3 + 2) * 130;
      const y = rnd(i * 3 + 3) * 256;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(${rnd(i * 7 + 5) > 0.5 ? '130,180,255' : '200,140,255'},0.9)`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 1.8, len);
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const w = scrollBus.warp;
    m.visible = w > 0.025;
    if (!m.visible) return;
    m.position.copy(state.camera.position);
    m.quaternion.copy(state.camera.quaternion);
    m.rotateX(Math.PI / 2);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.min(1, w * 1.25);
    if (mat.map) mat.map.offset.y -= dt * (3 + w * 11);
  });
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[6, 6, 60, 24, 1, true]} />
      <meshBasicMaterial map={tex} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// ── anomaly billboards ──────────────────────────────────────────────────────
function Billboard({ index, stabilized, onStabilize }: { index: number; stabilized: boolean; onStabilize: () => void }) {
  const spot = ANOM_SPOTS[index];
  const proj = projects[index];
  const group = useRef<THREE.Group>(null);
  const t0 = useRef(0);
  const activeTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — ACTIVE`, size: 44, color: GX.redBright },
    { text: proj.name.toUpperCase(), size: 54, color: GX.white },
    { text: '[ CLICK TO STABILIZE ]', size: 34, color: GX.blueBright },
  ], 1024, 560, GX.red), [index, proj.name]);
  const stableTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — RESOLVED`, size: 44, color: GX.blueBright },
    { text: proj.name.toUpperCase(), size: 54, color: GX.white },
    { text: 'p95 < 350ms · SHIPPED · AUDITED', size: 34, color: GX.violetBright },
  ], 1024, 560, GX.blue), [index, proj.name]);
  useFrame((state, dt) => {
    t0.current += dt;
    const g = group.current;
    if (!g) return;
    if (!stabilized) {
      g.position.x = spot.x + (rnd(Math.floor(t0.current * 19) + index * 7) - 0.5) * 0.3;
      g.position.y = 6 + (rnd(Math.floor(t0.current * 23) + index * 13) - 0.5) * 0.22;
    } else {
      g.position.x += (spot.x - g.position.x) * 0.1;
      g.position.y = 6 + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.15;
    }
  });
  return (
    <group ref={group} position={[spot.x, 6, spot.z]} rotation={[0, index === 0 ? 0.9 : -0.4, 0]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onStabilize(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!stabilized) setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <planeGeometry args={[12, 6.6]} />
        <meshBasicMaterial map={stabilized ? stableTex : activeTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4.6, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 3.4, 8]} />
        <meshBasicMaterial color={'#0A0D16'} />
      </mesh>
    </group>
  );
}

export function AnomalyBillboards({ booted, onBoot }: { booted: Set<string>; onBoot: (id: string) => void }) {
  return (
    <>
      {[0, 1].map(i => (
        <Billboard key={i} index={i} stabilized={booted.has(`anomaly-${i}`)} onStabilize={() => onBoot(`anomaly-${i}`)} />
      ))}
    </>
  );
}

// ── credentials court — plaques in READING ORDER along the approach ─────────
export function CredsCourt({ reduced }: { reduced: boolean }) {
  // approach is north→south on RING EAST: lower z = encountered first.
  // Order: NODE cert → REACT cert → B.TECH (matches the DOM panel order).
  const cards = useMemo(() => [
    {
      tex: textTexture([
        { text: `[${certifications[0].badge}] VERIFIED ✓`, size: 44, color: GX.blueBright },
        { text: certifications[0].title.toUpperCase(), size: 40, color: GX.white },
        { text: certifications[0].issuer.toUpperCase(), size: 30, color: GX.violetBright },
      ], 900, 420, GX.blue),
      z: CREDS_SPOT.z + 10, y: 5.2,
    },
    {
      tex: textTexture([
        { text: `[${certifications[1].badge}] VERIFIED ✓`, size: 44, color: GX.blueBright },
        { text: certifications[1].title.toUpperCase(), size: 40, color: GX.white },
        { text: certifications[1].issuer.toUpperCase(), size: 30, color: GX.violetBright },
      ], 900, 420, GX.blue),
      z: CREDS_SPOT.z, y: 6.4,
    },
    {
      tex: textTexture([
        { text: '[B.TECH] VERIFIED ✓', size: 44, color: GX.violetBright },
        { text: education.field.toUpperCase(), size: 38, color: GX.white },
        { text: `${education.institution.toUpperCase()} · ${education.year}`, size: 28, color: GX.blueBright },
      ], 900, 420, GX.violet),
      z: CREDS_SPOT.z - 10, y: 5.2,
    },
  ], []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = cards[i].y + Math.sin(t * 0.8 + i * 2) * 0.3;
    });
  });
  return (
    <group>
      {cards.map((c, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={[CREDS_SPOT.x, c.y, c.z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[8.6, 4]} />
            <meshBasicMaterial map={c.tex} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── transmission row ────────────────────────────────────────────────────────
export function TransmissionRow() {
  const boards = useMemo(() => blogPosts.map((b, i) => ({
    tex: textTexture([
      { text: `TRANSMISSION 0${i + 1}`, size: 34, color: NEONS[i % NEONS.length] },
      { text: b.tags[0].toUpperCase(), size: 48, color: GX.white },
      { text: `${b.date.toUpperCase()} · ${b.readTime.toUpperCase()}`, size: 26, color: GX.dim },
    ], 860, 380, NEONS[i % NEONS.length]),
    z: TRANS_SPOT.z + (1 - i) * 10, // first post encountered first (north → south)
  })), []);
  return (
    <group>
      {boards.map((b, i) => (
        <group key={i} position={[TRANS_SPOT.x, 5 + (i % 2) * 2.2, b.z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[8, 3.6]} />
            <meshBasicMaterial map={b.tex} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── the choice ──────────────────────────────────────────────────────────────
function Pill({ dx, color, onPick }: { dx: number; color: string; onPick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 0.9 + Math.sin(t * 1.4 + dx) * 0.16;
    ref.current.rotation.z = 0.5 + Math.sin(t * 0.7 + dx) * 0.12;
    ref.current.rotation.y += 0.004;
  });
  return (
    <group position={[PILLS_SPOT.x + dx, PILLS_SPOT.y, PILLS_SPOT.z]}>
      <group
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onPick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <mesh>
          <capsuleGeometry args={[0.42, 0.95, 12, 24]} />
          <meshStandardMaterial color={color} roughness={0.16} metalness={0.25} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.12, 48]} />
        <meshBasicMaterial color={glow(color, 1.6)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Pills({ onRed, onBlue }: { onRed: () => void; onBlue: () => void }) {
  return (
    <group>
      <mesh position={[PILLS_SPOT.x, 0.08, PILLS_SPOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.8, 64]} />
        <meshBasicMaterial color={glow(GX.violet, 1.7)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Pill dx={-2.1} color={GX.red} onPick={onRed} />
      <Pill dx={2.1} color={GX.blue} onPick={onBlue} />
    </group>
  );
}

// ── the phoenix — a sleek falcon silhouette in a red→royal→blue gradient.
// Swept vertex-colored wings flap from the shoulder, twin tail streamers
// flutter, and a subtle spark trail follows. Always airborne; banks into
// turns; clicking it leads you to an unanswered question.

// swept wing with a true color gradient: royal at the shoulder → tip color.
// Root sits at the origin so rotation.z flaps it like a real shoulder joint.
function makeWing(dir: 1 | -1, tip: THREE.Color, royal: THREE.Color): THREE.BufferGeometry {
  // x extends outward, z runs along the body (−z = forward)
  const pts: [number, number, number][] = [
    [0, 0, -0.18],            // 0 shoulder leading
    [0, 0, 0.34],             // 1 shoulder trailing
    [dir * 0.95, 0.04, -0.38],// 2 mid leading (swept forward)
    [dir * 0.9, 0.02, 0.42],  // 3 mid trailing
    [dir * 1.85, 0.1, 0.18],  // 4 wing tip (swept back)
  ];
  const tris = [0, 2, 1, 1, 2, 3, 2, 4, 3];
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  for (const i of tris) {
    const p = pts[i];
    pos.push(p[0], p[1], p[2]);
    // HSL hue sweep (royal → tip) — passes through vivid magentas/cyans
    // instead of muddy RGB midpoints
    const k = Math.pow(Math.min(1, Math.abs(p[0]) / 1.85), 0.8);
    c.copy(royal).lerpHSL(tip, k);
    col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export function Phoenix({ idle, reduced, onQuest }: { idle: boolean; reduced: boolean; onQuest: () => void }) {
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const tailL = useRef<THREE.Mesh>(null);
  const tailR = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3());
  const proj = useRef(new THREE.Vector3());
  const trail = useRef<(THREE.Mesh | null)[]>([]);
  const history = useRef<THREE.Vector3[]>(Array.from({ length: 30 }, () => new THREE.Vector3(0, 3, 30)));
  const tick = useRef(0);
  const bank = useRef(0);

  // kept just under the bloom threshold so the gradient stays SATURATED
  // (overdriven colors bloom to white and eat the hue)
  const redC = useMemo(() => glow(GX.redBright, 1.35), []);
  const royalC = useMemo(() => glow(GX.violetBright, 1.25), []);
  const blueC = useMemo(() => glow(GX.blueBright, 1.35), []);
  const wingGeoL = useMemo(() => makeWing(-1, redC, royalC), [redC, royalC]);
  const wingGeoR = useMemo(() => makeWing(1, blueC, royalC), [blueC, royalC]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // glide ahead of the traveler — always airborne
    target.current.set(
      scrollBus.x + scrollBus.hx * 10 - scrollBus.hz * 1.4,
      reduced ? 3.1 : 3.1 + Math.sin(t * 1.4) * 0.5 + Math.sin(t * 0.55) * 0.25,
      scrollBus.z + scrollBus.hz * 10 + scrollBus.hx * 1.4,
    );
    const beforeX = g.position.x;
    g.position.lerp(target.current, 0.06);
    if (idle) {
      g.lookAt(state.camera.position);
      bank.current *= 0.92;
    } else {
      g.lookAt(g.position.x + scrollBus.hx * 4, g.position.y, g.position.z + scrollBus.hz * 4);
      // smooth banking into lateral motion
      const lateral = THREE.MathUtils.clamp((g.position.x - beforeX) * 5, -0.55, 0.55);
      bank.current += (lateral - bank.current) * 0.08;
    }
    g.rotateZ(bank.current);
    g.rotateX(0.14); // slight nose-down so the wing surfaces read from behind

    // shoulder-joint flap around a dihedral resting V — wings never go edge-on
    const phase = t * (idle ? 3 : 6.5);
    const flap = reduced ? 0 : Math.sin(phase) * 0.34 + Math.sin(phase * 2) * 0.08;
    if (wingL.current) wingL.current.rotation.z = -(0.24 + flap);
    if (wingR.current) wingR.current.rotation.z = 0.24 + flap;
    // tail streamers flutter gently
    const flut = reduced ? 0 : Math.sin(t * 3.2) * 0.12;
    if (tailL.current) tailL.current.rotation.y = 0.22 + flut;
    if (tailR.current) tailR.current.rotation.y = -0.22 - flut;

    // subtle spark trail
    tick.current++;
    if (tick.current % 3 === 0 && !reduced) {
      history.current.pop();
      history.current.unshift(g.position.clone());
    }
    trail.current.forEach((m, i) => {
      if (!m) return;
      const h = history.current[(i + 1) * 4 - 1];
      if (h) m.position.copy(h);
      const k = 1 - (i + 1) / 8;
      m.scale.setScalar(0.09 * k + 0.02);
      (m.material as THREE.MeshBasicMaterial).opacity = reduced ? 0 : 0.45 * k;
    });

    // publish screen position (QA + UI hints)
    proj.current.copy(g.position).project(state.camera);
    scrollBus.rabbitScreen.x = ((proj.current.x + 1) / 2) * state.size.width;
    scrollBus.rabbitScreen.y = ((1 - proj.current.y) / 2) * state.size.height;
  });

  return (
    <>
      <group
        ref={group}
        scale={1.15}
        onClick={(e) => { e.stopPropagation(); onQuest(); }}
        onPointerOver={(e) => { e.stopPropagation(); setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        {/* fuselage — sleek royal teardrop */}
        <mesh scale={[0.16, 0.14, 0.62]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={royalC} toneMapped={false} />
        </mesh>
        {/* neck — smooth taper into the head */}
        <mesh position={[0, 0.045, -0.5]} rotation={[-1.25, 0, 0]} scale={[0.085, 0.2, 0.08]}>
          <cylinderGeometry args={[0.7, 1, 1, 10]} />
          <meshBasicMaterial color={royalC} toneMapped={false} />
        </mesh>
        {/* head — small rounded skull */}
        <mesh position={[0, 0.11, -0.66]} scale={[0.085, 0.08, 0.105]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={glow(GX.white, 1.7)} toneMapped={false} />
        </mesh>
        {/* beak — short, pointed, slightly down-turned */}
        <mesh position={[0, 0.09, -0.79]} rotation={[-Math.PI / 2 - 0.18, 0, 0]} scale={[0.04, 0.13, 0.04]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshBasicMaterial color={glow('#FFD9A0', 1.9)} toneMapped={false} />
        </mesh>
        {/* eyes — two crimson points */}
        {[-0.045, 0.045].map(ex => (
          <mesh key={ex} position={[ex, 0.13, -0.71]} scale={0.018}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color={glow(GX.redBright, 2.4)} toneMapped={false} />
          </mesh>
        ))}
        {/* wings — shoulder-pivoted, gradient royal→red / royal→blue */}
        <mesh ref={wingL} geometry={wingGeoL} position={[-0.12, 0.04, -0.05]}>
          <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={wingR} geometry={wingGeoR} position={[0.12, 0.04, -0.05]}>
          <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* twin tail streamers */}
        <mesh ref={tailL} position={[-0.05, 0, 0.62]} rotation={[0, 0.22, 0]} scale={[0.05, 0.012, 0.55]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={redC} toneMapped={false} />
        </mesh>
        <mesh ref={tailR} position={[0.05, 0, 0.62]} rotation={[0, -0.22, 0]} scale={[0.05, 0.012, 0.55]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={blueC} toneMapped={false} />
        </mesh>
      </group>
      {/* spark trail — small, fading, no bloom blobs */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <mesh key={i} ref={(m) => { trail.current[i] = m; }}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial
            color={i < 2 ? redC : i < 5 ? royalC : blueC}
            transparent opacity={0} depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ── celebration glyph burst (district completed / answer correct) ───────────
export function GlyphBurst({ x, z, color, onDone }: { x: number; z: number; color: string; onDone: () => void }) {
  const N = 26;
  const points = useRef<THREE.Points>(null);
  const start = useRef<number | null>(null);
  const done = useRef(false);
  const { geo, vels } = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const v: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const sp = 5 + rnd(i * 3 + 1) * 7;
      v.push({ x: Math.cos(a) * sp * 0.6, y: 6 + rnd(i * 3 + 2) * 6, z: Math.sin(a) * sp * 0.6 });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo: g, vels: v };
  }, []);
  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    const attr = p.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      attr.setXYZ(i, vels[i].x * t, 6 + vels[i].y * t - 9 * t * t * 0.55, vels[i].z * t);
    }
    attr.needsUpdate = true;
    const m = p.material as THREE.PointsMaterial;
    m.opacity = Math.max(0, 1 - t / 1.6);
    if (t > 1.7 && !done.current) { done.current = true; onDone(); }
  });
  return (
    <points ref={points} position={[x, 0, z]} geometry={geo}>
      <pointsMaterial
        size={0.7} sizeAttenuation transparent depthWrite={false}
        color={glow(color, 2)} blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
