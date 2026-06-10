// lib/grid.ts — NEON GRID v4: an open-world city map.
// A ring road + central cross + hub. Every district sits ON a through-road —
// you never have to backtrack. A route graph powers the mini-map and the
// auto-drive "Continue" button.

// ── Palette — neon blue / violet / red on near-black (no green, no pink) ────
export const GX = {
  bg: '#030308',
  blue: '#2D7DFF', blueBright: '#66B0FF', blueDeep: '#0C2A66',
  violet: '#7B2FFF', violetBright: '#9D5CFF', violetDeep: '#240B5E',
  red: '#FF1F30', redBright: '#FF5C68', redDeep: '#660A12',
  white: '#F4F7FF',
  text: '#D8E3F8',
  dim: '#76879F',
} as const;

export const NEONS = [GX.blue, GX.violet, GX.red] as const;

// ── Street network — ring + cross + spurs (axis-aligned corridors) ──────────
export interface Street { a: [number, number]; b: [number, number]; name: string }

export const STREETS: Street[] = [
  { a: [0, 46], b: [0, 0], name: 'GATEWAY' },
  { a: [-80, 0], b: [80, 0], name: 'RING SOUTH' },
  { a: [-80, 0], b: [-80, -160], name: 'RING WEST' },
  { a: [80, 0], b: [80, -160], name: 'RING EAST' },
  { a: [-80, -160], b: [80, -160], name: 'TIME TUNNEL' },
  { a: [0, 0], b: [0, -160], name: 'HUB AVE' },
  { a: [-80, -80], b: [80, -80], name: 'HUB CROSS' },
  { a: [0, -160], b: [0, -202], name: 'CHOICE SPUR' },
];

export const LANE_HALF = 2.4;
export const SPAWN = { x: 0, z: 42 };

// ── Route graph (autopilot + mini-map) ──────────────────────────────────────
export interface MapNode { id: number; x: number; z: number }
export const NODES: MapNode[] = [
  { id: 0, x: 0, z: 42 },    // spawn
  { id: 1, x: 0, z: 0 },     // gates junction
  { id: 2, x: 80, z: 0 },    // SE corner — identity
  { id: 3, x: -80, z: 0 },   // SW corner — arsenal
  { id: 4, x: 0, z: -80 },   // HUB
  { id: 5, x: 80, z: -80 },  // E mid — credentials
  { id: 6, x: -80, z: -80 }, // W mid — transmissions
  { id: 7, x: 0, z: -160 },  // N mid — time tunnel center
  { id: 8, x: 80, z: -160 }, // NE corner
  { id: 9, x: -80, z: -160 },// NW corner — anomalies
  { id: 10, x: 0, z: -202 }, // choice
];
export const EDGES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 6],
  [4, 5], [4, 6], [4, 7], [5, 8], [6, 9], [7, 8], [7, 9], [7, 10],
];

const ADJ: number[][] = NODES.map(() => []);
for (const [a, b] of EDGES) { ADJ[a].push(b); ADJ[b].push(a); }

function nearestNode(x: number, z: number): number {
  let best = 0, bd = Infinity;
  for (const n of NODES) {
    const d = (n.x - x) ** 2 + (n.z - z) ** 2;
    if (d < bd) { bd = d; best = n.id; }
  }
  return best;
}

/** BFS waypoint route from (ax,az) to (bx,bz) along the street graph. */
export function routeBetween(ax: number, az: number, bx: number, bz: number): { x: number; z: number }[] {
  const start = nearestNode(ax, az);
  const goal = nearestNode(bx, bz);
  const prev = new Array<number>(NODES.length).fill(-1);
  const seen = new Set<number>([start]);
  const q = [start];
  while (q.length) {
    const cur = q.shift()!;
    if (cur === goal) break;
    for (const nb of ADJ[cur]) {
      if (!seen.has(nb)) { seen.add(nb); prev[nb] = cur; q.push(nb); }
    }
  }
  const path: { x: number; z: number }[] = [];
  let cur = goal;
  while (cur !== -1 && cur !== start) {
    path.unshift({ x: NODES[cur].x, z: NODES[cur].z });
    cur = prev[cur];
  }
  path.push({ x: bx, z: bz });
  return path;
}

