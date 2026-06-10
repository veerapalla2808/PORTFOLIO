// lib/scrollBus.ts — frame-rate navigation signals shared across the canvas
// tree without per-frame React state. Written by CameraRig, read everywhere.
export const scrollBus = {
  x: 0, z: 30,        // position on the street grid
  hx: 0, hz: -1,      // heading (unit, axis-aligned)
  speed: 0,           // recent |velocity|
  warp: 0,            // portal-crossing intensity 0..1
};

// story bands registered for proximity fade (mutated outside React state)
export interface StoryBand { el: HTMLElement; x: number; z: number; r: number }
export const storyBands: StoryBand[] = [];
