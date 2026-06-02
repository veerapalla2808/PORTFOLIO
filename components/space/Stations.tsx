// components/space/Stations.tsx
'use client';
import { useMemo } from 'react';
import { Vector3, type Color } from 'three';
import { STATIONS } from '@/lib/journey';
import { structurePosition } from '@/lib/journeyCurve';
import Structure from './Structures';

export default function Stations({ color, color2 }: { color: Color; color2: Color }) {
  const placed = useMemo(
    () => STATIONS.map((s, i) => {
      const p = structurePosition(i, new Vector3());
      return { id: s.id, kind: s.kind, pos: [p.x, p.y, p.z] as [number, number, number] };
    }),
    [],
  );
  return (
    <>
      {placed.map((s) => (
        <group key={s.id} position={s.pos}>
          <Structure kind={s.kind} color={color} color2={color2} />
        </group>
      ))}
    </>
  );
}