// ── District anchors & set-piece spots ──────────────────────────────────────
export const GATE_ARCH = { x: 0, z: 8 };
export const HUB = { x: 0, z: -80 };
export const IDENTITY_SPOT = { x: 90, y: 4.4, z: 6 };       // off SE corner
export const ARSENAL_SPOT = { x: -94, y: 9, z: 0 };          // wall faces east
export const PORTAL_XS = [-50, -25, 0, 25, 50];              // along ring top
export const PORTAL_Z = -160;
export const ANOM_SPOTS = [
  { x: -90, z: -152 },
  { x: -70, z: -171 },
];
export const CREDS_SPOT = { x: 90, z: -80 };
export const TRANS_SPOT = { x: -91, z: -80 };
export const PILLS_SPOT = { x: 0, y: 2.6, z: -196 };

// ── Zones — themed districts (each with its own atmosphere) ─────────────────
export interface Zone {
  idx: number; id: string; code: string; line: string;
  x: number; z: number;
  fog: string;          // district fog/sky tint
  accent: string;       // district signature neon
}

export const ZONES: Zone[] = [
  { idx: 0, id: 'gate', code: '00 / CITY GATES', line: 'Welcome to the grid. Drive the ring, hit every district — the map is yours.', x: 0, z: 36, fog: '#030308', accent: GX.violet },
  { idx: 1, id: 'hub', code: 'HQ / CENTRAL HUB', line: 'The hub. Every district is one turn away, operator.', x: 0, z: -80, fog: '#070512', accent: GX.white },
  { idx: 2, id: 'identity', code: '01 / IDENTITY PLAZA', line: 'Identity verified the hard way: eleven years in production.', x: 80, z: 0, fog: '#04101F', accent: GX.blue },
  { idx: 3, id: 'arsenal', code: '02 / ARSENAL FORGE', line: "An arsenal isn't what you know. It's what you reach for at 3 AM.", x: -80, z: 0, fog: '#160407', accent: GX.red },
  { idx: 4, id: 'timeline', code: '03 / TIME TUNNEL', line: 'Five portals. Five eras. Drive the tunnel and punch through them.', x: 0, z: -160, fog: '#0D0418', accent: GX.violet },
  { idx: 5, id: 'anomalies', code: '04 / ANOMALY SECTOR', line: 'Two anomalies reached production. Click the billboards — watch them surrender.', x: -80, z: -160, fog: '#140409', accent: GX.redBright },
  { idx: 6, id: 'creds', code: '05 / CREDENTIALS COURT', line: 'Stamped, sealed, verified. The machines agree: he is certified.', x: 80, z: -80, fog: '#0A1430', accent: GX.blueBright },
  { idx: 7, id: 'transmissions', code: '06 / TRANSMISSION ROW', line: 'He also writes. The signal is strong on this one.', x: -80, z: -80, fog: '#0A0620', accent: GX.violetBright },
  { idx: 8, id: 'choice', code: '07 / THE CHOICE', line: 'The last rooftop, operator. Red or blue?', x: 0, z: -196, fog: '#0A0512', accent: GX.white },
];

export function zoneAt(x: number, z: number): Zone {
  let best = ZONES[0];
  let bd = Infinity;
  for (const zo of ZONES) {
    const d = (zo.x - x) * (zo.x - x) + (zo.z - z) * (zo.z - z);
    if (d < bd) { bd = d; best = zo; }
  }
  return best;
}

// ── District entry portals — every one a different shape ───────────────────
export type PortalKind = 'hex' | 'industrial' | 'glitch' | 'doublering' | 'arcs' | 'diamond';
export interface DistrictPortal { kind: PortalKind; x: number; z: number; rotY: number; color: string }

// rotY 0 → opening faces ±z travel; Math.PI/2 → faces ±x travel
export const DISTRICT_PORTALS: DistrictPortal[] = [
  { kind: 'hex', x: 66, z: 0, rotY: Math.PI / 2, color: GX.blue },          // identity (ring south, heading E)
  { kind: 'hex', x: 80, z: -14, rotY: 0, color: GX.blue },                  // identity (ring east, heading N)
  { kind: 'industrial', x: -66, z: 0, rotY: Math.PI / 2, color: GX.red },   // arsenal
  { kind: 'industrial', x: -80, z: -14, rotY: 0, color: GX.red },
  { kind: 'doublering', x: 80, z: -64, rotY: 0, color: GX.blueBright },     // credentials
  { kind: 'doublering', x: 64, z: -80, rotY: Math.PI / 2, color: GX.blueBright },
  { kind: 'arcs', x: -80, z: -64, rotY: 0, color: GX.violetBright },        // transmissions
  { kind: 'arcs', x: -64, z: -80, rotY: Math.PI / 2, color: GX.violetBright },
  { kind: 'glitch', x: -80, z: -144, rotY: 0, color: GX.redBright },        // anomalies
  { kind: 'glitch', x: -64, z: -160, rotY: Math.PI / 2, color: GX.redBright },
  { kind: 'diamond', x: 0, z: -174, rotY: 0, color: GX.white },             // choice
];

