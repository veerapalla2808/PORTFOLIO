// lib/journeyCurve.ts
// A smooth curved flight path through deep space. The camera follows this spline
// as scroll progresses (0..1), so the journey weaves left/right/up/down past
// stations placed along it — an open-galaxy feel rather than a straight tunnel.
import { CatmullRomCurve3, Vector3 } from 'three';
import { STATIONS } from './journey';

const SPACING = 46;          // deep spacing between stations
const WEAVE_X = 20;          // horizontal travel amplitude
const WEAVE_Y = 10;          // gentle vertical travel amplitude

// One control point per station — weave in x and y, descend in z.
export const STATION_POINTS: Vector3[] = STATIONS.map((_, i) =>
  new Vector3(
    Math.sin(i * 1.05) * WEAVE_X,
    Math.cos(i * 0.8) * WEAVE_Y,
    -i * SPACING,
  ),
);

export const CURVE = new CatmullRomCurve3(STATION_POINTS, false, 'catmullrom', 0.5);
// Prime the arc-length lookup table so getPointAt() is accurate.
CURVE.getLength();

// Progress (0..1) of each station along the curve.
export const STATION_U: number[] = STATIONS.map((_, i) =>
  STATIONS.length > 1 ? i / (STATIONS.length - 1) : 0,
);

const _side = new Vector3();
const _up = new Vector3(0, 1, 0);
// Position a structure offset to the side of the path at a given station, so the
// camera flies past it rather than through it.
export function structurePosition(i: number, out: Vector3): Vector3 {
  const u = STATION_U[i];
  const p = CURVE.getPointAt(u);
  const t = CURVE.getTangentAt(u);
  _side.crossVectors(t, _up).normalize();          // perpendicular to travel
  const side = i % 2 === 0 ? 1 : -1;
  out.copy(p).addScaledVector(_side, side * 13).add(new Vector3(0, side * 2, 0));
  return out;
}
