// lib/grid.ts — NEON GRID v6: neon Chicago.
// Curved polyline streets (Lake Shore Drive sweeps the lakefront), landmark
// buildings ARE the sections — drive into a lobby and you're inside. Lake
// Michigan to the east, Navy Pier runs into it, the Ferris wheel waits at
// the end. No structures standing in the road.

// ── Palette — darker jewel neons: deep blue / royal indigo / crimson ────────
export const GX = {
  bg: '#030308',
  blue: '#1E5FE0', blueBright: '#4D8DFF', blueDeep: '#081E5C',
  violet: '#4B3DF2', violetBright: '#7A6CFF', violetDeep: '#150E66',
  red: '#C8102E', redBright: '#FF3B52', redDeep: '#4A0814',
  white: '#F4F7FF',
  text: '#D8E3F8',
  dim: '#76879F',
} as const;

export const NEONS = [GX.blue, GX.violet, GX.red] as const;

// ── Street network — POLYLINES (curves welcome). Junctions only at street
// endpoints, so every street runs node-to-node. ─────────────────────────────
export interface Street { pts: [number, number][]; name: string; color: string }

export const STREETS: Street[] = [
  // State St (N→S spine)
  { pts: [[-20, 46], [-20, -40]], name: 'STATE ST', color: GX.violet },
  { pts: [[-20, -40], [-20, -110]], name: 'STATE ST', color: GX.violet },
  { pts: [[-20, -110], [-20, -150]], name: 'STATE ST', color: GX.violet },
  { pts: [[-20, -150], [-20, -200]], name: 'STATE ST', color: GX.violet },
  // Franklin St (west spine)
  { pts: [[-70, 20], [-70, -40]], name: 'FRANKLIN ST', color: GX.red },
  { pts: [[-70, -40], [-70, -80]], name: 'FRANKLIN ST', color: GX.red },
  { pts: [[-70, -80], [-70, -150]], name: 'FRANKLIN ST', color: GX.red },
  { pts: [[-70, -150], [-70, -176]], name: 'FRANKLIN ST', color: GX.red },
  { pts: [[-70, -176], [-70, -200]], name: 'FRANKLIN ST', color: GX.red },
  // Madison St (E–W)
  { pts: [[-100, -40], [-70, -40]], name: 'MADISON ST', color: GX.blue },
  { pts: [[-70, -40], [-20, -40]], name: 'MADISON ST', color: GX.blue },
  { pts: [[-20, -40], [20, -40]], name: 'MADISON ST', color: GX.blue },
  { pts: [[20, -40], [44, -40], [64, -40]], name: 'MADISON ST', color: GX.blue },
  // Monroe St (E–W)
  { pts: [[-100, -150], [-70, -150]], name: 'MONROE ST', color: GX.blue },
  { pts: [[-70, -150], [-20, -150]], name: 'MONROE ST', color: GX.blue },
  { pts: [[-20, -150], [20, -150]], name: 'MONROE ST', color: GX.blue },
  { pts: [[20, -150], [38, -146], [54, -132]], name: 'MONROE CURVE', color: GX.blue },
  // Wacker (curved top connector)
  { pts: [[-20, 46], [0, 38], [22, 34], [40, 30]], name: 'WACKER DR', color: GX.violet },
  // Lake Shore Drive — the curve along the water
  { pts: [[40, 30], [50, 16], [57, -2], [60, -18]], name: 'LAKE SHORE DR', color: GX.violetBright },
  { pts: [[60, -18], [64, -40]], name: 'LAKE SHORE DR', color: GX.violetBright },
  { pts: [[64, -40], [66, -62], [62, -80]], name: 'LAKE SHORE DR', color: GX.violetBright },
  { pts: [[62, -80], [58, -96], [56, -110]], name: 'LAKE SHORE DR', color: GX.violetBright },
  { pts: [[56, -110], [54, -132]], name: 'LAKE SHORE DR', color: GX.violetBright },
  { pts: [[54, -132], [56, -156], [60, -176], [66, -200]], name: 'LAKE SHORE DR', color: GX.violetBright },
  // Navy Pier — straight out over the water
  { pts: [[56, -110], [160, -110]], name: 'NAVY PIER', color: GX.red },
  // landmark driveways
  { pts: [[-70, -80], [-92, -80]], name: 'WILLIS PLAZA', color: GX.violet },     // timeline
  { pts: [[60, -18], [88, -18]], name: 'HANCOCK CT', color: GX.red },            // arsenal
  { pts: [[62, -80], [92, -80]], name: 'LAKE POINT DR', color: GX.blue },        // identity
  { pts: [[20, -40], [20, -16]], name: 'TOWER DR', color: GX.blueBright },       // credentials
  { pts: [[-20, -110], [8, -110]], name: 'ANOMALY ALLEY', color: GX.redBright }, // anomalies (open air)
  { pts: [[20, -150], [20, -126]], name: 'OBSERVATORY WAY', color: GX.violetBright }, // observatory
  { pts: [[-100, -40], [-122, -40]], name: 'MART DOCKS', color: GX.blueBright }, // docks
  { pts: [[-70, -176], [-96, -176]], name: 'MARINA LANE', color: GX.violetBright }, // transmissions
];

