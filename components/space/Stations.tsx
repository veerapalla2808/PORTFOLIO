// components/space/Stations.tsx
'use client';
import { type Color } from 'three';
import { STATIONS } from '@/lib/journey';
import Structure from './Structures';

export default function Stations({ color, color2 }: { color: Color; color2: Color }) {
  return (
    <>
      {STATIONS.map((s) => (
        <group key={s.id} position={[s.side * 8.5, s.side * 1.2, s.z - 4]}>
          <Structure kind={s.kind} color={color} color2={color2} />
        </group>
      ))}
    </>
  );
}
