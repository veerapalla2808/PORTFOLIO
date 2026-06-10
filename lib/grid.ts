// lib/grid.ts — THE GRID: a playable resume.
// One horizontal world. offset (0..1) ↔ x position. Zones are soft-gated by
// the Operator's questions; centerpieces are interactive.

export const WORLD_X = 270;
export const ox = (x: number) => x / WORLD_X;

// ── Palette — comic red & blue on near-black ────────────────────────────────
export const GX = {
  bg: '#050608',
  blue: '#1E6FE6',
  blueBright: '#4D9FFF',
  blueDeep: '#0E2F66',
  red: '#E62429',
  redBright: '#FF5252',
  redDeep: '#6E0F14',
  white: '#F4F7FF',
  text: '#C9D6EE',
  dim: '#5E6E8E',
} as const;

// ── Zones ───────────────────────────────────────────────────────────────────
export interface Zone {
  idx: number;
  id: string;
  code: string;
  title: string;
  line: string;   // operator narration
  x: number;      // world anchor
  start: number;  // offset where the zone begins
}

export const ZONES: Zone[] = [
  {
    idx: 0, id: 'gate', code: '00 / JACK-IN', title: 'THE GRID',
    line: 'Welcome to the grid, operator. Scroll, drag, or use the arrows — everything here is earned.',
    x: 0, start: 0,
  },
  {
    idx: 1, id: 'identity', code: '01 / IDENTITY', title: 'IDENTITY',
    line: 'Identity verified the hard way: eleven years in production.',
    x: 40, start: ox(22),
  },
  {
    idx: 2, id: 'arsenal', code: '02 / ARSENAL', title: 'THE ARSENAL',
    line: "An arsenal isn't what you know. It's what you reach for at 3 AM.",
    x: 78, start: ox(58),
  },
  {
    idx: 3, id: 'timeline', code: '03 / TIMELINE', title: 'FIVE TOWERS',
    line: 'Five towers. Five systems. Boot them up and read his story.',
    x: 151, start: ox(96),
  },
  {
    idx: 4, id: 'anomalies', code: '04 / ANOMALIES', title: 'ANOMALIES',
    line: 'Two anomalies reached production. Click them. Watch them surrender.',
    x: 222, start: ox(203),
  },
  {
    idx: 5, id: 'choice', code: '05 / THE CHOICE', title: 'RED OR BLUE',
    line: 'Last stop, operator. Red or blue?',
    x: 252, start: ox(236),
  },
];

export function zoneAt(offset: number): Zone {
  let z = ZONES[0];
  for (const zone of ZONES) if (offset >= zone.start) z = zone;
  return z;
}

// ── World anchors ───────────────────────────────────────────────────────────
export const TOWER_X = [115, 133, 151, 169, 187];
export const ANOM_X = [215, 229];
export const PILL_X = 252;
export const CORE_X = 40;
export const RACKS_X = 78;

// ── The Operator's gates (soft): answer to decrypt the next zone ────────────
export interface Gate {
  id: string;
  unlocks: string;       // zone id
  x: number;             // where the gate terminal appears
  q: string;
  options: string[];
  correct: number;
  sass: string[];        // per-option quips for wrong answers (index-aligned)
  win: string;
}

export const GATES: Gate[] = [
  {
    id: 'g1', unlocks: 'identity', x: 26,
    q: "Production is down. It's Friday, 5:58 PM. A senior engineer's first move?",
    options: [
      'Panic, professionally',
      'Blame the intern',
      'Check what shipped at 5:55 PM',
      'Update LinkedIn',
    ],
    correct: 2,
    sass: [
      'Panic is a junior feature. It gets deprecated around year six.',
      "Bold. The intern doesn't even have deploy access.",
      '',
      "Premature. That's a Monday move.",
    ],
    win: "Correct — it's always the deploy. Decrypting IDENTITY…",
  },
  {
    id: 'g2', unlocks: 'arsenal', x: 62,
    q: 'What is the most dangerous tool in this arsenal?',
    options: [
      'rm -rf with sudo',
      "A 'quick fix' pushed straight to main",
      'Regex',
      'An unattended Jira board',
    ],
    correct: 1,
    sass: [
      'Close. But that one at least asks for a password.',
      '',
      'Now you have two problems. But not THE problem.',
      'Scary, yes. Dangerous, no.',
    ],
    win: 'Exactly. Speed kills — mostly prod. ARSENAL unlocked.',
  },
  {
    id: 'g3', unlocks: 'timeline', x: 100,
    q: "'It works on my machine.' What did the engineer actually discover?",
    options: [
      'The machine is lying',
      'Ship the machine to prod, then',
      'An environment diff is hiding somewhere',
      "QA's problem now",
    ],
    correct: 2,
    sass: [
      "Machines don't lie. They just obey too literally.",
      'Congratulations, you invented Docker. Ten years late.',
      '',
      'QA has left the chat. And the company.',
    ],
    win: 'Right — the bug was inside the env all along. TIMELINE unlocked.',
  },
  {
    id: 'g4', unlocks: 'anomalies', x: 203,
    q: "p95 latency just tripled after a 'tiny' release. Prime suspect?",
    options: [
      'Cosmic rays',
      "The tiny PR that 'couldn't possibly affect anything'",
      'DNS',
      'Mercury retrograde',
    ],
    correct: 1,
    sass: [
      'Statistically possible. Professionally unhelpful.',
      '',
      'Respect — it IS always DNS. Except today.',
      'The Operator admires your spirituality. Denied.',
    ],
    win: 'Correct. No PR is tiny. ANOMALIES unlocked.',
  },
  {
    id: 'g5', unlocks: 'choice', x: 238,
    q: 'Why hire one 11-year engineer instead of two 5.5-year engineers?',
    options: [
      'The math checks out',
      'Half the meetings',
      'Fewer Slack threads',
      "He already made the expensive mistakes — on someone else's budget",
    ],
    correct: 3,
    sass: [
      "It doesn't. That's the point.",
      'Tempting. But no.',
      'Warmer…',
      '',
    ],
    win: "Now you're thinking like a CTO. One choice remains.",
  },
];

export const SKIP_LABEL = "[ skip — I'm hiring, not gaming ]";
export const SKIP_QUIP = 'Fair. Time is a senior skill too. Unlocked.';