export const LANE_HALF = 2.4;
export const SPAWN = { x: -20, z: 44 };
export const GATE_ARCH = { x: -20, z: 32 };
export const HUB = { x: -20, z: -150 };
export const BEAN = { x: -34, z: -160 };
export const LAKE_X = 72; // water starts east of this (pier excepted)

// ── Landmarks — sections you ENTER ──────────────────────────────────────────
export interface Landmark {
  id: string;           // zone id
  name: string;         // display name (no real-world names)
  entrance: [number, number];  // lobby door (driveway far end)
  outDir: [number, number];    // direction facing OUT of the door
  interiorLen: number;  // walkable interior depth (0 = open-air, no interior)
}

export const LANDMARKS: Landmark[] = [
  { id: 'timeline', name: 'THE SPIRE OF ERAS', entrance: [-92, -80], outDir: [1, 0], interiorLen: 88 },
  { id: 'arsenal', name: 'CROSSBRACE TOWER', entrance: [88, -18], outDir: [-1, 0], interiorLen: 40 },
  { id: 'identity', name: 'LAKESIDE HELIX', entrance: [92, -80], outDir: [-1, 0], interiorLen: 36 },
  { id: 'creds', name: 'THE NEEDLE', entrance: [20, -16], outDir: [0, -1], interiorLen: 36 },
  { id: 'observatory', name: 'THE WATCHTOWER', entrance: [20, -126], outDir: [0, 1], interiorLen: 40 },
  { id: 'docks', name: 'GRAND MART', entrance: [-122, -40], outDir: [1, 0], interiorLen: 44 },
  { id: 'transmissions', name: 'TWIN COILS', entrance: [-96, -176], outDir: [1, 0], interiorLen: 36 },
];

export function landmarkById(id: string): Landmark | undefined {
  return LANDMARKS.find(l => l.id === id);
}

// Willis-style era floors (position along the interior, floor label)
export const ERA_FLOORS = [
  { t: 12, floor: '034' },
  { t: 29, floor: '058' },
  { t: 46, floor: '077' },
  { t: 63, floor: '095' },
  { t: 80, floor: '108' },
];

// ── Zones ───────────────────────────────────────────────────────────────────
export interface Zone {
  idx: number; id: string; code: string; line: string;
  x: number; z: number;
  fog: string;
  accent: string;
}

