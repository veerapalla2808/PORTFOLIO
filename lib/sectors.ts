// lib/sectors.ts
export interface SectorMeta { id: string; number: string; codename: string; guide: string; }

export const SECTORS: SectorMeta[] = [
  { id: 'hero',       number: '00', codename: 'ORIGIN SIGNAL',   guide: 'NAV-0' },
  { id: 'about',      number: '01', codename: 'CORE MEMORY',     guide: 'MEM-1' },
  { id: 'skills',     number: '02', codename: 'THE ARSENAL',     guide: 'ARC-2' },
  { id: 'experience', number: '03', codename: 'VOYAGE LOG',      guide: 'LOG-3' },
  { id: 'projects',   number: '04', codename: 'MISSION ARCHIVE', guide: 'OPS-4' },
  { id: 'education',  number: '05', codename: 'THE ACADEMY',     guide: 'EDU-5' },
  { id: 'blog',       number: '06', codename: 'TRANSMISSIONS',   guide: 'TX-6'  },
  { id: 'contact',    number: '07', codename: 'OPEN CHANNEL',    guide: 'HAIL-7'},
];

export const SECTOR_BY_ID: Record<string, SectorMeta> =
  Object.fromEntries(SECTORS.map(s => [s.id, s]));