// ── Junction signposts (big, readable, both directions) ─────────────────────
export interface SignBoard { text: string; color: string }
export interface SignPost { x: number; z: number; boards: SignBoard[] }

export const SIGNPOSTS: SignPost[] = [
  { x: 5.4, z: 7, boards: [{ text: '▲ HUB & ALL DISTRICTS', color: GX.white }, { text: 'IDENTITY ▶', color: GX.blue }, { text: '◀ ARSENAL', color: GX.red }] },
  { x: 74, z: 6, boards: [{ text: 'IDENTITY PLAZA', color: GX.blue }, { text: '▲ CREDENTIALS', color: GX.blueBright }] },
  { x: -74, z: 6, boards: [{ text: 'ARSENAL FORGE', color: GX.red }, { text: '▲ TRANSMISSIONS', color: GX.violetBright }] },
  { x: 5.4, z: -73, boards: [{ text: 'CENTRAL HUB', color: GX.white }, { text: 'CREDENTIALS ▶', color: GX.blueBright }, { text: '◀ TRANSMISSIONS', color: GX.violetBright }, { text: '▲ TIME TUNNEL', color: GX.violet }] },
  { x: 74, z: -73, boards: [{ text: 'CREDENTIALS COURT', color: GX.blueBright }, { text: '▲ TIME TUNNEL', color: GX.violet }] },
  { x: -74, z: -73, boards: [{ text: 'TRANSMISSION ROW', color: GX.violetBright }, { text: '▲ ANOMALIES', color: GX.redBright }] },
  { x: 5.4, z: -153, boards: [{ text: '◀ TIME TUNNEL ▶', color: GX.violet }, { text: '▲ THE CHOICE', color: GX.white }] },
  { x: -74, z: -153, boards: [{ text: 'ANOMALY SECTOR', color: GX.redBright }, { text: 'TIME TUNNEL ▶', color: GX.violet }] },
];

// ── Optional checkpoints — rotating sarcastic question pool ─────────────────
export interface Question {
  q: string;
  options: string[];
  correct: number;
  sass: string[];
  win: string;
}