export const ZONES: Zone[] = [
  { idx: 0, id: 'gate', code: '00 / CITY GATES', line: 'Neon Chicago, operator. Drive the Drive — the lake is real, the code is realer.', x: -20, z: 40, fog: '#030308', accent: GX.violet },
  { idx: 1, id: 'hub', code: 'HQ / BEAN PLAZA', line: 'The plaza. Check your reflection — then pick a tower.', x: -20, z: -150, fog: '#070512', accent: GX.white },
  { idx: 2, id: 'identity', code: '01 / LAKESIDE HELIX', line: 'Identity lives lakeside: eleven years in production.', x: 92, z: -80, fog: '#04101F', accent: GX.blue },
  { idx: 3, id: 'arsenal', code: '02 / CROSSBRACE TOWER', line: "The arsenal tower. X-braced, like everything he ships.", x: 88, z: -18, fog: '#160407', accent: GX.red },
  { idx: 4, id: 'timeline', code: '03 / SPIRE OF ERAS', line: 'The tallest tower holds five floors of history. Take the elevator.', x: -92, z: -80, fog: '#0D0418', accent: GX.violet },
  { idx: 5, id: 'anomalies', code: '04 / ANOMALY ALLEY', line: 'Two anomalies reached production. Click the billboards — watch them surrender.', x: 8, z: -110, fog: '#140409', accent: GX.redBright },
  { idx: 6, id: 'creds', code: '05 / THE NEEDLE', line: 'Stamped, sealed, verified — filed at the top of the Needle.', x: 20, z: -16, fog: '#0A1430', accent: GX.blueBright },
  { idx: 7, id: 'transmissions', code: '06 / TWIN COILS', line: 'He also writes. The coils broadcast it nightly.', x: -96, z: -176, fog: '#0A0620', accent: GX.violetBright },
  { idx: 8, id: 'docks', code: '07 / GRAND MART', line: 'Kafka. Kinesis. Pub/Sub. The Mart never sleeps — every system is a stream.', x: -122, z: -40, fog: '#06122B', accent: GX.blueBright },
  { idx: 9, id: 'observatory', code: '08 / WATCHTOWER', line: 'Prometheus watches. Grafana paints. MTTR fell 40% under this roof.', x: 20, z: -126, fog: '#0B0A22', accent: GX.violetBright },
  { idx: 10, id: 'choice', code: '09 / THE WHEEL', line: 'End of the pier, operator. The wheel turns. Red or blue?', x: 160, z: -110, fog: '#0A0512', accent: GX.white },
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

export function zoneById(id: string): Zone {
  return ZONES.find(z => z.id === id) ?? ZONES[0];
}

// ── Route graph — built from street endpoints; route waypoints follow the
// street's actual pts so autopilot drives the curves. ───────────────────────
interface NodeRec { x: number; z: number; streets: number[] }
const nodeKey = (x: number, z: number) => `${Math.round(x)}:${Math.round(z)}`;
const NODE_MAP = new Map<string, NodeRec>();
STREETS.forEach((s, si) => {
  for (const end of [s.pts[0], s.pts[s.pts.length - 1]]) {
    const k = nodeKey(end[0], end[1]);
    const rec = NODE_MAP.get(k) ?? { x: end[0], z: end[1], streets: [] };
    rec.streets.push(si);
    NODE_MAP.set(k, rec);
  }
});
export const NODES: NodeRec[] = [...NODE_MAP.values()];

function nearestNodeIdx(x: number, z: number): number {
  let best = 0, bd = Infinity;
  NODES.forEach((n, i) => {
    const d = (n.x - x) ** 2 + (n.z - z) ** 2;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** BFS over street graph; returns waypoints INCLUDING curve points. */
export function routeBetween(ax: number, az: number, bx: number, bz: number): { x: number; z: number }[] {
  const start = nearestNodeIdx(ax, az);
  const goal = nearestNodeIdx(bx, bz);
  const prev = new Array<number>(NODES.length).fill(-1);
  const prevStreet = new Array<number>(NODES.length).fill(-1);
  const seen = new Set<number>([start]);
  const q = [start];
  while (q.length) {
    const cur = q.shift()!;
    if (cur === goal) break;
    for (const si of NODES[cur].streets) {
      const s = STREETS[si];
      for (const end of [s.pts[0], s.pts[s.pts.length - 1]]) {
        const ni = nearestNodeIdx(end[0], end[1]);
        if (!seen.has(ni)) { seen.add(ni); prev[ni] = cur; prevStreet[ni] = si; q.push(ni); }
      }
    }
  }
  // unwind, expanding each street's curve points
  const path: { x: number; z: number }[] = [];
  let cur = goal;
  while (cur !== start && prev[cur] !== -1) {
    const si = prevStreet[cur];
    const s = STREETS[si];
    const from = NODES[prev[cur]];
    let pts = s.pts.map(p => ({ x: p[0], z: p[1] }));
    const d0 = (pts[0].x - from.x) ** 2 + (pts[0].z - from.z) ** 2;
    const dN = (pts[pts.length - 1].x - from.x) ** 2 + (pts[pts.length - 1].z - from.z) ** 2;
    if (dN < d0) pts = pts.reverse();
    path.unshift(...pts.slice(1));
    cur = prev[cur];
  }
  path.push({ x: bx, z: bz });
  return path;
}

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

// checkpoints sit ON road segments
export const CHECKPOINTS = [
  { x: -20, z: -10 },
  { x: -70, z: -60 },
  { x: -45, z: -40 },
  { x: -45, z: -150 },
  { x: 65, z: -62 },
  { x: 110, z: -110 },
];

export const SKIP_LABEL = '[ skip — the phoenix saw that ]';
export const SKIP_QUIP = 'Skipped. The phoenix is updating your file.';

export const RANKS = [
  'BLUE-PILL TOURIST',
  'SCRIPT KIDDO',
  'CONSOLE LOGGER',
  'OPERATOR',
  'ARCHITECT',
  'ORACLE',
  'THE ONE',
] as const;

// ── Junction signposts ──────────────────────────────────────────────────────
export interface SignBoard { text: string; color: string }
export interface SignPost { x: number; z: number; boards: SignBoard[] }

export const SIGNPOSTS: SignPost[] = [
  { x: -14.5, z: 26, boards: [{ text: '▲ STATE ST · ALL DISTRICTS', color: GX.white }, { text: 'WACKER ▶ LAKE SHORE DR', color: GX.violetBright }] },
  { x: -14.5, z: -34, boards: [{ text: '◀ MADISON ▶', color: GX.blue }, { text: 'THE NEEDLE ▶', color: GX.blueBright }] },
  { x: -64.5, z: -74, boards: [{ text: '◀ SPIRE OF ERAS', color: GX.violet }] },
  { x: -14.5, z: -104, boards: [{ text: 'ANOMALY ALLEY ▶', color: GX.redBright }] },
  { x: -14.5, z: -144, boards: [{ text: 'BEAN PLAZA', color: GX.white }, { text: '◀ MONROE ▶', color: GX.blue }] },
  { x: 54, z: -24, boards: [{ text: 'CROSSBRACE TOWER ▶', color: GX.red }, { text: 'LAKE SHORE DR ▼', color: GX.violetBright }] },
  { x: 56, z: -86, boards: [{ text: 'LAKESIDE HELIX ▶', color: GX.blue }, { text: 'NAVY PIER ▼', color: GX.red }] },
  { x: 62, z: -104, boards: [{ text: 'NAVY PIER & THE WHEEL ▶', color: GX.white }] },
  { x: 14, z: -144, boards: [{ text: 'WATCHTOWER ▲', color: GX.violetBright }, { text: 'LAKE SHORE ▶', color: GX.blue }] },
  { x: -94, z: -34, boards: [{ text: '◀ GRAND MART DOCKS', color: GX.blueBright }] },
  { x: -64.5, z: -170, boards: [{ text: '◀ TWIN COILS', color: GX.violetBright }] },
];
