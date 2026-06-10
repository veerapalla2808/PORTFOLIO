// lib/grid.ts — NEON GRID: a 3D cyberpunk flythrough résumé.
// One damped offset (0..1) moves you along a winding flight path with real
// depth — forward, sideways and vertical. Content is always open; the
// Operator's checkpoints are optional sport.

// ── Neon palette (cyberpunk: blue / red / purple / green on black) ──────────
export const GX = {
  bg: '#04050A',
  blue: '#1E6FE6', blueBright: '#4D9FFF', blueDeep: '#0E2F66',
  red: '#E62429', redBright: '#FF5252', redDeep: '#6E0F14',
  purple: '#B026FF', purpleBright: '#C964FF', purpleDeep: '#3D0E66',
  green: '#2BFF6F', greenBright: '#7DFFAB', greenDeep: '#0B5E2D',
  white: '#F4F7FF',
  text: '#C9D6EE',
  dim: '#5E6E8E',
} as const;

export const NEONS = [GX.blue, GX.purple, GX.green, GX.red] as const;

// ── Flight path — keyframes in 3D (x sways, y climbs & dives, z always deeper)
type V3 = [number, number, number];
export interface PathKey { o: number; p: V3 }

export const PATH: PathKey[] = [
  { o: 0.0, p: [0, 2, 40] },
  { o: 0.05, p: [0, 2, 18] },
  { o: 0.1, p: [0, 2, -8] },      // through the hero vortex
  { o: 0.16, p: [6, 3, -42] },    // identity plaza (right)
  { o: 0.22, p: [-4, 8, -74] },   // climb up-left
  { o: 0.28, p: [-7, 10, -104] }, // arsenal neon wall (left, high)
  { o: 0.34, p: [-2, 6, -132] },
  { o: 0.4, p: [5, 2, -158] },    // dive toward the portal run
  // portal run — five gates, weaving in x AND y
  { o: 0.45, p: [6, 2, -176] },
  { o: 0.5, p: [-6, 7, -208] },
  { o: 0.55, p: [6, 3, -240] },
  { o: 0.6, p: [-6, 9, -272] },
  { o: 0.65, p: [5, 4, -304] },
  { o: 0.7, p: [0, 5, -330] },
  { o: 0.78, p: [-6, 6, -352] },  // anomaly billboards
  { o: 0.86, p: [6, 4, -380] },
  { o: 0.93, p: [0, 3, -404] },   // rooftop of the choice
  { o: 1.0, p: [0, 2.5, -412] },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export function samplePath(o: number, out: { x: number; y: number; z: number }) {
  const c = Math.min(1, Math.max(0, o));
  let i = 0;
  while (i < PATH.length - 2 && c > PATH[i + 1].o) i++;
  const a = PATH[i], b = PATH[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (c - a.o) / (b.o - a.o || 1))));
  out.x = a.p[0] + (b.p[0] - a.p[0]) * t;
  out.y = a.p[1] + (b.p[1] - a.p[1]) * t;
  out.z = a.p[2] + (b.p[2] - a.p[2]) * t;
}

// ── World anchors ───────────────────────────────────────────────────────────
export const VORTEX = { x: 0, y: 2, z: -14 };
export const IDENTITY_SPOT = { x: 11, y: 3.4, z: -52, o: 0.16 };
export const ARSENAL_WALL = { x: -16, y: 10, z: -104, o: 0.28 };
// five era portals — the camera flies straight through each
export const PORTALS = [
  { x: 6, y: 2, z: -188, o: 0.469 },
  { x: -6, y: 7, z: -220, o: 0.519 },
  { x: 6, y: 3, z: -252, o: 0.569 },
  { x: -6, y: 9, z: -284, o: 0.619 },
  { x: 5, y: 4, z: -312, o: 0.663 },
];
export const BILLBOARDS = [
  { x: -11, y: 7, z: -360, o: 0.78 },
  { x: 11, y: 5, z: -386, o: 0.86 },
];
export const PILLS_SPOT = { x: 0, y: 2.6, z: -414, o: 0.96 };

// ── Zones (HUD narration — nothing locked, ever) ────────────────────────────
export interface Zone { idx: number; id: string; code: string; line: string; start: number }

export const ZONES: Zone[] = [
  { idx: 0, id: 'gate', code: '00 / JACK-IN', line: 'Welcome to the grid. Scroll to fly — sideways, upward, and straight into the rain.', start: 0 },
  { idx: 1, id: 'identity', code: '01 / IDENTITY', line: 'Identity verified the hard way: eleven years in production.', start: 0.13 },
  { idx: 2, id: 'arsenal', code: '02 / ARSENAL', line: "An arsenal isn't what you know. It's what you reach for at 3 AM.", start: 0.21 },
  { idx: 3, id: 'timeline', code: '03 / TIME TUNNEL', line: 'Five portals. Five eras. Fly through his timeline.', start: 0.4 },
  { idx: 4, id: 'anomalies', code: '04 / ANOMALIES', line: 'Two anomalies reached production. Click the billboards — watch them stabilize.', start: 0.72 },
  { idx: 5, id: 'choice', code: '05 / THE CHOICE', line: 'Last rooftop, operator. Red or blue?', start: 0.9 },
];

export function zoneAt(offset: number): Zone {
  let z = ZONES[0];
  for (const zone of ZONES) if (offset >= zone.start) z = zone;
  return z;
}

// ── Optional checkpoints — rotating sarcastic question pool ─────────────────
export interface Question {
  q: string;
  options: string[];
  correct: number;
  sass: string[]; // index-aligned quips for wrong picks ('' on the correct slot)
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

// checkpoint positions along the path (6 stops; questions rotate per visit)
// — slotted into the gaps between set pieces so bands never collide
export const CHECKPOINT_O = [0.125, 0.205, 0.33, 0.445, 0.72, 0.9];

export const SKIP_LABEL = '[ skip — the rabbit saw that ]';
export const SKIP_QUIP = 'Skipped. The rabbit is updating your file.';

export const RANKS = [
  'BLUE-PILL TOURIST',   // 0
  'SCRIPT KIDDO',        // 1
  'CONSOLE LOGGER',      // 2
  'OPERATOR',            // 3
  'ARCHITECT',           // 4
  'ORACLE',              // 5
  'THE ONE',             // 6
] as const;
