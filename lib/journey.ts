// lib/journey.ts
// Ordered stations along the flight path. Each has a unique 3D structure and a
// fixed z. The camera eases toward a station's z while its content is docked,
// and accelerates through the empty gaps between stations.

export type StructureKind =
  | 'origin' | 'planet' | 'station' | 'ringworld'
  | 'satellites' | 'academy' | 'beacon' | 'portal';

export interface JourneyStation {
  id: string;
  label: string;     // short label for the nav dots
  z: number;
  side: 1 | -1;      // structure offset side
  kind: StructureKind;
}

const SPACING = 30;

const DEF: Array<Omit<JourneyStation, 'z' | 'side'>> = [
  { id: 'hero',       label: 'Start',      kind: 'origin' },
  { id: 'about',      label: 'About',      kind: 'planet' },
  { id: 'skills',     label: 'Skills',     kind: 'station' },
  { id: 'experience', label: 'Experience', kind: 'ringworld' },
  { id: 'projects',   label: 'Projects',   kind: 'satellites' },
  { id: 'education',  label: 'Education',   kind: 'academy' },
  { id: 'blog',       label: 'Blog',       kind: 'beacon' },
  { id: 'contact',    label: 'Contact',    kind: 'portal' },
];

export const STATIONS: JourneyStation[] = DEF.map((d, i) => ({
  ...d,
  z: -i * SPACING,
  side: (i % 2 === 0 ? 1 : -1) as 1 | -1,
}));

export const STATION_Z: Record<string, number> =
  Object.fromEntries(STATIONS.map(s => [s.id, s.z]));

export const JOURNEY_DEPTH = (STATIONS.length - 1) * SPACING;
