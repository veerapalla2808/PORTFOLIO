'use client';
// Digital rain in comic red & blue — one draw call per depth shell, all
// animation in-shader. Each column carries a hue bit (blue or red) and rides
// with the camera so the rain is the environment, not a backdrop.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GX } from '@/lib/grid';
import type { Tier } from '@/lib/tier';

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789Z+*=<>:・"日';
const AC = 8;

function makeAtlas(): THREE.CanvasTexture {
  const size = 1024;
  const cell = size / AC;
  const cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.font = `${cell * 0.74}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < AC * AC; i++) {
    const ch = GLYPHS[i % GLYPHS.length];
    const x = (i % AC) * cell + cell / 2;
    const y = Math.floor(i / AC) * cell + cell / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function rnd(n: number) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

const VERT = /* glsl */ `
attribute vec3 aOffset;
attribute float aSpeed;
attribute float aSeed;
attribute float aShade;
attribute float aHue;
varying vec2 vUv;
varying float vSpeed;
varying float vSeed;
varying float vShade;
varying float vHue;
void main() {
  vUv = uv;
  vSpeed = aSpeed;
  vSeed = aSeed;
  vShade = aShade;
  vHue = aHue;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + aOffset, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uAtlas;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uBlueDeep; uniform vec3 uBlue; uniform vec3 uBlueBright;
uniform vec3 uRedDeep;  uniform vec3 uRed;  uniform vec3 uRedBright;
uniform vec3 uHead;
varying vec2 vUv;
varying float vSpeed;
varying float vSeed;
varying float vShade;
varying float vHue;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  float ROWS = 52.0;
  float row = floor(vUv.y * ROWS);
  vec2 cellUv = vec2(vUv.x, fract(vUv.y * ROWS));

  float cyc = floor(uTime * (0.8 + hash(vec2(vSeed, row)) * 2.2));
  float gi = floor(hash(vec2(row * 1.7 + vSeed * 13.1, cyc)) * 63.99);
  vec2 tile = vec2(mod(gi, 8.0), floor(gi / 8.0));
  float glyph = texture2D(uAtlas, (tile + cellUv) / 8.0).r;

  float t1 = fract(vUv.y + uTime * vSpeed + vSeed);
  float t2 = fract(vUv.y + uTime * vSpeed * 0.57 + vSeed * 7.31);
  float b = max(pow(t1, 7.0), pow(t2, 10.0) * 0.75);
  if (hash(vec2(vSeed, row * 3.3)) < 0.05) b *= 0.12;

  vec3 deep = mix(uBlueDeep, uRedDeep, vHue);
  vec3 core = mix(uBlue, uRed, vHue);
  vec3 brt  = mix(uBlueBright, uRedBright, vHue);

  vec3 col;
  if (b < 0.25)      col = mix(uBg, deep, b / 0.25);
  else if (b < 0.7)  col = mix(deep, core, (b - 0.25) / 0.45);
  else               col = mix(core, brt, (b - 0.7) / 0.3);

  if (t1 > 0.968) col = uHead * 2.1;
  col += (hash(gl_FragCoord.xy * 0.7) - 0.5) * 0.05;

  float alpha = glyph * (0.10 + b * 0.9) * vShade;
  gl_FragColor = vec4(col * (0.55 + b * 1.7), alpha);
}`;

interface Shell { z: number; shade: number; cols: number }

const SHELLS: Record<Tier, Shell[]> = {
  L: [
    { z: 7, shade: 0.28, cols: 14 },   // sparse foreground for parallax depth
    { z: -16, shade: 1.0, cols: 60 },
    { z: -34, shade: 0.55, cols: 52 },
    { z: -58, shade: 0.3, cols: 44 },
  ],
  M: [
    { z: -16, shade: 1.0, cols: 54 },
    { z: -38, shade: 0.5, cols: 42 },
  ],
  S: [{ z: -20, shade: 0.9, cols: 38 }],
};

const COL_H = 60;

export default function Rain({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const shells = SHELLS[tier];
    const N = shells.reduce((a, s) => a + s.cols, 0);
    const base = new THREE.PlaneGeometry(1.35, COL_H, 1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);

    const offs = new Float32Array(N * 3);
    const spd = new Float32Array(N);
    const seed = new Float32Array(N);
    const shade = new Float32Array(N);
    const hue = new Float32Array(N);
    let i = 0;
    shells.forEach((sh, si) => {
      for (let c = 0; c < sh.cols; c++, i++) {
        const k = si * 1000 + c;
        offs[i * 3] = -70 + (140 * c) / sh.cols + (rnd(k + 1) - 0.5) * 2;
        offs[i * 3 + 1] = 5 + (rnd(k + 2) - 0.5) * 9;
        offs[i * 3 + 2] = sh.z + (rnd(k + 3) - 0.5) * 7;
        spd[i] = 0.045 + rnd(k + 4) * 0.09;
        seed[i] = rnd(k + 5) * 113.0;
        shade[i] = sh.shade * (0.7 + rnd(k + 6) * 0.3);
        hue[i] = rnd(k + 7) < 0.6 ? 0 : 1; // 60% blue, 40% red
      }
    });
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offs, 3));
    geo.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(spd, 1));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
    geo.setAttribute('aShade', new THREE.InstancedBufferAttribute(shade, 1));
    geo.setAttribute('aHue', new THREE.InstancedBufferAttribute(hue, 1));
    geo.instanceCount = N;

    const u = {
      uAtlas: { value: makeAtlas() },
      uTime: { value: 23.7 },
      uBg: { value: new THREE.Color(GX.bg) },
      uBlueDeep: { value: new THREE.Color(GX.blueDeep) },
      uBlue: { value: new THREE.Color(GX.blue) },
      uBlueBright: { value: new THREE.Color(GX.blueBright) },
      uRedDeep: { value: new THREE.Color(GX.redDeep) },
      uRed: { value: new THREE.Color(GX.red) },
      uRedBright: { value: new THREE.Color(GX.redBright) },
      uHead: { value: new THREE.Color(GX.white) },
    };
    return { geometry: geo, uniforms: u };
  }, [tier]);

  useFrame((state) => {
    if (group.current) {
      group.current.position.x = state.camera.position.x;
    }
    if (mat.current && !reduced) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
