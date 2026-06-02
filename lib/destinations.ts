// lib/destinations.ts
// Each section is a real celestial destination the ship travels to. Planets are
// positioned along the flight path (-z); the camera flies straight toward each.

export interface Destination {
  id: string;
  label: string;
  code: string;          // dashboard codename
  texture: string | null; // file in /public/textures (null = open space / start)
  radius: number;        // sphere radius
  ring?: boolean;        // Saturn-style ring
  clouds?: boolean;      // Earth cloud layer
  offset: [number, number]; // x,y offset of the planet from the flight axis
}

const SPACING = 60;

const DEF: Array<Omit<Destination, 'offset'> & { side: 1 | -1; high: boolean }> = [
  { id: 'hero',       label: 'Launch',     code: 'ORIGIN',   texture: null,                 radius: 0,    side: 1,  high: false },
  { id: 'about',      label: 'About',      code: 'TERRA',    texture: '2k_earth_daymap.jpg', radius: 16, clouds: true, side: 1,  high: false },
  { id: 'skills',     label: 'Skills',     code: 'ARES',     texture: '2k_mars.jpg',        radius: 12,   side: -1, high: true  },
  { id: 'experience', label: 'Experience', code: 'JOVE',     texture: '2k_jupiter.jpg',     radius: 26,   side: 1,  high: false },
  { id: 'projects',   label: 'Projects',   code: 'SATURNUS', texture: '2k_saturn.jpg',      radius: 20, ring: true, side: -1, high: true  },
  { id: 'education',  label: 'Education',  code: 'LUNA',     texture: '2k_moon.jpg',        radius: 9,    side: 1,  high: false },
  { id: 'blog',       label: 'Blog',       code: 'NEPTUNUS', texture: '2k_neptune.jpg',     radius: 15,   side: -1, high: true  },
  { id: 'contact',    label: 'Contact',    code: 'VENUS',    texture: '2k_venus_atmosphere.jpg', radius: 14, side: 1, high: false },
];

export const DESTINATIONS: Destination[] = DEF.map((d) => ({
  id: d.id, label: d.label, code: d.code, texture: d.texture, radius: d.radius,
  ring: d.ring, clouds: d.clouds,
  // Frame the planet to one side and a little above/below the flight axis.
  offset: [d.side * (d.radius * 1.2 + 10), (d.high ? 1 : -1) * (d.radius * 0.4 + 4)],
}));

export const DEST_Z: number[] = DESTINATIONS.map((_, i) => -i * SPACING);
export const TRAVEL_DEPTH = (DESTINATIONS.length - 1) * SPACING;
