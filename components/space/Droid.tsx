// components/space/Droid.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, Vector3, type Color, type Mesh, MeshStandardMaterial } from 'three';

const offset = new Vector3(4.0, -1.5, -8);
const tmp = new Vector3();

export default function Droid({
  color, color2, line, frozen,
}: { color: Color; color2: Color; line: string; frozen: boolean }) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const eye = useRef<Mesh>(null);
  const t = useRef(0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    // Stick to the camera (flying companion), facing travel direction.
    tmp.copy(offset).applyQuaternion(state.camera.quaternion).add(state.camera.position);
    g.position.lerp(tmp, frozen ? 1 : 0.12);
    g.quaternion.copy(state.camera.quaternion);

    if (frozen) return;
    t.current += dt;
    if (body.current) {
      body.current.position.y = Math.sin(t.current * 1.6) * 0.18;        // bob
      body.current.rotation.y = Math.sin(t.current * 0.7) * 0.35;        // look around
      body.current.rotation.z = Math.sin(t.current * 1.2) * 0.06;        // tilt
    }
    if (eye.current) {
      const m = eye.current.material as MeshStandardMaterial;
      m.emissiveIntensity = 1.6 + Math.sin(t.current * 4) * 0.6;          // eye pulse
    }
  });

  return (
    <group ref={root}>
      <group ref={body} scale={0.7}>
        {/* Body shell */}
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} emissive={color} emissiveIntensity={0.18} />
        </mesh>
        {/* Face plate */}
        <mesh position={[0, 0.05, 0.78]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color={'#0a0a18'} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Glowing eye */}
        <mesh ref={eye} position={[0, 0.08, 1.05]}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* Side thrusters */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.05, -0.1, -0.1]} rotation={[0, 0, s * 0.4]}>
            <capsuleGeometry args={[0.16, 0.4, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} emissive={color2} emissiveIntensity={0.4} />
          </mesh>
        ))}
        {/* Hover ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
          <torusGeometry args={[0.7, 0.04, 10, 48]} />
          <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={1} toneMapped={false} />
        </mesh>

        {/* Narration speech bubble */}
        <Html position={[0, 1.9, 0]} center distanceFactor={9} pointerEvents="none" wrapperClass="droid-html">
          <div className="droid-bubble">{line}</div>
        </Html>
      </group>
    </group>
  );
}
