// lib/journey.ts
// Ordered stations along the flight path. The camera flies from z=0 toward -DEPTH
// as scroll progresses 0..1; each station sits at its z with an alternating side.

export interface JourneyStation { id: string; z: number; side: 1 | -1; }

const ORDER = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'blog', 'contact'];
const SPACING = 26;

export const STATIONS: JourneyStation[] = ORDER.map((id, i) => ({
  id,
  z: -i * SPACING,
  side: (i % 2 === 0 ? 1 : -1) as 1 | -1,
}));

export const JOURNEY_DEPTH = (ORDER.length - 1) * SPACING;
