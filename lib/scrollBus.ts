// lib/scrollBus.ts — frame-rate navigation signals shared across the canvas
// tree without per-frame React state. Written by CameraRig, read everywhere.
export const scrollBus = {
  x: 0, z: 42,        // position on the street grid
  hx: 0, hz: -1,      // heading (unit, axis-aligned)
  speed: 0,           // recent |velocity|
  warp: 0,            // portal-crossing intensity 0..1
  // D-pad commands (written by DOM controls, consumed by CameraRig)
  cmdMove: 0,         // -1 | 0 | 1 — hold to drive
  cmdTurn: 0,         // -1 | 0 | 1 — one-shot turn request
  // auto-drive waypoints (set by the Continue button; cleared by user input)
  route: [] as { x: number; z: number }[],
  // free-flight easter egg — camera orbits the city until this timestamp
  flightUntil: 0,
  // cinematic dive intro — camera plunges into the city until this timestamp
  introUntil: 0,
  // drivable overhead camera toggle
  topView: false,
  // inside a landmark: its zone id + how deep in you are
  interior: null as string | null,
  intT: 0,
  // guide's projected screen position (QA + future UI hints)
  rabbitScreen: { x: 0, y: 0 },
};

// story bands registered for proximity fade (mutated outside React state)
export interface StoryBand { el: HTMLElement; x: number; z: number; r: number; int?: string; lastOp?: number }
export const storyBands: StoryBand[] = [];
