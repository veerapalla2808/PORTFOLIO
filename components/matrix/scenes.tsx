'use client';
// NEON GRID v6 — neon Chicago. Curved streets, a real lakefront, landmark
// towers you can ENTER, Navy Pier with a Ferris wheel, the Bean. Buildings
// wear the code-rain shader; interiors are galleries laid out far off-map.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GX, NEONS, STREETS, SIGNPOSTS, GATE_ARCH, BEAN, LAKE_X,
  LANDMARKS, ERA_FLOORS, ZONES, zoneAt,
} from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';
import { skillCategories, projects, personal, certifications, education, blogPosts, experiences } from '@/lib/data';

const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const setCursor = (on: boolean) => { document.body.style.cursor = on ? 'pointer' : ''; };

// every street segment, flattened (for clamps/exclusions/generators)
const SEGS: { ax: number; az: number; bx: number; bz: number; ux: number; uz: number; len: number; color: string }[] = [];
for (const s of STREETS) {
  for (let i = 0; i < s.pts.length - 1; i++) {
    const [ax, az] = s.pts[i];
    const [bx, bz] = s.pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    SEGS.push({ ax, az, bx, bz, ux: (bx - ax) / len, uz: (bz - az) / len, len, color: s.color });
  }
}

function distToRoads(x: number, z: number) {
  let bd = Infinity;
  for (const s of SEGS) {
    const t = Math.max(0, Math.min(s.len, (x - s.ax) * s.ux + (z - s.az) * s.uz));
    const px = s.ax + s.ux * t, pz = s.az + s.uz * t;
    bd = Math.min(bd, (x - px) ** 2 + (z - pz) ** 2);
  }
  return Math.sqrt(bd);
}

// landmark tower centers (for building-clearance checks)
const LM_CENTERS: [number, number][] = LANDMARKS.map(l => [
  l.entrance[0] - l.outDir[0] * 12,
  l.entrance[1] - l.outDir[1] * 12,
]);