export const QUESTION_POOL: Question[] = [
  {
    q: "Production is down. It's Friday, 5:58 PM. A senior engineer's first move?",
    options: ['Panic, professionally', 'Blame the intern', 'Check what shipped at 5:55 PM', 'Update LinkedIn'],
    correct: 2,
    sass: [
      'Panic is a junior feature. It was deprecated in his v6.0.',
      "Bold. The intern doesn't even have deploy access.",
      '',
      "Premature. That's a Monday move.",
    ],
    win: "Correct — it's always the deploy.",
  },
  {
    q: 'What is the most dangerous tool in any engineering arsenal?',
    options: ['rm -rf with sudo', "A 'quick fix' pushed straight to main", 'Regex', 'An unattended Jira board'],
    correct: 1,
    sass: [
      'Close. But at least that one asks for a password first.',
      '',
      'Now you have two problems. Still not THE problem.',
      'Scary? Yes. Dangerous? It just sits there, multiplying.',
    ],
    win: 'Exactly. Speed kills — mostly prod.',
  },
  {
    q: "'It works on my machine.' What did the engineer actually discover?",
    options: ['The machine is lying', 'Ship the machine to prod, then', 'An environment diff is hiding somewhere', "QA's problem now"],
    correct: 2,
    sass: [
      "Machines don't lie. They obey too literally — that's worse.",
      'Congratulations, you invented Docker. Ten years late.',
      '',
      'QA has left the chat. And the company.',
    ],
    win: 'Right — the bug was inside the env all along.',
  },
  {
    q: "p95 latency tripled after a 'tiny' release. Prime suspect?",
    options: ['Cosmic rays', "The tiny PR that 'couldn't possibly affect anything'", 'DNS', 'Mercury retrograde'],
    correct: 1,
    sass: [
      'Statistically possible. Professionally unhelpful.',
      '',
      "Respect — it IS always DNS. Except today.",
      'The Operator admires your spirituality. Request denied.',
    ],
    win: 'Correct. No PR is tiny.',
  },
  {
    q: "How long is a developer's '5-minute fix'?",
    options: ['5 minutes', '5 hours', '5 meetings', 'Undefined behavior'],
    correct: 3,
    sass: [
      'Adorable. The Operator remembers being new too.',
      'Warmer. Add a timezone bug and a missing semicolon.',
      "Meetings don't fix things. They schedule the next one.",
      '',
    ],
    win: 'Correct. The spec said 5 minutes. The spec lied.',
  },
  {
    q: 'What is the collective noun for a group of senior engineers?',
    options: ['A standup', 'A blame', "A 'circle-back'", 'A deprecation'],
    correct: 3,
    sass: [
      'A standup is where they hide. Not what they are.',
      'Tempting. Juniors travel in blames. Seniors deprecate.',
      "That's middle management. Easy mistake.",
      '',
    ],
    win: 'A deprecation of seniors. Use it in a meeting today.',
  },
  {
    q: 'A white rabbit in a digital trench coat offers you two pills. You:',
    options: ["Ask if there's a third option", 'Check the expiry date', 'Take both and see what happens', 'Follow the rabbit'],
    correct: 3,
    sass: [
      'There is no third option. There is barely a spoon.',
      'They expired in 1999. Everything here did.',
      "That's how you get a segfault in your soul.",
      '',
    ],
    win: "Correct. That's literally why you're here.",
  },
  {
    q: 'Where is the safest place to hide a body?',
    options: ['Page 2 of the search results', 'A code comment', 'The unread Slack channel', 'Legacy code nobody dares to touch'],
    correct: 0,
    sass: [
      '',
      'Someone will read it in a code review. In 2031. Still risky.',
      'Risky — someone scrolls up once a year.',
      'Good instinct. But one day someone WILL refactor it. Chaos.',
    ],
    win: 'Correct. Nobody has ever clicked page 2.',
  },
  {
    q: 'Coffee is:',
    options: ['A beverage', 'A personality', 'A dependency', 'All of the above, peer-reviewed'],
    correct: 3,
    sass: [
      'Technically true. Spiritually false.',
      'For some, yes. The Operator does not judge. Much.',
      'npm install caffeine — close, but incomplete.',
      '',
    ],
    win: 'Correct. Version-pinned and non-negotiable.',
  },
  {
    q: "It's 2 AM. Your brain produces the perfect fix for today's bug. You:",
    options: ['Sleep. Fix it tomorrow like an adult', 'Get up and code it immediately', 'Trust yourself to remember it', 'Get up, code it, break two other things'],
    correct: 3,
    sass: [
      "An adult? In this economy? The Operator doesn't believe you.",
      'Honest, but incomplete. Read option D again.',
      'You will not remember. You have never remembered.',
      '',
    ],
    win: 'Correct. The 2 AM fix giveth, and the 2 AM fix taketh away.',
  },
  {
    q: 'Pick the strongest password:',
    options: ['password123!', "Your cat's name + birth year", 'correct-horse-battery-staple', "'I use the same one everywhere'"],
    correct: 2,
    sass: [
      'The exclamation mark is doing a lot of emotional labor there.',
      'Mr. Whiskers2019 has entered the breach database.',
      '',
      "That's not a password. That's a confession.",
    ],
    win: 'Correct. The horse remains undefeated since 2011.',
  },
  {
    q: 'The white rabbit is late. The most likely reason:',
    options: ['Time is a construct', 'Daylight savings', "A meeting that could've been an email", 'Rabbits cannot read clocks'],
    correct: 2,
    sass: [
      'Deep. Unhelpful, but deep.',
      'The rabbit lives in UTC. Nice try.',
      '',
      'This rabbit reads clocks, stack traces and your browsing history.',
    ],
    win: 'Correct. It sent regrets — and a calendar invite for never.',
  },
];

// checkpoints on busy through-roads
export const CHECKPOINTS = [
  { x: 0, z: -26 },
  { x: 0, z: -120 },
  { x: -40, z: -80 },
  { x: 40, z: -80 },
  { x: 80, z: -40 },
  { x: -80, z: -120 },
];

export const SKIP_LABEL = '[ skip — the rabbit saw that ]';
export const SKIP_QUIP = 'Skipped. The rabbit is updating your file.';

export const RANKS = [
  'BLUE-PILL TOURIST',
  'SCRIPT KIDDO',
  'CONSOLE LOGGER',
  'OPERATOR',
  'ARCHITECT',
  'ORACLE',
  'THE ONE',
] as const;