function nearLandmark(x: number, z: number) {
  for (const [lx, lz] of LM_CENTERS) {
    if (Math.hypot(x - lx, z - lz) < 30) return true;
  }
  if (Math.hypot(x - BEAN.x, z - BEAN.z) < 22) return true;
  if (Math.hypot(x - 172, z + 94) < 30) return true;  // ferris wheel
  if (Math.hypot(x + 31, z + 66) < 17) return true;   // theatre
  if (Math.abs(x + 45) < 12) return true;             // the river
  return false;
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

function zenFamily(): string {
  if (typeof document === 'undefined') return '"JetBrains Mono", monospace';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-zen').trim();
  return v || '"JetBrains Mono", monospace';
}

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

// ── shared code-rain facade material (instanced AND plain geometry) ─────────
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
  if (vNy > 0.5) { gl_FragColor = vec4(uBase * 0.6, 1.0); return; }
  float u = vWorld.x + vWorld.z + vSeed * 7.0;
  float v = vWorld.y;
  float colW = 1.05;
  float rowH = 1.3;
  float col = floor(u / colW);
  float row = floor(v / rowH);
  vec2 local = vec2(fract(u / colW), fract(v / rowH));
  float spd = 0.05 + hash(vec2(col, vSeed)) * 0.11;
  float t = fract(v * 0.03 + uTime * spd + hash(vec2(col, 3.7)) * 7.0);
  float b = pow(t, 5.0);
  if (hash(vec2(col, row * 2.3)) < 0.08) b *= 0.15;
  float cyc = floor(uTime * (0.6 + hash(vec2(col, row)) * 1.6));
  float gi = floor(hash(vec2(col * 1.7 + row * 3.1, cyc)) * 63.99);
  vec2 tile = vec2(mod(gi, 8.0), floor(gi / 8.0));
  float glyph = texture2D(uAtlas, (tile + local) / 8.0).r;
  vec3 neon = vHue < 0.5 ? uBlue : (vHue < 1.5 ? uViolet : uRed);
  float surge = clamp(1.0 - (uTime - vSurge) * 0.65, 0.0, 1.0);
  vec3 c = uBase + neon * (glyph * (0.10 + b * 1.7));
  if (t > 0.962) c += (neon * 1.1 + vec3(0.4)) * glyph;
  c += (neon * 2.2 + vec3(0.5)) * glyph * surge;
  c += (hash(gl_FragCoord.xy * 0.7) - 0.5) * 0.04;
  gl_FragColor = vec4(c, 1.0);
}`;

let rainMat: THREE.ShaderMaterial | null = null;
function getRainMat(): THREE.ShaderMaterial {
  if (!rainMat) {
    rainMat = new THREE.ShaderMaterial({
      vertexShader: BLDG_VERT,
      fragmentShader: BLDG_FRAG,
      uniforms: {
        uAtlas: { value: glyphAtlas() },
        uTime: { value: 17.3 },
        uBase: { value: new THREE.Color('#04050C') },
        uBlue: { value: new THREE.Color(GX.blueBright) },
        uViolet: { value: new THREE.Color(GX.violetBright) },
        uRed: { value: new THREE.Color(GX.redBright) },
      },
    });
  }
  return rainMat;
}

// give any plain geometry the attributes the rain shader expects
function rainAttrs(geo: THREE.BufferGeometry, hue: number, seed: number) {
  const n = geo.getAttribute('position').count;
  geo.setAttribute('aHue', new THREE.BufferAttribute(new Float32Array(n).fill(hue), 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(n).fill(seed), 1));
  geo.setAttribute('aSurge', new THREE.BufferAttribute(new Float32Array(n).fill(-100), 1));
  return geo;
}

// drives the shared clock for every rain facade in the scene
export function RainMatDriver({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (!reduced) getRainMat().uniforms.uTime.value = state.clock.elapsedTime;
  });
  return null;
}

// ── per-district atmosphere ─────────────────────────────────────────────────
export function ZoneAmbience() {
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((state, dt) => {
    const zo = zoneAt(scrollBus.x, scrollBus.z);
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      tmp.set(scrollBus.interior ? '#05040D' : zo.fog);
      fog.color.lerp(tmp, Math.min(1, dt * 1.4));
      const farT = scrollBus.topView ? 460 : 170;
      const nearT = scrollBus.topView ? 120 : 24;
      fog.far += (farT - fog.far) * Math.min(1, dt * 2);
      fog.near += (nearT - fog.near) * Math.min(1, dt * 2);
    }
  });
  return (
    <group>
      {ZONES.filter(z => z.id !== 'gate').map(z => (
        <mesh key={z.id} position={[z.x, 0.03, z.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[15, 48]} />
          <meshBasicMaterial color={glow(z.accent, 0.5)} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── streets — asphalt, single-color edges, dashed center lines ──────────────
export function StreetLanes() {
  const { lanes, dashes } = useMemo(() => {
    const laneList: { x: number; z: number; rot: number; len: number; color: string }[] = [];
    const dashList: { x: number; z: number; rot: number }[] = [];
    const DASH = 3.2, GAP = 4.2;
    for (const s of SEGS) {
      const rot = Math.atan2(s.ux, s.uz);
      const nx = -s.uz, nz = s.ux;
      const cx = (s.ax + s.bx) / 2, cz = (s.az + s.bz) / 2;
      for (const side of [-1, 1]) {
        laneList.push({ x: cx + nx * side * 4.6, z: cz + nz * side * 4.6, rot, len: s.len + 1.2, color: s.color });
      }
      for (let d = 3; d < s.len - 2; d += DASH + GAP) {
        dashList.push({ x: s.ax + s.ux * (d + DASH / 2), z: s.az + s.uz * (d + DASH / 2), rot });
      }
    }
    return { lanes: laneList, dashes: dashList };
  }, []);

  const dashMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.14, 0.06, 3.2),
      new THREE.MeshBasicMaterial({ color: glow('#ADC4E8', 0.9), toneMapped: false, transparent: true, opacity: 0.5 }),
      dashes.length,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    dashes.forEach((d, i) => {
      q.setFromEuler(new THREE.Euler(0, d.rot, 0));
      m.compose(new THREE.Vector3(d.x, 0.05, d.z), q, new THREE.Vector3(1, 1, 1));
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, -0.05, -80]}>
        <planeGeometry args={[320, 360]} />
        <meshBasicMaterial color={'#020207'} />
      </mesh>
      {lanes.map((l, i) => (
        <mesh key={i} position={[l.x, 0.06, l.z]} rotation={[0, l.rot, 0]}>
          <boxGeometry args={[0.16, 0.1, l.len]} />
          <meshBasicMaterial color={glow(l.color, 1.3)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── streetlights along every segment ────────────────────────────────────────
export function StreetLights() {
  const lamps = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (const s of SEGS) {
      const nx = -s.uz, nz = s.ux;
      for (let d = 10; d < s.len - 6; d += 19) {
        for (const side of [-1, 1]) {
          const X = s.ax + s.ux * d + nx * side * 5.4;
          const Z = s.az + s.uz * d + nz * side * 5.4;
          let nearNode = false;
          for (const st of STREETS) {
            for (const end of [st.pts[0], st.pts[st.pts.length - 1]]) {
              if (Math.hypot(X - end[0], Z - end[1]) < 9) { nearNode = true; break; }
            }
            if (nearNode) break;
          }
          if (!nearNode) out.push({ x: X, z: Z });
        }
      }
    }
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
    [pole, head, pool].forEach(mm => { mm.instanceMatrix.needsUpdate = true; });
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

// ── filler skyline (kept off roads, landmarks and the lake) ─────────────────
export function CityBlocks({ tier }: { tier: 'S' | 'M' | 'L' }) {
  const step = tier === 'S' ? 26 : tier === 'M' ? 18 : 13;
  const { body, trims, surgeAttr } = useMemo(() => {
    const slots: { x: number; z: number; seed: number }[] = [];
    SEGS.forEach((s, si) => {
      const nx = -s.uz, nz = s.ux;
      for (let d = 8; d < s.len - 4; d += step) {
        for (const side of [-1, 1]) {
          const seed = si * 997 + d * 13 + side * 7;
          const off = 16 + rnd(seed + 1) * 12;
          const X = s.ax + s.ux * d + nx * side * off;
          const Z = s.az + s.uz * d + nz * side * off;
          if (X > LAKE_X - 6) continue;          // lake stays open water
          if (distToRoads(X, Z) < 10) continue;  // never block a street
          if (nearLandmark(X, Z)) continue;      // landmarks own their plots
          slots.push({ x: X, z: Z, seed });
        }
      }
    });
    const n = slots.length;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const hue = new Float32Array(n);
    const seedAttr = new Float32Array(n);
    const bodyMesh = new THREE.InstancedMesh(geo, getRainMat(), n);
    const trimMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const trims = [0, 1, 2, 3].map(() =>
      new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), trimMat, n));
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const q = new THREE.Quaternion();
    slots.forEach((sl, i) => {
      const w = 7 + rnd(sl.seed + 2) * 8;
      const h = 14 + rnd(sl.seed + 3) * 30;
      const dpt = 7 + rnd(sl.seed + 4) * 8;
      m.compose(new THREE.Vector3(sl.x, h / 2, sl.z), q, new THREE.Vector3(w, h, dpt));
      bodyMesh.setMatrixAt(i, m);
      const y = h + 0.1;
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
  }, [step]);

  const timeRef = useRef(17.3);
  const surgeRef = useRef<THREE.InstancedBufferAttribute | null>(null);
  useEffect(() => { surgeRef.current = surgeAttr; }, [surgeAttr]);
  useFrame((state) => { timeRef.current = state.clock.elapsedTime; });

  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.add(body, ...trims);
    return () => {
      g.remove(body, ...trims);
      body.geometry.dispose();
      trims.forEach(tm => tm.geometry.dispose());
      (trims[0].material as THREE.Material).dispose();
    };
  }, [body, trims]);

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

// ── LAKE MICHIGAN — open water east of the Drive ────────────────────────────
export function Lake({ reduced }: { reduced: boolean }) {
  const glints = useRef<(THREE.Mesh | null)[]>([]);
  const rows = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    x: LAKE_X + 14 + rnd(i * 5 + 1) * 130,
    z: -200 + rnd(i * 5 + 2) * 240,
    len: 6 + rnd(i * 5 + 3) * 16,
    seed: rnd(i * 5 + 4) * 10,
  })), []);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    glints.current.forEach((m, i) => {
      if (!m) return;
      const r = rows[i];
      m.position.x = r.x + Math.sin(t * 0.3 + r.seed) * 4;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.05 + (Math.sin(t * 0.8 + r.seed * 3) * 0.5 + 0.5) * 0.1;
    });
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LAKE_X + 90, -0.12, -80]}>
        <planeGeometry args={[220, 360]} />
        <meshBasicMaterial color={'#041018'} />
      </mesh>
      {/* moon-path shimmer toward the pier */}
      {rows.map((r, i) => (
        <mesh key={i} ref={(m) => { glints.current[i] = m; }} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, -0.06, r.z]}>
          <planeGeometry args={[r.len, 0.5]} />
          <meshBasicMaterial color={glow('#9FC2FF', 1)} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── CHICAGO RIVER (south branch) — flows between Franklin & State ───────────
const RIVER_X = -45;

export function River({ reduced }: { reduced: boolean }) {
  const flow = useRef<(THREE.Mesh | null)[]>([]);
  const bits = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    x: RIVER_X - 4 + rnd(i * 9 + 1) * 8,
    z0: 40 - rnd(i * 9 + 2) * 240,
    len: 4 + rnd(i * 9 + 3) * 9,
    speed: 1.6 + rnd(i * 9 + 4) * 2.4,
  })), []);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    flow.current.forEach((m, i) => {
      if (!m) return;
      const b = bits[i];
      m.position.z = (((b.z0 - t * b.speed) % 250) + 250) % 250 - 205;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.06 + (Math.sin(t * 0.9 + i * 2.4) * 0.5 + 0.5) * 0.08;
    });
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RIVER_X, -0.12, -78]}>
        <planeGeometry args={[12, 256]} />
        <meshBasicMaterial color={'#04101C'} />
      </mesh>
      {/* drifting current glints */}
      {bits.map((b, i) => (
        <mesh key={i} ref={(m) => { flow.current[i] = m; }} rotation={[-Math.PI / 2, 0, 0]} position={[b.x, -0.06, b.z0]}>
          <planeGeometry args={[0.5, b.len]} />
          <meshBasicMaterial color={glow('#9FC2FF', 1)} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* glowing embankment edges */}
      {[-6.2, 6.2].map(off => (
        <mesh key={off} position={[RIVER_X + off, 0.02, -78]}>
          <boxGeometry args={[0.18, 0.1, 256]} />
          <meshBasicMaterial color={glow('#27406E', 1.2)} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── bascule bridges (the Batman ones) where Madison & Monroe cross the river ─
function BasculeBridge({ z }: { z: number }) {
  return (
    <group position={[RIVER_X, 0, z]}>
      {/* four tender towers with pyramid roofs + beacons */}
      {([[-7.5, -6.8], [7.5, -6.8], [-7.5, 6.8], [7.5, 6.8]] as [number, number][]).map(([ox, oz], i) => (
        <group key={i} position={[ox, 0, oz]}>
          <mesh position={[0, 3.4, 0]}>
            <boxGeometry args={[2.2, 6.8, 2.2]} />
            <meshStandardMaterial color={'#0B0E18'} roughness={0.4} metalness={0.65} />
          </mesh>
          <mesh position={[0, 7.6, 0]}>
            <coneGeometry args={[1.8, 1.8, 4]} />
            <meshStandardMaterial color={'#101524'} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 8.8, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color={glow(GX.redBright, 2.2)} toneMapped={false} />
          </mesh>
          {/* lit tower windows */}
          <mesh position={[0, 4.2, oz > 0 ? -1.12 : 1.12]}>
            <planeGeometry args={[0.7, 1.1]} />
            <meshBasicMaterial color={glow('#FFD9A0', 1.5)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* side trusses with X-bracing over the water */}
      {[-5.8, 5.8].map(oz => (
        <group key={oz} position={[0, 0, oz]}>
          <mesh position={[0, 5.2, 0]}>
            <boxGeometry args={[14.4, 0.22, 0.22]} />
            <meshBasicMaterial color={glow('#8FA8D8', 1.2)} toneMapped={false} />
          </mesh>
          {[-4.6, 0, 4.6].map(ox => (
            <group key={ox} position={[ox, 3.1, 0]}>
              <mesh rotation={[0, 0, 0.75]}>
                <boxGeometry args={[5.6, 0.16, 0.16]} />
                <meshBasicMaterial color={glow('#5F7BB0', 1.2)} toneMapped={false} />
              </mesh>
              <mesh rotation={[0, 0, -0.75]}>
                <boxGeometry args={[5.6, 0.16, 0.16]} />
                <meshBasicMaterial color={glow('#5F7BB0', 1.2)} toneMapped={false} />
              </mesh>
            </group>
          ))}
          {/* bulb string along the top chord */}
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[-6.4 + i * 1.6, 5.45, 0]}>
              <sphereGeometry args={[0.11, 6, 6]} />
              <meshBasicMaterial color={glow('#FFE8C0', 2)} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Bridges() {
  return (
    <>
      <BasculeBridge z={-40} />
      <BasculeBridge z={-150} />
    </>
  );
}

// ── THE L — seven elevated transit lines with running trains ────────────────
interface LSeg { ax: number; az: number; ux: number; uz: number; len: number; cum: number }
interface LLine { name: string; pts: [number, number][]; color: string; off: number; y: number; speed: number; start: number; deck: boolean }

const LOOP_PTS: [number, number][] = [[-70, -44], [-24, -44], [-24, -146], [-70, -146], [-70, -44]];

const L_LINES: LLine[] = [
  { name: 'brown', pts: LOOP_PTS, color: '#9A5B2D', off: -1.6, y: 10.2, speed: 9, start: 0, deck: true },
  { name: 'orange', pts: LOOP_PTS, color: '#FF7A1A', off: -0.55, y: 10.2, speed: 10.5, start: 0.35, deck: false },
  { name: 'green', pts: LOOP_PTS, color: '#27B05A', off: 0.55, y: 10.2, speed: 8.4, start: 0.6, deck: false },
  { name: 'pink', pts: LOOP_PTS, color: '#FF6FB5', off: 1.6, y: 10.2, speed: 11.4, start: 0.82, deck: false },
  { name: 'red', pts: [[-15, 46], [-15, -200]], color: '#E03131', off: 0, y: 13.6, speed: 13, start: 0.2, deck: true },
  { name: 'blue', pts: [[-100, -35], [64, -35]], color: '#2D7DFF', off: 0, y: 12.2, speed: 12, start: 0.5, deck: true },
  { name: 'yellow', pts: [[-25, 42], [0, 36], [22, 31], [44, 26]], color: '#F2C81E', off: 0, y: 12.8, speed: 7, start: 0, deck: true },
];

function lineSegs(pts: [number, number][], off: number): { segs: LSeg[]; total: number } {
  // lateral offset per segment (simple shift; junction kinks are fine at night)
  const segs: LSeg[] = [];
  let cum = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax0, az0] = pts[i];
    const [bx0, bz0] = pts[i + 1];
    const len = Math.hypot(bx0 - ax0, bz0 - az0);
    const ux = (bx0 - ax0) / len, uz = (bz0 - az0) / len;
    const nx = -uz, nz = ux;
    segs.push({ ax: ax0 + nx * off, az: az0 + nz * off, ux, uz, len, cum });
    cum += len;
  }
  return { segs, total: cum };
}

function posAt(segs: LSeg[], total: number, d: number) {
  const dd = ((d % total) + total) % total;
  for (const s of segs) {
    if (dd <= s.cum + s.len) {
      const t = dd - s.cum;
      return { x: s.ax + s.ux * t, z: s.az + s.uz * t, rot: Math.atan2(s.ux, s.uz) };
    }
  }
  const s = segs[segs.length - 1];
  return { x: s.ax + s.ux * s.len, z: s.az + s.uz * s.len, rot: Math.atan2(s.ux, s.uz) };
}

export function TheL({ reduced }: { reduced: boolean }) {
  const lines = useMemo(() => L_LINES.map(l => ({ ...l, ...lineSegs(l.pts, l.off) })), []);
  const cars = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    let ci = 0;
    for (const l of lines) {
      const head = t * l.speed + l.start * l.total;
      for (let c = 0; c < 3; c++) {
        const m = cars.current[ci++];
        if (!m) continue;
        const p = posAt(l.segs, l.total, head - c * 3.6);
        m.position.set(p.x, l.y + 0.75, p.z);
        m.rotation.y = p.rot;
      }
    }
  });

  return (
    <group>
      {lines.map((l, li) => (
        <group key={l.name}>
          {/* rails */}
          {l.segs.map((s, si) => {
            const cx = s.ax + s.ux * s.len / 2, cz = s.az + s.uz * s.len / 2;
            const rot = Math.atan2(s.ux, s.uz);
            const nx = -s.uz, nz = s.ux;
            return (
              <group key={si}>
                {[-0.55, 0.55].map(ro => (
                  <mesh key={ro} position={[cx + nx * ro, l.y + 0.32, cz + nz * ro]} rotation={[0, rot, 0]}>
                    <boxGeometry args={[0.14, 0.14, s.len]} />
                    <meshBasicMaterial color={glow(l.color, 1.25)} toneMapped={false} />
                  </mesh>
                ))}
                {l.deck && (
                  <mesh position={[cx, l.y, cz]} rotation={[0, rot, 0]}>
                    <boxGeometry args={[l.pts === LOOP_PTS ? 5.4 : 2.6, 0.5, s.len + 0.8]} />
                    <meshStandardMaterial color={'#0A0D16'} roughness={0.5} metalness={0.55} />
                  </mesh>
                )}
                {/* support columns */}
                {l.deck && Array.from({ length: Math.max(1, Math.floor(s.len / 14)) }, (_, k) => {
                  const d = 7 + k * 14;
                  return (
                    <mesh key={k} position={[s.ax + s.ux * d, l.y / 2, s.az + s.uz * d]}>
                      <cylinderGeometry args={[0.26, 0.34, l.y, 8]} />
                      <meshStandardMaterial color={'#0B0E18'} roughness={0.5} metalness={0.6} />
                    </mesh>
                  );
                })}
              </group>
            );
          })}
          {/* train — three glowing cars */}
          {[0, 1, 2].map(c => (
            <mesh key={c} ref={(m) => { cars.current[li * 3 + c] = m; }}>
              <boxGeometry args={[1.15, 1.15, 3.1]} />
              <meshBasicMaterial color={glow(l.color, c === 0 ? 2.1 : 1.5)} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── THE GRID THEATRE — vertical blade marquee on State St ───────────────────
export function Theatre({ reduced }: { reduced: boolean }) {
  const fontsReady = useFontsReady();
  const bladeTex = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 200; cv.height = 880;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#1A060C';
    ctx.fillRect(0, 0, 200, 880);
    ctx.strokeStyle = '#FF3B52';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#FF3B52';
    ctx.shadowBlur = 22;
    ctx.strokeRect(8, 8, 184, 864);
    ctx.shadowBlur = 0;
    // marquee bulbs along the border
    for (let i = 0; i < 22; i++) {
      for (const x of [26, 174]) {
        ctx.beginPath();
        ctx.arc(x, 40 + i * 38, 6, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#FFE8C0' : '#FFB36B';
        ctx.shadowColor = '#FFD9A0';
        ctx.shadowBlur = 12;
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 132px ${zenFamily()}`;
    ctx.fillStyle = '#F4F7FF';
    ctx.shadowColor = '#FF3B52';
    ctx.shadowBlur = 30;
    ['G', 'R', 'I', 'D'].forEach((ch, i) => {
      ctx.fillText(ch, 100, 150 + i * 200);
    });
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const marqueeTex = useMemo(() => textTexture([
    { text: 'NOW SHOWING', size: 30, color: '#FFD9A0' },
    { text: 'THE NEON GRID · 11 YEARS · NO INTERMISSION', size: 34, color: GX.white },
  ], 900, 170, '#FF3B52'), []);
  const bulbs = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (reduced || !bulbs.current) return;
    // chasing marquee lights
    (bulbs.current.material as THREE.MeshBasicMaterial).color.setScalar(
      2 + Math.sin(state.clock.elapsedTime * 9) * 0.8,
    );
  });
  return (
    <group position={[-29, 0, -66]}>
      {/* theatre hall behind */}
      <mesh position={[-5, 11, 0]}>
        <boxGeometry args={[10, 22, 14]} />
        <meshStandardMaterial color={'#0A0810'} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* vertical blade sign */}
      <mesh position={[0.4, 13.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 15]} />
        <meshBasicMaterial map={bladeTex} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* canopy marquee over the doors */}
      <mesh position={[1.4, 5.2, 0]}>
        <boxGeometry args={[2.8, 1.7, 9.4]} />
        <meshStandardMaterial color={'#140509'} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[2.85, 5.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[9, 1.5]} />
        <meshBasicMaterial map={marqueeTex} transparent />
      </mesh>
      {/* chasing bulb strip under the canopy */}
      <mesh ref={bulbs} position={[2.9, 4.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[9, 0.16]} />
        <meshBasicMaterial color={glow('#FFE8C0', 2)} toneMapped={false} />
      </mesh>
      {/* lobby door glow */}
      <mesh position={[0.15, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial color={glow('#FF3B52', 0.7)} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── NAVY PIER — deck, railings, and the Ferris wheel at the end ─────────────
export function NavyPier({ reduced }: { reduced: boolean }) {
  const wheel = useRef<THREE.Group>(null);
  const cabins = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, dt) => {
    if (reduced || !wheel.current) return;
    wheel.current.rotation.z += dt * 0.1;
    cabins.current.forEach(m => { if (m) m.rotation.z -= dt * 0.1; });
  });
  const W = { x: 172, z: -94 };
  return (
    <group>
      {/* pier deck */}
      <mesh position={[112, -0.4, -110]}>
        <boxGeometry args={[112, 0.8, 13]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* railings */}
      {[-6.2, 6.2].map(off => (
        <mesh key={off} position={[112, 0.9, -110 + off]}>
          <boxGeometry args={[112, 0.08, 0.08]} />
          <meshBasicMaterial color={glow(GX.red, 1.4)} toneMapped={false} />
        </mesh>
      ))}
      {/* end platform */}
      <mesh position={[160, -0.35, -110]}>
        <cylinderGeometry args={[11, 11, 0.7, 24]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* FERRIS WHEEL */}
      <group position={[W.x, 16, W.z]}>
        <group ref={wheel}>
          <mesh>
            <torusGeometry args={[14, 0.22, 10, 64]} />
            <meshBasicMaterial color={glow(GX.violetBright, 1.7)} toneMapped={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[10.5, 0.1, 8, 48]} />
            <meshBasicMaterial color={glow(GX.blueBright, 1.4)} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={`s${i}`} rotation={[0, 0, (i / 8) * Math.PI]}>
              <boxGeometry args={[28, 0.12, 0.12]} />
              <meshBasicMaterial color={glow('#9FB4D8', 1)} transparent opacity={0.8} />
            </mesh>
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={`c${i}`} position={[Math.cos(a) * 14, Math.sin(a) * 14, 0]} ref={(m) => { cabins.current[i] = m; }}>
                <boxGeometry args={[1.5, 1.7, 1.5]} />
                <meshBasicMaterial color={glow(i % 2 === 0 ? GX.red : GX.blue, 1.6)} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
        {/* A-frame supports */}
        {[-1, 1].map(s => (
          <mesh key={s} position={[s * 4, -8, 0]} rotation={[0, 0, s * 0.42]}>
            <boxGeometry args={[0.7, 18, 0.7]} />
            <meshStandardMaterial color={'#0B0E18'} roughness={0.5} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── THE BEAN — hub plaza sculpture ──────────────────────────────────────────
export function BeanPlaza({ reduced }: { reduced: boolean }) {
  const bean = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (reduced || !bean.current) return;
    bean.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
  });
  return (
    <group position={[BEAN.x, 0, BEAN.z]}>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[13, 40]} />
        <meshStandardMaterial color={'#0B0F1C'} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={bean} position={[0, 3.4, 0]} scale={[5.2, 3, 3.4]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color={'#C9D2E0'} roughness={0.12} metalness={0.95} />
      </mesh>
      <pointLight position={[6, 5, 6]} intensity={120} color={GX.violetBright} />
      <pointLight position={[-6, 4, -5]} intensity={90} color={GX.blueBright} />
    </group>
  );
}

// ── LANDMARK TOWERS — sections you can enter ────────────────────────────────
function Entrance({ x, z, outDir, color, label }: { x: number; z: number; outDir: [number, number]; color: string; label: string }) {
  const fontsReady = useFontsReady();
  const tex = useMemo(() => textTexture([
    { text: label, size: 56, color: GX.white, family: zenFamily(), font: '400' },
    { text: 'DRIVE IN ▸ ENTER', size: 30, color },
  ], 760, 190, color), [label, color, fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const rotY = Math.atan2(outDir[0], outDir[1]);
  const door = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (door.current) {
      (door.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
    }
  });
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {[-3.2, 3.2].map(off => (
        <mesh key={off} position={[off, 3, -1]}>
          <boxGeometry args={[0.7, 6.4, 0.7]} />
          <meshBasicMaterial color={glow(color, 1.8)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 6.4, -1]}>
        <boxGeometry args={[7.2, 0.6, 0.7]} />
        <meshBasicMaterial color={glow(color, 1.8)} toneMapped={false} />
      </mesh>
      <mesh ref={door} position={[0, 3, -1.1]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial color={glow(color, 0.8)} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 8.6, -1]}>
        <planeGeometry args={[8.4, 2.1]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function RainBox({ x, z, w, h, d, hue, seed }: { x: number; z: number; w: number; h: number; d: number; hue: number; seed: number }) {
  const geo = useMemo(() => rainAttrs(new THREE.BoxGeometry(w, h, d), hue, seed), [w, h, d, hue, seed]);
  return <mesh geometry={geo} material={getRainMat()} position={[x, h / 2, z]} />;
}

function RainCylinder({ x, z, r, h, hue, seed, sx = 1 }: { x: number; z: number; r: number; h: number; hue: number; seed: number; sx?: number }) {
  const geo = useMemo(() => rainAttrs(new THREE.CylinderGeometry(r, r, h, 24), hue, seed), [r, h, hue, seed]);
  return <mesh geometry={geo} material={getRainMat()} position={[x, h / 2, z]} scale={[sx, 1, 1]} />;
}

export function Landmarks() {
  return (
    <group>
      {/* SPIRE OF ERAS (Willis homage): 3×3 stepped tubes + twin antennas */}
      <group>
        {([
          [-8, -8, 52], [0, -8, 67], [8, -8, 52],
          [-8, 0, 67], [0, 0, 93], [8, 0, 67],
          [-8, 8, 52], [0, 8, 75], [8, 8, 52],
        ] as [number, number, number][]).map(([ox, oz, h], i) => (
          <RainBox key={i} x={-104 + ox} z={-80 + oz} w={8} h={h} d={8} hue={1} seed={i * 3 + 2} />
        ))}
        {[-3, 3].map(ox => (
          <mesh key={ox} position={[-104 + ox, 104, -80]}>
            <cylinderGeometry args={[0.12, 0.2, 22, 6]} />
            <meshBasicMaterial color={glow(GX.white, 1.8)} toneMapped={false} />
          </mesh>
        ))}
        <Entrance x={-92} z={-80} outDir={[1, 0]} color={GX.violetBright} label="SPIRE OF ERAS" />
      </group>

      {/* CROSSBRACE TOWER (Hancock homage): taper + X-braces + antennas */}
      <group>
        <RainBox x={100} z={-18} w={24} h={32} d={20} hue={2} seed={11} />
        <RainBox x={100} z={-18} w={19} h={58} d={16} hue={2} seed={12} />
        <RainBox x={100} z={-18} w={14} h={81} d={12} hue={2} seed={13} />
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[100, 14 + i * 19, -18 + (i % 2 === 0 ? 8.6 : -8.6)]} rotation={[0, 0, i % 2 === 0 ? 0.7 : -0.7]}>
            <boxGeometry args={[16, 0.5, 0.5]} />
            <meshBasicMaterial color={glow(GX.redBright, 1.8)} toneMapped={false} />
          </mesh>
        ))}
        {[-2.5, 2.5].map(ox => (
          <mesh key={ox} position={[100 + ox, 90, -18]}>
            <cylinderGeometry args={[0.1, 0.18, 18, 6]} />
            <meshBasicMaterial color={glow(GX.white, 1.8)} toneMapped={false} />
          </mesh>
        ))}
        <Entrance x={88} z={-18} outDir={[-1, 0]} color={GX.redBright} label="CROSSBRACE TOWER" />
      </group>

      {/* LAKESIDE HELIX (Lake Point homage): curved elliptical tower */}
      <group>
        <RainCylinder x={104} z={-80} r={9} h={66} hue={0} seed={21} sx={0.55} />
        <mesh position={[104, 66.4, -80]} scale={[0.55, 1, 1]}>
          <torusGeometry args={[9, 0.18, 8, 40]} />
          <meshBasicMaterial color={glow(GX.blueBright, 1.8)} toneMapped={false} />
        </mesh>
        <Entrance x={92} z={-80} outDir={[-1, 0]} color={GX.blueBright} label="LAKESIDE HELIX" />
      </group>

      {/* THE NEEDLE (Trump homage): setbacks + spire */}
      <group>
        <RainBox x={20} z={-2} w={20} h={29} d={14} hue={0} seed={31} />
        <RainBox x={20} z={-2} w={15} h={52} d={11} hue={0} seed={32} />
        <RainBox x={20} z={-2} w={10} h={72} d={8} hue={0} seed={33} />
        <mesh position={[20, 82, -2]}>
          <coneGeometry args={[0.5, 20, 8]} />
          <meshBasicMaterial color={glow(GX.blueBright, 1.9)} toneMapped={false} />
        </mesh>
        <Entrance x={20} z={-16} outDir={[0, -1]} color={GX.blueBright} label="THE NEEDLE" />
      </group>

      {/* WATCHTOWER (Aon homage): pale monolith + orrery crown */}
      <group>
        <RainBox x={20} z={-112} w={16} h={75} d={16} hue={1} seed={41} />
        {[3, 4.4].map((r, i) => (
          <mesh key={r} position={[20, 79, -112]} rotation={[0.6 + i * 0.5, 0, 0.3]}>
            <torusGeometry args={[r, 0.08, 8, 48]} />
            <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.7)} toneMapped={false} />
          </mesh>
        ))}
        <Entrance x={20} z={-126} outDir={[0, 1]} color={GX.violetBright} label="THE WATCHTOWER" />
      </group>

      {/* GRAND MART (Merchandise Mart homage): the wide one */}
      <group>
        <RainBox x={-136} z={-40} w={28} h={26} d={22} hue={0} seed={51} />
        <RainBox x={-136} z={-40} w={20} h={36} d={16} hue={0} seed={52} />
        <Entrance x={-122} z={-40} outDir={[1, 0]} color={GX.blueBright} label="GRAND MART" />
      </group>

      {/* TWIN COILS (Marina City homage): corncob pair */}
      <group>
        {[-7, 7].map((oz, ci) => (
          <group key={oz}>
            <RainCylinder x={-108} z={-176 + oz} r={5.4} h={48} hue={1} seed={61 + ci} />
            {[10, 19, 28, 37, 45].map(y => (
              <mesh key={y} position={[-108, y, -176 + oz]}>
                <torusGeometry args={[5.7, 0.14, 8, 28]} />
                <meshBasicMaterial color={glow(GX.violetBright, 1.5)} toneMapped={false} transparent opacity={0.85} />
              </mesh>
            ))}
          </group>
        ))}
        <Entrance x={-96} z={-176} outDir={[1, 0]} color={GX.violetBright} label="TWIN COILS" />
      </group>
    </group>
  );
}

// ── city gates arch ─────────────────────────────────────────────────────────
export function GateArch() {
  const fontsReady = useFontsReady();
  const tex = useMemo(() => textTexture([
    { text: 'VEERA PALLA', size: 116, color: GX.white, family: zenFamily(), font: '400' },
    { text: 'NEON CHICAGO · 11 YEARS IN PRODUCTION', size: 34, color: GX.blueBright },
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

// ── junction signposts ──────────────────────────────────────────────────────
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

// ── anomaly alley billboards (open-air section) ─────────────────────────────
const ANOM_SPOTS = [
  { x: 13, z: -103 },
  { x: 15, z: -118 },
];

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
    <group ref={group} position={[spot.x, 6, spot.z]} rotation={[0, index === 0 ? -0.6 : -1.1, 0]}>
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

// ── the choice — pills on the pier-end platform ─────────────────────────────
const PILLS_SPOT = { x: 160, y: 2.6, z: -110 };

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

// ── INTERIORS — galleries far off-map; walls wear the rain shader ───────────
const INT_BASE = (idx: number) => 4000 + idx * 300;

function InteriorShell({ idx, len, accent }: { idx: number; len: number; accent: string }) {
  const bx = INT_BASE(idx);
  const wallGeoL = useMemo(() => rainAttrs(new THREE.BoxGeometry(0.8, 10, len + 12), 1, idx * 7 + 1), [len, idx]);
  const wallGeoR = useMemo(() => rainAttrs(new THREE.BoxGeometry(0.8, 10, len + 12), 0, idx * 7 + 2), [len, idx]);
  const endGeo = useMemo(() => rainAttrs(new THREE.BoxGeometry(13, 10, 0.8), 2, idx * 7 + 3), [len, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {/* floor */}
      <mesh position={[bx, -0.05, -len / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, len + 12]} />
        <meshStandardMaterial color={'#070910'} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* center guide strip */}
      <mesh position={[bx, 0.02, -len / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, len + 8]} />
        <meshBasicMaterial color={glow(accent, 1.4)} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      {/* code-rain walls */}
      <mesh geometry={wallGeoL} material={getRainMat()} position={[bx - 6.5, 5, -len / 2]} />
      <mesh geometry={wallGeoR} material={getRainMat()} position={[bx + 6.5, 5, -len / 2]} />
      <mesh geometry={endGeo} material={getRainMat()} position={[bx, 5, -len - 5]} />
      {/* ceiling light beams */}
      {Array.from({ length: Math.ceil(len / 8) }, (_, i) => (
        <mesh key={i} position={[bx, 9.6, -4 - i * 8]}>
          <boxGeometry args={[12, 0.12, 0.12]} />
          <meshBasicMaterial color={glow(accent, 1.6)} toneMapped={false} />
        </mesh>
      ))}
      {/* exit door glow behind you */}
      <mesh position={[bx, 3.2, 2.5]}>
        <planeGeometry args={[5.4, 6.4]} />
        <meshBasicMaterial color={glow(accent, 0.7)} transparent opacity={0.3} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Interiors({ reduced }: { reduced: boolean }) {
  const fontsReady = useFontsReady();
  // Willis era floors — gantry signs across the elevator gallery
  const eraSigns = useMemo(() => ERA_FLOORS.map((f, i) => ({
    t: f.t,
    tex: textTexture([
      { text: `FLOOR ${f.floor}`, size: 60, color: GX.white, family: zenFamily(), font: '400' },
      { text: `ERA 0${i + 1} · ${experiences[i].period.toUpperCase()}`, size: 34, color: NEONS[i % NEONS.length] },
    ], 980, 220, NEONS[i % NEONS.length]),
  })), [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // signature props per landmark, in LANDMARKS order
  const timelineIdx = LANDMARKS.findIndex(l => l.id === 'timeline');
  const arsenalIdx = LANDMARKS.findIndex(l => l.id === 'arsenal');
  const identityIdx = LANDMARKS.findIndex(l => l.id === 'identity');
  const credsIdx = LANDMARKS.findIndex(l => l.id === 'creds');
  const obsIdx = LANDMARKS.findIndex(l => l.id === 'observatory');
  const docksIdx = LANDMARKS.findIndex(l => l.id === 'docks');
  const transIdx = LANDMARKS.findIndex(l => l.id === 'transmissions');

  const signTexes = useMemo(() => skillCategories.map((c, i) =>
    textTexture([{ text: c.label.toUpperCase(), size: 60, color: NEONS[i % NEONS.length] }], 720, 130, NEONS[i % NEONS.length])), []);
  const credTexes = useMemo(() => [
    ...certifications.map((c) => textTexture([
      { text: `[${c.badge}] VERIFIED ✓`, size: 42, color: GX.blueBright },
      { text: c.title.toUpperCase(), size: 36, color: GX.white },
    ], 860, 320, GX.blue)),
    textTexture([
      { text: '[B.TECH] VERIFIED ✓', size: 42, color: GX.violetBright },
      { text: `${education.field.toUpperCase()} · ${education.year}`, size: 34, color: GX.white },
    ], 860, 320, GX.violet),
  ], []);
  const dockTexes = useMemo(() => ['KAFKA', 'RABBITMQ', 'KINESIS', 'PUB/SUB', 'EVENT HUB', 'SQS'].map((l, i) =>
    textTexture([{ text: l, size: 56, color: i % 2 === 0 ? GX.blueBright : GX.violetBright }], 600, 170, i % 2 === 0 ? GX.blue : GX.violet)), []);
  const blogTexes = useMemo(() => blogPosts.map((b, i) => textTexture([
    { text: `TRANSMISSION 0${i + 1}`, size: 32, color: NEONS[i % NEONS.length] },
    { text: b.tags[0].toUpperCase(), size: 46, color: GX.white },
  ], 760, 300, NEONS[i % NEONS.length])), []);
  const idTex = useMemo(() => textTexture([
    { text: '◢ VP', size: 84, color: GX.violetBright },
    { text: personal.name.toUpperCase(), size: 64, color: GX.white, family: zenFamily(), font: '400' },
    { text: 'SR. REACT.JS / NODE.JS · 11 YEARS', size: 34, color: GX.blueBright },
  ], 980, 560, GX.blue), [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const orbits = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state, dt) => {
    if (reduced) return;
    orbits.current.forEach((m, i) => {
      if (m) { m.rotation.x += dt * (0.3 + i * 0.15); m.rotation.y += dt * 0.2; }
    });
    void state;
  });

  return (
    <group>
      {LANDMARKS.map((lm, idx) => (
        <InteriorShell key={lm.id} idx={idx} len={lm.interiorLen} accent={
          lm.id === 'arsenal' ? GX.redBright : lm.id === 'timeline' ? GX.violetBright : GX.blueBright
        } />
      ))}

      {/* SPIRE OF ERAS — elevator gallery with floor gantries */}
      {eraSigns.map((s, i) => (
        <group key={i} position={[INT_BASE(timelineIdx), 0, -s.t]}>
          <mesh position={[0, 6.8, 0]}>
            <planeGeometry args={[10.4, 2.3]} />
            <meshBasicMaterial map={s.tex} transparent side={THREE.DoubleSide} />
          </mesh>
          {[-5.6, 5.6].map(off => (
            <mesh key={off} position={[off, 3.4, 0]}>
              <boxGeometry args={[0.3, 6.8, 0.3]} />
              <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.7)} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 0.5]} />
            <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.5)} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* CROSSBRACE — skill signs flanking the hall */}
      {signTexes.map((tex, i) => (
        <mesh
          key={i}
          position={[INT_BASE(arsenalIdx) + (i % 2 === 0 ? -5.9 : 5.9), 3 + (i % 3), -6 - Math.floor(i / 2) * 6]}
          rotation={[0, (i % 2 === 0 ? 1 : -1) * Math.PI / 2, 0]}
        >
          <planeGeometry args={[5.6, 1.05]} />
          <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* HELIX — the holo ID at the end */}
      <mesh position={[INT_BASE(identityIdx), 4.6, -LANDMARKS[identityIdx].interiorLen + 6]}>
        <planeGeometry args={[10, 5.8]} />
        <meshBasicMaterial map={idTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* NEEDLE — floating credential plaques */}
      {credTexes.map((tex, i) => (
        <mesh key={i} position={[INT_BASE(credsIdx) + (i - 1) * 4, 4 + (i % 2) * 1.4, -10 - i * 7]} rotation={[0, (i - 1) * -0.3, 0]}>
          <planeGeometry args={[7.6, 2.9]} />
          <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* WATCHTOWER — orrery + uplink */}
      <group position={[INT_BASE(obsIdx), 5, -LANDMARKS[obsIdx].interiorLen + 8]}>
        {[2.2, 3.1, 4].map((r, i) => (
          <mesh key={r} ref={(m) => { orbits.current[i] = m; }}>
            <torusGeometry args={[r, 0.06, 8, 48]} />
            <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.7)} toneMapped={false} transparent opacity={0.85} />
          </mesh>
        ))}
        <mesh>
          <icosahedronGeometry args={[0.9, 1]} />
          <meshBasicMaterial color={glow(GX.white, 1.6)} wireframe toneMapped={false} />
        </mesh>
      </group>

      {/* MART — stream crates */}
      {dockTexes.map((tex, i) => (
        <group key={i} position={[INT_BASE(docksIdx) + (i % 2 === 0 ? -3.4 : 3.4), 1.6 + Math.floor(i / 2) * 0.2, -8 - Math.floor(i / 2) * 9]}>
          <mesh>
            <boxGeometry args={[5.4, 2.2, 3.4]} />
            <meshStandardMaterial color={'#070A14'} roughness={0.45} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 1.71]}>
            <planeGeometry args={[4.6, 1.7]} />
            <meshBasicMaterial map={tex} transparent />
          </mesh>
        </group>
      ))}

      {/* COILS — broadcast boards */}
      {blogTexes.map((tex, i) => (
        <mesh key={i} position={[INT_BASE(transIdx) + (i - 1) * 3.6, 4.2, -10 - i * 8]} rotation={[0, (i - 1) * -0.25, 0]}>
          <planeGeometry args={[6.8, 2.7]} />
          <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ── celebration glyph burst ─────────────────────────────────────────────────
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
      <pointsMaterial size={0.7} sizeAttenuation transparent depthWrite={false} color={glow(color, 2)} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ── sky traffic + searchlights ──────────────────────────────────────────────
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
      const p = ((t * c.speed + c.off) % 420) - 210;
      if (c.lane === 0) m.position.set(p - 20, c.y, -30);
      else if (c.lane === 1) m.position.set(-p - 20, c.y, -130);
      else m.position.set(p - 20, c.y, -190);
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

export function Searchlights({ reduced }: { reduced: boolean }) {
  const beams = useRef<(THREE.Group | null)[]>([]);
  const spots = useMemo(() => [
    { x: -70, z: -30, color: GX.violet, speed: 0.16, tilt: 0.5 },
    { x: 30, z: -80, color: GX.blue, speed: -0.11, tilt: 0.42 },
    { x: -40, z: -180, color: GX.red, speed: 0.13, tilt: 0.55 },
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
              <meshBasicMaterial color={glow(s.color, 0.6)} transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

// ── the phoenix ─────────────────────────────────────────────────────────────
function makeWing(dir: 1 | -1, tip: THREE.Color, royal: THREE.Color): THREE.BufferGeometry {
  const pts: [number, number, number][] = [
    [0, 0, -0.18],
    [0, 0, 0.34],
    [dir * 0.95, 0.04, -0.38],
    [dir * 0.9, 0.02, 0.42],
    [dir * 1.85, 0.1, 0.18],
  ];
  const tris = [0, 2, 1, 1, 2, 3, 2, 4, 3];
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  for (const i of tris) {
    const p = pts[i];
    pos.push(p[0], p[1], p[2]);
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
  const history = useRef<THREE.Vector3[]>(Array.from({ length: 30 }, () => new THREE.Vector3(-20, 3, 44)));
  const tick = useRef(0);
  const bank = useRef(0);

  const redC = useMemo(() => glow(GX.redBright, 1.35), []);
  const royalC = useMemo(() => glow(GX.violetBright, 1.25), []);
  const blueC = useMemo(() => glow(GX.blueBright, 1.35), []);
  const wingGeoL = useMemo(() => makeWing(-1, redC, royalC), [redC, royalC]);
  const wingGeoR = useMemo(() => makeWing(1, blueC, royalC), [blueC, royalC]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.visible = !scrollBus.interior;
    if (scrollBus.interior) return;
    const t = state.clock.elapsedTime;
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
      const lateral = THREE.MathUtils.clamp((g.position.x - beforeX) * 5, -0.55, 0.55);
      bank.current += (lateral - bank.current) * 0.08;
    }
    g.rotateZ(bank.current);
    g.rotateX(0.14);

    const phase = t * (idle ? 3 : 6.5);
    const flap = reduced ? 0 : Math.sin(phase) * 0.34 + Math.sin(phase * 2) * 0.08;
    if (wingL.current) wingL.current.rotation.z = -(0.24 + flap);
    if (wingR.current) wingR.current.rotation.z = 0.24 + flap;
    const flut = reduced ? 0 : Math.sin(t * 3.2) * 0.12;
    if (tailL.current) tailL.current.rotation.y = 0.22 + flut;
    if (tailR.current) tailR.current.rotation.y = -0.22 - flut;

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
      (m.material as THREE.MeshBasicMaterial).opacity = reduced || scrollBus.interior ? 0 : 0.45 * k;
    });

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
        <mesh scale={[0.16, 0.14, 0.62]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={royalC} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.045, -0.5]} rotation={[-1.25, 0, 0]} scale={[0.085, 0.2, 0.08]}>
          <cylinderGeometry args={[0.7, 1, 1, 10]} />
          <meshBasicMaterial color={royalC} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.11, -0.66]} scale={[0.085, 0.08, 0.105]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={glow(GX.white, 1.7)} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.09, -0.79]} rotation={[-Math.PI / 2 - 0.18, 0, 0]} scale={[0.04, 0.13, 0.04]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshBasicMaterial color={glow('#FFD9A0', 1.9)} toneMapped={false} />
        </mesh>
        {[-0.045, 0.045].map(ex => (
          <mesh key={ex} position={[ex, 0.13, -0.71]} scale={0.018}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color={glow(GX.redBright, 2.4)} toneMapped={false} />
          </mesh>
        ))}
        <mesh ref={wingL} geometry={wingGeoL} position={[-0.12, 0.04, -0.05]}>
          <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={wingR} geometry={wingGeoR} position={[0.12, 0.04, -0.05]}>
          <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={tailL} position={[-0.05, 0, 0.62]} rotation={[0, 0.22, 0]} scale={[0.05, 0.012, 0.55]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={redC} toneMapped={false} />
        </mesh>
        <mesh ref={tailR} position={[0.05, 0, 0.62]} rotation={[0, -0.22, 0]} scale={[0.05, 0.012, 0.55]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={blueC} toneMapped={false} />
        </mesh>
      </group>
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <mesh key={i} ref={(m) => { trail.current[i] = m; }}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color={i < 2 ? redC : i < 5 ? royalC : blueC} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}